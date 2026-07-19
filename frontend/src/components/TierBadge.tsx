import React from "react";

interface TierBadgeProps {
  tier: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier }) => {
  const getStyles = () => {
    switch (tier.toLowerCase()) {
      case "critical":
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
        };
      case "watch":
      case "high":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };
      case "stable":
      case "low":
      default:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };
    }
  };

  const styles = getStyles();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${styles.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      <span className="capitalize">{tier}</span>
    </span>
  );
};
