import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share2,
  Users,
  MessageSquare,
  Subtitles,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Disc,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Meeting } from '../types';

interface Props {
  isOpen: boolean;
  meetingTitle: string;
  meetingId: string;
  initialMic: boolean;
  initialCamera: boolean;
  onEndMeeting: (generatedMeetingData?: Partial<Meeting>) => void;
}

export const LiveMeetingStageModal: React.FC<Props> = ({
  isOpen,
  meetingTitle,
  meetingId,
  initialMic,
  initialCamera,
  onEndMeeting,
}) => {
  const { user } = useAuth();
  const [micOn, setMicOn] = useState(initialMic);
  const [cameraOn, setCameraOn] = useState(initialCamera);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(48); // start with realistic seconds

  // Live streaming captions stream simulation
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0);
  const liveCaptions = [
    { speaker: user?.name || 'Trisha Moharle', text: 'Welcome to this session. We are verifying the deployment schedule and SCIM directory sync.', color: '#00F5D4' },
    { speaker: 'David Chen', text: 'The staging test passed successfully. We confirmed sub-second response times on the webhook event bus.', color: '#F59E0B' },
    { speaker: 'Elena Rostova', text: 'GPU speech inference cluster is running Whisper large-v3 with 1.18s diarization latency.', color: '#A855F7' },
    { speaker: 'Mohan Moharle', text: 'Enterprise tenants have been notified about the scheduled cutover before end of month.', color: '#2563EB' },
    { speaker: user?.name || 'Trisha Moharle', text: 'Excellent. Let’s ratify this decision and disseminate the minutes through the HITL editor.', color: '#00F5D4' },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);

    const captionTimer = setInterval(() => {
      setCurrentCaptionIndex((prev) => (prev + 1) % liveCaptions.length);
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(captionTimer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://meetsync.ai/m/${meetingId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleFinishAndGenerate = () => {
    const formattedDuration = `${Math.max(1, Math.round(secondsElapsed / 60))}m`;
    onEndMeeting({
      title: meetingTitle || `Live Executive Sync (${meetingId})`,
      duration: formattedDuration,
      attendees: [user?.name || 'Trisha Moharle', 'David Chen', 'Elena Rostova', 'Mohan Moharle'],
      department: 'Product & Engineering',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md select-none p-3 sm:p-6">
      <div className="w-full max-w-6xl h-[88vh] rounded-2xl bg-[#0B132B] border border-[#334155] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Zoom-Style Header Bar */}
        <div className="h-14 px-4 sm:px-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#070D1F]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 text-xs font-mono font-bold animate-pulse">
              <Disc className="w-3.5 h-3.5" />
              <span>REC</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {meetingTitle || 'Instant Executive Session'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Session ID: <span className="font-mono text-cyan-400 font-semibold">{meetingId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="font-mono text-xs tabular-nums text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {formatTimer(secondsElapsed)}
            </span>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Copy meeting invite link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Invite'}</span>
            </button>
          </div>
        </div>

        {/* Video Stage Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#0B132B] overflow-y-auto">
          {/* User Tile */}
          <div className="rounded-xl border border-slate-800 bg-[#131F37] relative flex flex-col items-center justify-center p-4 overflow-hidden group">
            {cameraOn ? (
              <div className="w-full h-full rounded-lg bg-gradient-to-tr from-slate-900 via-slate-800 to-sky-950 flex flex-col items-center justify-center relative">
                <div className="w-20 h-20 rounded-full border-2 border-[#00F5D4] flex items-center justify-center font-bold text-2xl text-slate-950 shadow-lg shadow-[#00F5D4]/20" style={{ backgroundColor: user?.avatarColor || '#00F5D4' }}>
                  {user?.initials || 'TM'}
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-emerald-400 font-mono">
                  1080p HD
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl text-slate-950 shadow-md" style={{ backgroundColor: user?.avatarColor || '#00F5D4' }}>
                {user?.initials || 'TM'}
              </div>
            )}

            {/* Bottom Tag */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
              <span className="font-semibold text-white truncate">{user?.name || 'You (Host)'}</span>
              <div className="flex items-center gap-1">
                {micOn ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
              </div>
            </div>
          </div>

          {/* Participant 2: David Chen */}
          <div className="rounded-xl border border-slate-800 bg-[#131F37] relative flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-[#F59E0B] flex items-center justify-center font-bold text-2xl text-slate-950 shadow-md">
              DC
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
              <span className="font-semibold text-white">David Chen (Backend Lead)</span>
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Participant 3: Elena Rostova */}
          <div className="rounded-xl border border-slate-800 bg-[#131F37] relative flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-[#A855F7] flex items-center justify-center font-bold text-2xl text-slate-950 shadow-md">
              ER
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
              <span className="font-semibold text-white">Elena Rostova (Staff AI)</span>
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Participant 4: Mohan Moharle */}
          <div className="rounded-xl border border-slate-800 bg-[#131F37] relative flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-[#2563EB] flex items-center justify-center font-bold text-2xl text-white shadow-md">
              MM
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
              <span className="font-semibold text-white">Mohan Moharle (Admin)</span>
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Live Streaming Speech-to-Text Caption Bar */}
        {captionsOn && (
          <div className="px-6 py-2.5 bg-black/80 border-t border-slate-800 flex items-center gap-3 text-xs shrink-0 transition-all">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-950 border border-sky-600/50 text-sky-400 font-mono text-[10px] shrink-0 font-bold">
              <Subtitles className="w-3 h-3" />
              <span>LIVE DIARIZATION</span>
            </div>
            <div className="flex-1 truncate">
              <span className="font-bold mr-2" style={{ color: liveCaptions[currentCaptionIndex].color }}>
                {liveCaptions[currentCaptionIndex].speaker}:
              </span>
              <span className="text-slate-200">{liveCaptions[currentCaptionIndex].text}</span>
            </div>
          </div>
        )}

        {/* Bottom Zoom-Style Controls Bar */}
        <div className="h-18 px-4 sm:px-6 bg-[#070D1F] border-t border-slate-800 flex items-center justify-between shrink-0">
          {/* Audio & Video Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                micOn ? 'text-slate-200 hover:bg-slate-800' : 'bg-red-950/80 text-red-400 border border-red-700/60'
              }`}
            >
              {micOn ? <Mic className="w-5 h-5 text-emerald-400" /> : <MicOff className="w-5 h-5 text-red-400" />}
              <span className="text-[10px] font-medium">{micOn ? 'Mute' : 'Unmute'}</span>
            </button>

            <button
              onClick={() => setCameraOn(!cameraOn)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                cameraOn ? 'text-slate-200 hover:bg-slate-800' : 'bg-red-950/80 text-red-400 border border-red-700/60'
              }`}
            >
              {cameraOn ? <Video className="w-5 h-5 text-sky-400" /> : <VideoOff className="w-5 h-5 text-red-400" />}
              <span className="text-[10px] font-medium">{cameraOn ? 'Stop Video' : 'Start Video'}</span>
            </button>
          </div>

          {/* Secondary Controls: Share, Participants, Captions */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => setScreenSharing(!screenSharing)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                screenSharing ? 'text-[#00F5D4] bg-slate-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Share2 className="w-5 h-5" />
              <span className="text-[10px] font-medium">Share</span>
            </button>

            <button
              onClick={() => setCaptionsOn(!captionsOn)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                captionsOn ? 'text-[#00F5D4]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Subtitles className="w-5 h-5" />
              <span className="text-[10px] font-medium">Captions</span>
            </button>

            <button className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-white transition-colors">
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-medium">4 People</span>
            </button>
          </div>

          {/* End Call / Generate MOM */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFinishAndGenerate}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#EF4444] text-white hover:bg-red-600 shadow-md shadow-red-900/30 transition-all active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End & Generate MOM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
