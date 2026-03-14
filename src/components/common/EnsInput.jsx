import React, { useEffect, useState } from "react";
import { useEnsResolver, isValidEnsName, isValidAddress } from "../../hooks/useEns";

/**
 * EnsInput Component - Input field that accepts ENS names or addresses
 * @param {string} value - Current value
 * @param {function} onChange - Callback when value changes (receives resolved address)
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Disable input
 * @param {function} onEnsResolved - Callback when ENS is resolved with {ensName, address}
 */
function EnsInput({
  value,
  onChange,
  placeholder = "0x... or vitalik.eth",
  className = "",
  disabled = false,
  onEnsResolved = () => {},
}) {
  const [inputValue, setInputValue] = useState(value || "");
  const [validationStatus, setValidationStatus] = useState(""); // 'valid', 'invalid', 'resolving', ''

  const isEns = isValidEnsName(inputValue);
  const isAddress = isValidAddress(inputValue);

  const { address: resolvedAddress, isLoading, error } = useEnsResolver(
    isEns ? inputValue : null
  );

  // Debug logging
  useEffect(() => {
    if (isEns && inputValue) {
      console.log('🔍 EnsInput Debug:', {
        inputValue,
        isEns,
        resolvedAddress,
        isLoading,
        error: error?.message || error,
        validationStatus
      });
    }
  }, [inputValue, isEns, resolvedAddress, isLoading, error, validationStatus]);

  useEffect(() => {
    if (isEns) {
      if (isLoading) {
        setValidationStatus("resolving");
      } else if (resolvedAddress) {
        setValidationStatus("valid");
        onChange(resolvedAddress);
        onEnsResolved({ ensName: inputValue, address: resolvedAddress });
      } else {
        // ENS name format is valid but didn't resolve to an address
        setValidationStatus("invalid");
      }
    } else if (isAddress) {
      setValidationStatus("valid");
      onChange(inputValue);
    } else if (inputValue.length > 0) {
      setValidationStatus("invalid");
    } else {
      setValidationStatus("");
      onChange(""); // clear parent value when input is emptied
    }
  }, [inputValue, isEns, isAddress, resolvedAddress, isLoading, error]);

  const handleChange = (e) => {
    const newValue = e.target.value.trim();
    setInputValue(newValue);
    
    // If it's a valid address, immediately pass it up
    if (isValidAddress(newValue)) {
      onChange(newValue);
    }
  };

  const getBorderColor = () => {
    switch (validationStatus) {
      case "valid":
        return "border-success300 dark:border-success300Dark";
      case "invalid":
        return "border-error";
      case "resolving":
        return "border-primary1000 dark:border-primary1000Dark animate-pulse";
      default:
        return "border-gray300 dark:border-gray300Dark";
    }
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case "valid":
        return (
          <svg
            className="w-5 h-5 text-success300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "invalid":
        return (
          <svg
            className="w-5 h-5 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case "resolving":
        return (
          <svg
            className="w-5 h-5 text-primary1000 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2 pr-10 rounded-lg border ${getBorderColor()} bg-baseWhite dark:bg-black text-baseWhiteDark dark:text-baseWhite placeholder-gray500 dark:placeholder-gray500Dark focus:outline-none focus:ring-2 focus:ring-primary1000 dark:focus:ring-primary1000Dark transition-all ${className} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      />
      
      {/* Status Icon */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {getStatusIcon()}
      </div>

      {/* Helper Text */}
      {validationStatus === "resolving" && (
        <p className="text-xs text-gray500 dark:text-gray500Dark mt-1">
          Resolving ENS name...
        </p>
      )}
      {validationStatus === "valid" && isEns && resolvedAddress && (
        <p className="text-xs text-success300 mt-1">
          Resolved to: {resolvedAddress.substring(0, 10)}...{resolvedAddress.substring(resolvedAddress.length - 8)}
        </p>
      )}
      {validationStatus === "invalid" && inputValue.length > 0 && (
        <p className="text-xs text-error mt-1">
          {isEns
            ? "ENS name not found. Make sure it's registered on Ethereum mainnet."
            : "Invalid ENS name or Ethereum address"}
        </p>
      )}
    </div>
  );
}

export default EnsInput;
