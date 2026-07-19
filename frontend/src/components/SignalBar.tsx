import React from "react";

interface SignalBarProps {
  name: string;
  weight: number;
  value: number;
  max?: number;
}

export const SignalBar: React.FC<SignalBarProps> = ({ name, weight, value, max = 100 }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const getBarColor = () => {
    if (percentage >= 70) return "bg-red-500";
    if (percentage >= 40) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 text-xs font-semibold text-slate-600">
        <span className="capitalize">{name.replace("_", " ")}</span>
        <span className="text-right">Weight: {weight}</span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
