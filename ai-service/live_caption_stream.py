#!/usr/bin/env python3
"""Low-latency live caption prototype using faster-whisper over WebSockets.

This prototype accepts raw PCM chunks over a WebSocket, buffers them, and runs a
rolling transcription window every ~1-2 seconds. The VAD settings are tuned for
low latency and fast turn-taking rather than high-accuracy offline transcription.

Expected audio input:
- 16 kHz
- mono
- 16-bit PCM

Usage examples:
  python live_caption_stream.py --mode server
  python live_caption_stream.py --mode file --wav-file sample.wav
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import time
from collections import deque
from typing import Any

import numpy as np
import websockets
from faster_whisper import WhisperModel


def _resolve_device(device: str) -> str:
    if device == "auto":
        return "cuda" if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu"
    return device


def _vad_params() -> dict[str, Any]:
    """Low-latency VAD tuned for captioning speed.

    These values prioritize quick speech detection and short turn boundaries over
    a very conservative "silence before finalizing" wait.
    """
    return {
        "threshold": 0.5,
        "min_silence_duration_ms": 200,
        "speech_pad_ms": 120,
        "min_speech_duration_ms": 250,
    }


class LiveCaptionStreamer:
    def __init__(
        self,
        model_size: str = "small",
        device: str = "auto",
        sample_rate: int = 16000,
        window_seconds: float = 4.0,
        max_buffer_seconds: float = 60.0,
    ) -> None:
        resolved_device = _resolve_device(device)
        compute_type = "int8_float16" if resolved_device == "cuda" else "int8"

        self.model = WhisperModel(
            model_size_or_path=model_size,
            device=resolved_device,
            compute_type=compute_type,
            local_files_only=False,
        )
        self.sample_rate = sample_rate
        self.window_seconds = window_seconds
        self.max_buffer_seconds = max_buffer_seconds
        self.buffer = bytearray()
        self.last_texts: deque[str] = deque(maxlen=6)
        self.last_emit_time = 0.0

    def _trim_buffer(self) -> None:
        max_bytes = int(self.sample_rate * self.max_buffer_seconds * 2)
        if len(self.buffer) > max_bytes:
            overflow = len(self.buffer) - max_bytes
            del self.buffer[:overflow]

    def _transcribe_window(self, audio: np.ndarray) -> list[dict[str, float | str]]:
        segments, _info = self.model.transcribe(
            audio,
            beam_size=1,
            best_of=1,
            language="en",
            task="transcribe",
            temperature=0.0,
            condition_on_previous_text=False,
            vad_filter=True,
            vad_parameters=_vad_params(),
            word_timestamps=False,
            without_timestamps=False,
            fp16=False,
        )

        captions: list[dict[str, float | str]] = []
        for segment in segments:
            text = segment.text.strip()
            if not text:
                continue

            canonical = text.lower()
            if canonical in {t.lower() for t in self.last_texts}:
                continue

            self.last_texts.append(text)
            captions.append(
                {
                    "text": text,
                    "start": round(float(segment.start), 2),
                    "end": round(float(segment.end), 2),
                }
            )

        return captions

    def push(self, chunk: bytes) -> list[dict[str, float | str]]:
        if not chunk:
            return []

        self.buffer.extend(chunk)
        self._trim_buffer()

        # Process only the newest rolling window for low latency. This prevents
        # unbounded memory growth and keeps 20-30 minute sessions responsive.
        keep_bytes = int(self.sample_rate * self.window_seconds * 2)
        if len(self.buffer) < keep_bytes:
            return []

        recent = bytes(self.buffer[-keep_bytes:])
        self.buffer = bytearray(recent)
        audio = np.frombuffer(recent, dtype=np.int16).astype(np.float32) / 32768.0

        return self._transcribe_window(audio)


async def websocket_server(host: str, port: int) -> None:
    async def handler(websocket: websockets.WebSocketServerProtocol) -> None:
        streamer = LiveCaptionStreamer(model_size="small", device="auto")
        print(f"Client connected: {websocket.remote_address}")

        async def _safe_send(payload: str) -> None:
            try:
                await websocket.send(payload)
            except Exception as exc:  # pragma: no cover - streaming demo only
                print(f"WebSocket send failed: {exc}")

        try:
            async for raw in websocket:
                if isinstance(raw, str):
                    if raw == "ping":
                        await websocket.send(json.dumps({"type": "pong"}))
                    continue

                captions = streamer.push(raw)
                for caption in captions:
                    payload = json.dumps(
                        {
                            "type": "caption",
                            "text": caption["text"],
                            "start": caption["start"],
                            "end": caption["end"],
                        }
                    )
                    await _safe_send(payload)
        except Exception as exc:  # pragma: no cover - streaming demo only
            print(f"Socket error: {exc}")

    async with websockets.serve(handler, host, port):
        print(f"Live caption server listening on ws://{host}:{port}")
        await asyncio.Future()


async def send_wav_file_to_server(wav_path: str, host: str, port: int, chunk_ms: int = 250) -> None:
    import wave

    with wave.open(wav_path, "rb") as wf:
        if wf.getnchannels() != 1 or wf.getsampwidth() != 2:
            raise ValueError("This demo expects mono 16-bit PCM WAV input.")

        if wf.getframerate() != 16000:
            raise ValueError("This demo expects 16 kHz WAV input.")

        async with websockets.connect(f"ws://{host}:{port}") as ws:
            total_frames = wf.getnframes()
            frame_size = int((wf.getframerate() * chunk_ms) / 1000.0)
            frame_size = max(frame_size, 1)

            while True:
                chunk = wf.readframes(frame_size)
                if not chunk:
                    break
                await ws.send(chunk)
                await asyncio.sleep(chunk_ms / 1000.0)

            print(f"Sent {total_frames} frames from {wav_path} to the live-caption websocket.")
            await ws.send("done")


async def main() -> None:
    parser = argparse.ArgumentParser(description="Prototype live-caption streaming with faster-whisper.")
    parser.add_argument("--mode", choices=["server", "file"], default="server")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--wav-file", help="WAV file to stream to the server for testing")
    parser.add_argument("--chunk-ms", type=int, default=250, help="Chunk duration in milliseconds")
    parser.add_argument("--model-size", default="small")
    parser.add_argument("--device", default="auto")
    parser.add_argument("--max-buffer-seconds", type=float, default=60.0, help="Maximum rolling audio buffer to retain before trimming")
    args = parser.parse_args()

    if args.mode == "file":
        if not args.wav_file:
            raise SystemExit("--wav-file is required when --mode file is used.")
        streamer = LiveCaptionStreamer(model_size=args.model_size, device=args.device)
        _ = streamer  # keep the object warm for the first decode if needed
        await send_wav_file_to_server(args.wav_file, args.host, args.port, chunk_ms=args.chunk_ms)
        return

    await websocket_server(args.host, args.port)


if __name__ == "__main__":
    asyncio.run(main())
