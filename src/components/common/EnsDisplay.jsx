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
  const { ensName, avatar, isLoading } = useEnsProfile(address);

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
            <span className="font-medium text-baseWhiteDark dark:text-baseWhite">
              {displayText}
            </span>
            {/* Show address below ENS name if requested */}
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
