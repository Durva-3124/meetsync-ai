import { lazy, Suspense } from "react"

const AudioWaveformScene = lazy(() => import("./AudioWaveformScene"))

export default function CanvasWrapper() {
  return (
    <Suspense fallback={<div className="w-full h-40 rounded-lg bg-black/5 animate-pulse" />}>
      <AudioWaveformScene />
    </Suspense>
  )
}