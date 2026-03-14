import React from "react";
import { useEnsReputationScore, useEnsNameAge, parseNftAvatar } from "../../hooks/useEns";
import EnsReputationBadge from "./EnsReputationBadge";
import EnsTraderStats from "./EnsTraderStats";

/**
 * EnsTraderCard — full ENS identity card used in Buy/Sell confirm modals.
 *
 * Features:
 *  A2 — Verified checkmark (forward + reverse resolution match)
 *  A1 — Name age badge ("Veteran" if registered ≥ 1 year)
 *  A4 — NFT avatar collection badge (BAYC, Azuki, CryptoPunks, etc.)
 *  A6 — Farcaster and Lens social profile links
 *  ——  settlex.prefs decentralized trade preferences panel
 *  ——  Trust score badge (EnsReputationBadge)
 */
function EnsTraderCard({ address, label = "Trader" }) {
  const { ensName, avatar, isVerified, textRecords, prefs, isLoading } =
    useEnsReputationScore(address);

  // A1: Name age from ENS subgraph
  const { nameAge, isVeteran } = useEnsNameAge(ensName);

  // A4: Detect NFT avatar
  const nftCollection = parseNftAvatar(textRecords?.avatar_raw);

  if (!address) return null;

  const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  const displayName = ensName || shortAddress;

  return (
    <div className="flex flex-col gap-y-3">

      {/* Row 1: Avatar + Name + Badges + Trust Score */}
      <div className="flex items-start justify-between gap-x-3">
        <div className="flex items-center gap-x-3">
          {/* Avatar */}
          {avatar ? (
            <img
              src={avatar}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary1000 to-success300 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">
                {displayName.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-y-[3px]">
            {/* Name + Verified checkmark (A2) */}
            <div className="flex items-center gap-x-1 flex-wrap gap-y-1">
              <p className="text-sm font-semibold text-baseWhiteDark dark:text-baseWhite leading-tight">
                {displayName}
              </p>
              {isVerified && (
                <svg
                  className="w-[13px] h-[13px] text-emerald-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  title="ENS Verified — forward and reverse resolution match"
                >
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            </div>

            {/* Short address + extra badges row */}
            <div className="flex items-center gap-x-[6px] flex-wrap gap-y-1">
              {ensName && (
                <span className="text-[10px] text-gray500 dark:text-gray500Dark">
                  {shortAddress}
                </span>
              )}
              {/* A1: Veteran badge */}
              {isVeteran && nameAge !== null && (
                <span
                  className="text-[9px] font-semibold px-[5px] py-[1px] rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500"
                  title={`ENS name registered ${nameAge} year${nameAge !== 1 ? "s" : ""} ago`}
                >
                  ⭐ {nameAge}yr veteran
                </span>
              )}
              {/* A4: NFT avatar badge */}
              {nftCollection && (
                <span
                  className="text-[9px] font-semibold px-[5px] py-[1px] rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400"
                  title={`ENS avatar is a ${nftCollection} NFT`}
                >
                  🖼 {nftCollection}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Trust score badge */}
        {ensName && !isLoading && (
          <EnsReputationBadge address={address} compact={false} className="flex-shrink-0" />
        )}
      </div>

      {/* Row 2: Social links — A6 includes Farcaster + Lens */}
      {ensName && (
        <div className="flex items-center gap-x-3 flex-wrap gap-y-1">
          {textRecords?.twitter && (
            <a
              href={`https://twitter.com/${textRecords.twitter}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-x-1 text-[11px] font-medium text-gray500 dark:text-gray500Dark hover:text-baseWhiteDark dark:hover:text-baseWhite transition-colors"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @{textRecords.twitter}
            </a>
          )}
          {textRecords?.github && (
            <a
              href={`https://github.com/${textRecords.github}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-x-1 text-[11px] font-medium text-gray500 dark:text-gray500Dark hover:text-baseWhiteDark dark:hover:text-baseWhite transition-colors"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {textRecords.github}
            </a>
          )}
          {/* A6: Farcaster */}
          {textRecords?.farcaster && (
            <a
              href={`https://warpcast.com/${textRecords.farcaster}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-x-1 text-[11px] font-medium text-gray500 dark:text-gray500Dark hover:text-purple-400 transition-colors"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.667 0h.666C18.925 0 24 5.074 24 11.667v.666C24 18.925 18.926 24 11.333 24h-.666C4.074 24 0 18.926 0 12.333v-.666C0 5.074 5.074 0 11.667 0zm-1.247 6.667H7.333v10.666h3.087v-4h3.16v4h3.087V6.667h-3.087v3.733h-3.16V6.667z" />
              </svg>
              {textRecords.farcaster}
            </a>
          )}
          {/* A6: Lens Protocol */}
          {textRecords?.lens && (
            <a
              href={`https://hey.xyz/u/${textRecords.lens.replace("@", "")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-x-1 text-[11px] font-medium text-gray500 dark:text-gray500Dark hover:text-green-400 transition-colors"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 16c-3.314 0-6.25-1.686-8-4.254C4.022 13.327 7.824 12 12 12s7.978 1.327 8 3.746C18.25 18.314 15.314 20 12 20z" />
              </svg>
              {textRecords.lens}
            </a>
          )}
          {textRecords?.discord && (
            <span className="flex items-center gap-x-1 text-[11px] font-medium text-gray500 dark:text-gray500Dark">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              {textRecords.discord}
            </span>
          )}
          {textRecords?.telegram && (
            <a
              href={`https://t.me/${textRecords.telegram}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-x-1 text-[11px] font-medium text-gray500 dark:text-gray500Dark hover:text-baseWhiteDark dark:hover:text-baseWhite transition-colors"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              {textRecords.telegram}
            </a>
          )}
        </div>
      )}

      {/* Row 3: settlex.prefs — decentralized OTC preferences from ENS */}
      {prefs && (
        <div className="rounded-xl border border-theme-green/25 bg-theme-green/5 px-3 py-[10px]">
          <p className="text-[10px] font-semibold text-theme-green uppercase tracking-wider mb-[6px] flex items-center gap-x-1">
            <svg className="w-[10px] h-[10px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            ENS Trading Preferences
          </p>
          <div className="flex flex-col gap-y-[5px]">
            {prefs.tokens && Array.isArray(prefs.tokens) && (
              <div className="flex items-center gap-x-2">
                <span className="text-[10px] text-gray500 dark:text-gray500Dark w-16 flex-shrink-0">Prefers</span>
                <div className="flex gap-x-1 flex-wrap">
                  {prefs.tokens.map((t) => (
                    <span key={t} className="text-[10px] font-semibold px-[6px] py-[1px] rounded-full bg-theme-green/15 text-theme-green">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(prefs.min || prefs.max) && (
              <div className="flex items-center gap-x-2">
                <span className="text-[10px] text-gray500 dark:text-gray500Dark w-16 flex-shrink-0">Deal size</span>
                <span className="text-[10px] font-medium text-baseWhiteDark dark:text-baseWhite">
                  {prefs.min ? `$${Number(prefs.min).toLocaleString()}` : "any"}
                  {" – "}
                  {prefs.max ? `$${Number(prefs.max).toLocaleString()}` : "any"}
                </span>
              </div>
            )}
            {prefs.note && (
              <div className="flex items-start gap-x-2">
                <span className="text-[10px] text-gray500 dark:text-gray500Dark w-16 flex-shrink-0">Note</span>
                <span className="text-[10px] font-medium text-baseWhiteDark dark:text-baseWhite italic">
                  "{prefs.note}"
                </span>
              </div>
            )}
          </div>
          <p className="text-[9px] text-gray500 dark:text-gray500Dark mt-[6px]">
            Set via ENS text record · stored on Ethereum
          </p>
        </div>
      )}

      {/* Row 4: On-chain trading stats — Feature 3 */}
      {ensName && <EnsTraderStats address={address} />}
    </div>
  );
}

export default EnsTraderCard;
