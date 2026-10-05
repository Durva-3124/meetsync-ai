import React from 'react';
import { X, Award, CheckCircle2, Share2, Download, ExternalLink, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  onShare,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#D1D5DB] max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar */}
        <div className="p-4 px-6 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0056D2]">
            <Award className="w-4 h-4" />
            <span>VERIFIED PROFESSIONAL CREDENTIAL</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#9CA3AF] hover:text-[#1F1F1F] hover:bg-[#E5E7EB] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Canvas Frame */}
        <div className="p-8 bg-[#FAFAFA] flex items-center justify-center">
          <div className="w-full bg-white border-8 border-double border-[#E5E7EB] p-8 shadow-md rounded-md relative text-center space-y-4">
            
            {/* Top Seal */}
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-[#0056D2] text-white flex items-center justify-center font-bold text-2xl shadow-sm ring-4 ring-[#EBF3FF]">
                M
              </div>
            </div>

            <div className="text-xs uppercase tracking-widest text-[#6B7280] font-bold">
              MeetSync Institute of Meeting Intelligence
            </div>

            <div className="text-xs text-[#4B5563]">
              This is to certify that
            </div>

            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1F1F1F] tracking-tight">
              Elena Rostova
            </div>

            <div className="text-xs text-[#4B5563] max-w-md mx-auto leading-relaxed">
              has successfully completed with distinction the rigorous curriculum and interactive laboratory assessments in
            </div>

            <div className="text-base sm:text-lg font-bold text-[#0056D2]">
              Foundations of Meeting Diarization & Speech Processing
            </div>

            <div className="text-[11px] text-[#6B7280]">
              An authorized 4-course Specialization offered through MeetSync AI Learning
            </div>

            {/* Verification Footer Inside Certificate */}
            <div className="pt-6 mt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6B7280] gap-4">
              <div className="text-left">
                <div className="font-mono text-[#1F1F1F] font-bold">Credential ID: CERT-MS-884920</div>
                <div>Issued: September 28, 2026</div>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Cryptographic Hash</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="p-4 px-6 border-t border-[#E5E7EB] bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#6B7280]">
            Verified link: <span className="font-mono text-[#0056D2]">meetsync.corp/verify/CERT-MS-884920</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold rounded shadow-xs transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to LinkedIn</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6] text-xs font-semibold rounded transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
