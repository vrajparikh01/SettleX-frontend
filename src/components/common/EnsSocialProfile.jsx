import React from "react";
import { useEnsProfile, useEnsTextRecords } from "../../hooks/useEns";

/**
 * EnsSocialProfile Component - Displays ENS name with avatar and social links
 * @param {string} address - Ethereum address
 * @param {boolean} showSocials - Show social media links (default: true)
 * @param {string} className - Additional CSS classes
 */
function EnsSocialProfile({ address, showSocials = true, compact = false, className = "" }) {
  const { ensName, avatar, isLoading } = useEnsProfile(address);
  const { textRecords, loading: recordsLoading } = useEnsTextRecords(ensName);

  if (!address) return null;

  const shortAddress = `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;

  // Compact mode: just a row of small icon links (for use inside trade cards)
  if (compact) {
    const hasSocials =
      textRecords?.twitter ||
      textRecords?.github ||
      textRecords?.discord ||
      textRecords?.telegram ||
      textRecords?.url;

    if (recordsLoading || !hasSocials) return null;

    return (
      <div className={`flex items-center gap-x-[6px] ${className}`}>
        {textRecords?.twitter && (
          <a
            href={`https://twitter.com/${textRecords.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`@${textRecords.twitter} on X`}
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-3 h-3 text-gray500 dark:text-gray500Dark hover:text-baseWhiteDark dark:hover:text-baseWhite transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        )}
        {textRecords?.github && (
          <a
            href={`https://github.com/${textRecords.github}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`${textRecords.github} on GitHub`}
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-3 h-3 text-gray500 dark:text-gray500Dark hover:text-baseWhiteDark dark:hover:text-baseWhite transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        )}
        {textRecords?.discord && (
          <span title={`${textRecords.discord} on Discord`}>
            <svg className="w-3 h-3 text-gray500 dark:text-gray500Dark" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </span>
        )}
        {textRecords?.telegram && (
          <a
            href={`https://t.me/${textRecords.telegram}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`${textRecords.telegram} on Telegram`}
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-3 h-3 text-gray500 dark:text-gray500Dark hover:text-baseWhiteDark dark:hover:text-baseWhite transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </a>
        )}
        {textRecords?.url && (
          <a
            href={textRecords.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Website"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-3 h-3 text-gray500 dark:text-gray500Dark hover:text-baseWhiteDark dark:hover:text-baseWhite transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-y-3 ${className}`}>
      {/* Avatar and Name Section */}
      <div className="flex items-center gap-x-3">
        {/* Avatar */}
        {avatar ? (
          <img
            src={avatar}
            alt={ensName || "Avatar"}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary1000 dark:border-primary1000Dark"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary1000 to-success300 flex items-center justify-center border-2 border-primary1000 dark:border-primary1000Dark">
            <span className="text-2xl font-bold text-white">
              {ensName
                ? ensName.substring(0, 2).toUpperCase()
                : address.substring(2, 4).toUpperCase()}
            </span>
          </div>
        )}

        {/* Name and Address */}
        <div className="flex flex-col">
          {isLoading ? (
            <span className="text-lg font-semibold text-gray500 dark:text-gray500Dark animate-pulse">
              Loading...
            </span>
          ) : (
            <>
              <span className="text-lg font-semibold text-baseWhiteDark dark:text-baseWhite">
                {ensName || shortAddress}
              </span>
              {ensName && (
                <span className="text-sm text-gray500 dark:text-gray500Dark font-mono">
                  {shortAddress}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {textRecords?.description && (
        <p className="text-sm text-gray500 dark:text-gray500Dark">
          {textRecords.description}
        </p>
      )}

      {/* Social Links */}
      {showSocials && !recordsLoading && (
        <div className="flex flex-wrap gap-2">
          {textRecords?.twitter && (
            <a
              href={`https://twitter.com/${textRecords.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-x-1 px-3 py-1 rounded-full bg-gray100 dark:bg-gray100Dark border border-gray300 dark:border-gray300Dark hover:border-primary1000 dark:hover:border-primary1000Dark transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-xs font-medium text-baseWhiteDark dark:text-baseWhite">
                @{textRecords.twitter}
              </span>
            </a>
          )}

          {textRecords?.github && (
            <a
              href={`https://github.com/${textRecords.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-x-1 px-3 py-1 rounded-full bg-gray100 dark:bg-gray100Dark border border-gray300 dark:border-gray300Dark hover:border-primary1000 dark:hover:border-primary1000Dark transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="text-xs font-medium text-baseWhiteDark dark:text-baseWhite">
                {textRecords.github}
              </span>
            </a>
          )}

          {textRecords?.discord && (
            <div className="flex items-center gap-x-1 px-3 py-1 rounded-full bg-gray100 dark:bg-gray100Dark border border-gray300 dark:border-gray300Dark">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="text-xs font-medium text-baseWhiteDark dark:text-baseWhite">
                {textRecords.discord}
              </span>
            </div>
          )}

          {textRecords?.telegram && (
            <a
              href={`https://t.me/${textRecords.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-x-1 px-3 py-1 rounded-full bg-gray100 dark:bg-gray100Dark border border-gray300 dark:border-gray300Dark hover:border-primary1000 dark:hover:border-primary1000Dark transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <span className="text-xs font-medium text-baseWhiteDark dark:text-baseWhite">
                {textRecords.telegram}
              </span>
            </a>
          )}

          {textRecords?.url && (
            <a
              href={textRecords.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-x-1 px-3 py-1 rounded-full bg-gray100 dark:bg-gray100Dark border border-gray300 dark:border-gray300Dark hover:border-primary1000 dark:hover:border-primary1000Dark transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <span className="text-xs font-medium text-baseWhiteDark dark:text-baseWhite">
                Website
              </span>
            </a>
          )}

          {textRecords?.email && (
            <a
              href={`mailto:${textRecords.email}`}
              className="flex items-center gap-x-1 px-3 py-1 rounded-full bg-gray100 dark:bg-gray100Dark border border-gray300 dark:border-gray300Dark hover:border-primary1000 dark:hover:border-primary1000Dark transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-medium text-baseWhiteDark dark:text-baseWhite">
                Email
              </span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default EnsSocialProfile;
