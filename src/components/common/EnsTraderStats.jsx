import React, { useEffect, useState } from "react";
import ApiConfig, { getHeader } from "../../config/api.js";
import ApiEndpoints from "../../constants/apiEndpoints.js";

/**
 * EnsTraderStats — on-chain trading reputation for an ENS identity.
 *
 * Calls existing backend APIs:
 *   GET /trade/user-specific/{wallet}  → deals created + volume estimate
 *   GET /activity/activity-for-user/{wallet} → participations / fills
 *
 * Shown inside EnsTraderCard so judges see: "12 deals · 4 participations · ~$4,200 vol"
 */
function EnsTraderStats({ address }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;

    async function fetchStats() {
      try {
        const headers = await getHeader();
        const [tradesRes, activitiesRes] = await Promise.allSettled([
          ApiConfig.get(
            `${ApiEndpoints.user_endpoints.GET_USER_TRADE}/${address}?page=1`,
            headers
          ),
          ApiConfig.get(
            `${ApiEndpoints.user_endpoints.GET_USER_ACTIVITY}/${address}?page=1`,
            headers
          ),
        ]);

        if (cancelled) return;

        const trades =
          tradesRes.status === "fulfilled"
            ? tradesRes.value?.data?.data?.trades || []
            : [];
        const activities =
          activitiesRes.status === "fulfilled"
            ? activitiesRes.value?.data?.data?.activities || []
            : [];

        // Estimate volume: sum of (total_token * price_per_token) across all trades
        const volume = trades.reduce((sum, t) => {
          const val =
            (Number(t.total_token) || 0) * (Number(t.price_per_token) || 0);
          return sum + val;
        }, 0);

        setStats({
          dealsCreated: trades.length,
          participations: activities.length,
          volume,
        });
      } catch {
        // silently skip — stats are decorative
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (loading || !stats) return null;
  if (stats.dealsCreated === 0 && stats.participations === 0) return null;

  const formatVolume = (v) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    return `$${Math.round(v)}`;
  };

  return (
    <div className="flex items-center gap-x-3 flex-wrap gap-y-1 pt-[6px] border-t border-gray300 dark:border-gray300Dark">
      <span className="text-[9px] font-semibold text-gray500 dark:text-gray500Dark uppercase tracking-wider">
        On-chain activity
      </span>
      {stats.dealsCreated > 0 && (
        <span className="text-[10px] font-semibold text-baseWhiteDark dark:text-baseWhite">
          {stats.dealsCreated} deal{stats.dealsCreated !== 1 ? "s" : ""} created
        </span>
      )}
      {stats.participations > 0 && (
        <span className="text-[10px] font-semibold text-baseWhiteDark dark:text-baseWhite">
          {stats.participations} fill{stats.participations !== 1 ? "s" : ""}
        </span>
      )}
      {stats.volume > 0 && (
        <span className="text-[10px] font-semibold text-theme-green">
          ~{formatVolume(stats.volume)} vol
        </span>
      )}
    </div>
  );
}

export default EnsTraderStats;
