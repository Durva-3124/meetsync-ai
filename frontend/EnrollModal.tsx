import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Award, ArrowRight } from 'lucide-react';

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmEnroll: () => void;
}

export const EnrollModal: React.FC<EnrollModalProps> = ({
  isOpen,
  onClose,
  onConfirmEnroll,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'cert'>('trial');
  const [enrolled, setEnrolled] = useState(false);

  if (!isOpen) return null;

  const handleEnroll = () => {
    setEnrolled(true);
    setTimeout(() => {
      onConfirmEnroll();
      setEnrolled(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#D1D5DB] max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#0056D2] text-white flex items-center justify-center font-bold">
              M
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1F1F1F]">
                Enroll in MeetSync AI Professional Certificate
              </h3>
              <p className="text-xs text-[#6B7280]">
                4-course series with hands-on labs and career credential
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#9CA3AF] hover:text-[#1F1F1F] hover:bg-[#E5E7EB] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {/* Option 1: Full Specialization */}
            <div
              onClick={() => setSelectedPlan('trial')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                selectedPlan === 'trial'
                  ? 'border-[#0056D2] bg-[#F0F5FF]'
                  : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'trial' ? 'border-[#0056D2]' : 'border-gray-400'}`}>
                    {selectedPlan === 'trial' && <div className="w-2 h-2 rounded-full bg-[#0056D2]" />}
                  </div>
                  <span className="font-bold text-sm text-[#1F1F1F]">7-Day Free Trial</span>
                </div>
                <span className="text-xs font-bold text-[#0056D2]">$49 / month after trial</span>
              </div>
              <p className="text-xs text-[#4B5563] mt-2 ml-6">
                Unlimited access to all 4 courses, interactive meeting workspace labs, automated grading, and official shareable certificate.
              </p>
            </div>

            {/* Option 2: Free Audit */}
            <div
              onClick={() => setSelectedPlan('cert')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                selectedPlan === 'cert'
                  ? 'border-[#0056D2] bg-[#F0F5FF]'
                  : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'cert' ? 'border-[#0056D2]' : 'border-gray-400'}`}>
                    {selectedPlan === 'cert' && <div className="w-2 h-2 rounded-full bg-[#0056D2]" />}
                  </div>
                  <span className="font-bold text-sm text-[#1F1F1F]">Audit the Courses (Free)</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600">100% Free</span>
              </div>
              <p className="text-xs text-[#4B5563] mt-2 ml-6">
                Access all course lecture materials and interactive transcripts. Does not include graded assignments or verified certificate.
              </p>
            </div>
          </div>

          <div className="pt-2 text-xs text-[#6B7280] space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Cancel anytime in your settings with zero penalty</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0056D2] shrink-0" />
              <span>Financial aid is available for eligible learners</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 pt-0">
          <button
            onClick={handleEnroll}
            disabled={enrolled}
            className="w-full bg-[#0056D2] hover:bg-[#00419E] text-white font-bold text-sm py-3.5 rounded transition shadow-md flex items-center justify-center gap-2"
          >
            {enrolled ? (
              <>
                <CheckCircle2 className="w-4 h-4 animate-bounce" />
                <span>Enrolling & Setting Up Workspace...</span>
              </>
            ) : (
              <>
                <span>Start Learning Now</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
