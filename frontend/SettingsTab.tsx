import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Bell,
  HardDrive,
  Cpu,
  Key,
  Database,
  Check,
  Save,
} from 'lucide-react';

interface SettingsTabProps {
  onSave: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onSave }) => {
  const [minConfidence, setMinConfidence] = useState<number>(90);
  const [autoVerifyThreshold, setAutoVerifyThreshold] = useState<number>(95);
  const [exportFormat, setExportFormat] = useState<string>('markdown');
  const [slackIntegration, setSlackIntegration] = useState<boolean>(true);
  const [jiraIntegration, setJiraIntegration] = useState<boolean>(true);
  const [linearIntegration, setLinearIntegration] = useState<boolean>(false);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = () => {
    setSaved(true);
    onSave();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#00876A] dark:text-[#00F9C7] drop-shadow-[0_0_12px_rgba(0,249,199,0.35)]">
          Platform Configuration & Security
        </h1>
        <p className="mt-1 text-sm font-medium opacity-90 text-[#00634E] dark:text-[#70E4D3]">
          Fine-tune RAG confidence thresholds, automated HITL escalation triggers, and enterprise connectors
        </p>
      </div>

      {/* Card 1: RAG & NLP Verification Thresholds */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md ring-1 ring-blue-500/30 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-[#1D70F5]/10 text-[#1D70F5]">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              AI Verification & HITL Sensitivity
            </h2>
            <p className="text-xs text-slate-400">
              Control when human-in-the-loop review is required vs auto-verified
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>Minimum Decision Extraction Confidence ({minConfidence}%)</span>
              <span className="font-mono text-[#1D70F5] font-extrabold">{minConfidence}%</span>
            </div>
            <input
              type="range"
              min={70}
              max={99}
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="mt-2 w-full h-2 rounded-lg bg-slate-800 accent-[#1D70F5] cursor-pointer"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Decisions with confidence below this threshold will require mandatory peer review before publishing.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>Auto-Approval Vector Threshold ({autoVerifyThreshold}%)</span>
              <span className="font-mono text-emerald-400 font-extrabold">{autoVerifyThreshold}%</span>
            </div>
            <input
              type="range"
              min={80}
              max={99}
              value={autoVerifyThreshold}
              onChange={(e) => setAutoVerifyThreshold(Number(e.target.value))}
              className="mt-2 w-full h-2 rounded-lg bg-slate-800 accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Enterprise Integrations */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md ring-1 ring-blue-500/30 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Enterprise Workstream Connectors
            </h2>
            <p className="text-xs text-slate-400">
              Automatically sync action items and published MOM to issue trackers
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-xs font-bold text-slate-100">Jira Software Cloud</div>
              <div className="text-[11px] text-slate-400">Auto-create sprint issues from approved action items</div>
            </div>
            <input
              type="checkbox"
              checked={jiraIntegration}
              onChange={(e) => setJiraIntegration(e.target.checked)}
              className="h-4 w-4 accent-[#1D70F5] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-xs font-bold text-slate-100">Slack Notifications</div>
              <div className="text-[11px] text-slate-400">Post finalized MOM summary to #executive-sync channel</div>
            </div>
            <input
              type="checkbox"
              checked={slackIntegration}
              onChange={(e) => setSlackIntegration(e.target.checked)}
              className="h-4 w-4 accent-[#1D70F5] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-xs font-bold text-slate-100">Linear App Sync</div>
              <div className="text-[11px] text-slate-400">Direct two-way synchronization for engineering teams</div>
            </div>
            <input
              type="checkbox"
              checked={linearIntegration}
              onChange={(e) => setLinearIntegration(e.target.checked)}
              className="h-4 w-4 accent-[#1D70F5] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 rounded-xl bg-[#1D70F5] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#165fd4] transition min-h-[44px]"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{saved ? 'Settings Saved' : 'Save Configuration'}</span>
        </button>
      </div>
    </div>
  );
};
