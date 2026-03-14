import React from "react";
import { useEnsReputationScore } from "../../hooks/useEns";

const TIER = {
  verified: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    label: "Verified Trader",
    dot: "bg-emerald-500",
  },
  active: {
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
    label: "Active Trader",
    dot: "bg-blue-400",
  },
  basic: {
    color: "text-gray-400",
    bg: "bg-gray-400/10",
    border: "border-gray-400/30",
    label: "Basic Profile",
    dot: "bg-gray-400",
  },
  anon: {
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    label: "Anonymous",
    dot: "bg-gray-500",
  },
};

const ShieldIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

/**
 * EnsReputationBadge — shows ENS-based trust score for a trader.
 *
 * compact=true  → tiny pill badge (for trade cards)
 * compact=false → wider badge with label (for sidebar / modals)
 */
function EnsReputationBadge({ address, compact = false, className = "" }) {
  const { score, tier, ensName, isLoading } = useEnsReputationScore(address);

  // Only show badge for addresses that have an ENS name
  if (!address || isLoading || !ensName) return null;

  const cfg = TIER[tier];

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-x-1 px-[5px] py-[2px] rounded-full border text-[10px] font-semibold ${cfg.bg} ${cfg.border} ${cfg.color} ${className}`}
        title={`ENS Trust Score: ${score}/100 — ${cfg.label}`}
      >
        <ShieldIcon className="w-[9px] h-[9px]" />
        {score}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-x-[10px] px-3 py-2 rounded-xl border ${cfg.bg} ${cfg.border} ${className}`}
    >
      <ShieldIcon className={`w-5 h-5 flex-shrink-0 ${cfg.color}`} />
      <div>
        <p className={`text-sm font-semibold leading-tight ${cfg.color}`}>
          {cfg.label}
        </p>
        <p className="text-xs text-gray500 dark:text-gray500Dark">
          ENS Score: {score}/100
        </p>
      </div>
    </div>
  );
}

export default EnsReputationBadge;
