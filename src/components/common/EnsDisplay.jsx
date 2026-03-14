import React from "react";
import { useEnsProfile, formatAddressOrEns } from "../../hooks/useEns";

/**
 * EnsDisplay Component - Shows ENS name with optional avatar
 * @param {string} address - Ethereum address
 * @param {boolean} showAvatar - Show ENS avatar (default: false)
 * @param {boolean} showAddress - Show shortened address alongside ENS (default: false)
 * @param {boolean} showFull - Show full address instead of shortened (default: false)
 * @param {string} className - Additional CSS classes
 * @param {string} avatarClassName - CSS classes for avatar
 * @param {boolean} copyable - Enable click to copy (default: false)
 */
function EnsDisplay({
  address,
  showAvatar = false,
  showAddress = false,
  showFull = false,
  className = "",
  avatarClassName = "",
  copyable = false,
}) {
  const { ensName, avatar, isLoading, isVerified } = useEnsProfile(address);

  const handleCopy = () => {
    if (copyable && address) {
      navigator.clipboard.writeText(address);
    }
  };

  if (!address) {
    return <span className={className}>-</span>;
  }

  const displayText = formatAddressOrEns(address, ensName, showFull);
  const shortAddress = `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;

  return (
    <div
      className={`flex items-center gap-x-2 ${className} ${
        copyable ? "cursor-pointer hover:opacity-80" : ""
      }`}
      onClick={handleCopy}
      title={copyable ? "Click to copy address" : address}
    >
      {/* ENS Avatar */}
      {showAvatar && avatar && (
        <img
          src={avatar}
          alt={ensName || "Avatar"}
          className={`rounded-full object-cover ${avatarClassName || "w-6 h-6"}`}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}

      {/* ENS Avatar Placeholder if no avatar but showAvatar is true */}
      {showAvatar && !avatar && (
        <div
          className={`rounded-full bg-gradient-to-br from-primary1000 to-success300 flex items-center justify-center ${
            avatarClassName || "w-6 h-6"
          }`}
        >
          <span className="text-xs font-semibold text-white">
            {ensName
              ? ensName.substring(0, 2).toUpperCase()
              : address.substring(2, 4).toUpperCase()}
          </span>
        </div>
      )}

      {/* ENS Name or Address */}
      <div className="flex flex-col">
        {isLoading ? (
          <span className="text-gray500 dark:text-gray500Dark animate-pulse">
            Loading...
          </span>
        ) : (
          <>
            <span className="flex items-center gap-x-1 font-medium text-baseWhiteDark dark:text-baseWhite">
              {displayText}
              {/* A2: Verified checkmark — forward + reverse ENS resolution both match */}
              {isVerified && (
                <svg
                  className="w-3 h-3 text-emerald-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  title="ENS Verified — forward and reverse resolution match"
                >
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            </span>
            {ensName && showAddress && (
              <span className="text-xs text-gray500 dark:text-gray500Dark">
                {shortAddress}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default EnsDisplay;
