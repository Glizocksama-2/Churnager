import React, { useState } from "react";

interface NarrationCardProps {
  narration: string;
}

export const NarrationCard: React.FC<NarrationCardProps> = ({ narration }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(narration);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-800 tracking-tight">WhatsApp Notification Copy</h3>
        <button
          onClick={copyToClipboard}
          className="text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:border-accent bg-white text-slate-700 hover:text-accent font-medium transition"
        >
          {copied ? "Copied" : "Copy Message"}
        </button>
      </div>
      <div className="text-sm text-slate-700 leading-relaxed font-mono bg-white border border-slate-100 p-4 rounded-2xl whitespace-pre-wrap">
        {narration}
      </div>
    </div>
  );
};
