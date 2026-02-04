import { useEffect, useState } from "react";
import { useEnsName, useEnsAvatar, useEnsAddress } from "wagmi";
import { normalize } from "viem/ens";

/**
 * Custom hook to get ENS name, avatar, and text records for an address
 * @param {string} address - Ethereum address
 * @returns {object} - { ensName, avatar, isLoading, error }
 */
export const useEnsProfile = (address) => {
  const [cachedData, setCachedData] = useState(null);

  // Get ENS name from address
  const {
    data: ensName,
    isLoading: nameLoading,
    error: nameError,
  } = useEnsName({
    address: address,
    chainId: 1, // ENS is on Ethereum mainnet
  });

  // Get ENS avatar
  const {
    data: avatar,
    isLoading: avatarLoading,
    error: avatarError,
  } = useEnsAvatar({
    name: ensName,
    chainId: 1,
  });

  // Cache the results in localStorage
  useEffect(() => {
    if (ensName && address) {
      const cacheKey = `ens_${address.toLowerCase()}`;
      const cached = {
        ensName,
        avatar,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cached));
      setCachedData(cached);
    }
  }, [ensName, avatar, address]);

  // Check cache on mount
  useEffect(() => {
    if (address && !ensName) {
      const cacheKey = `ens_${address.toLowerCase()}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Use cache if less than 1 hour old
        if (Date.now() - parsed.timestamp < 3600000) {
          setCachedData(parsed);
        }
      }
    }
  }, [address]);

  return {
    ensName: ensName || cachedData?.ensName || null,
    avatar: avatar || cachedData?.avatar || null,
    isLoading: nameLoading || avatarLoading,
    error: nameError || avatarError,
  };
};

/**
 * Custom hook to resolve ENS name to address
 * @param {string} ensName - ENS name (e.g., "vitalik.eth")
 * @returns {object} - { address, isLoading, error, isValid }
 */
export const useEnsResolver = (ensName) => {
  const [isValid, setIsValid] = useState(false);

  // Validate ENS name format
  useEffect(() => {
    if (ensName) {
      try {
        const normalized = normalize(ensName);
        setIsValid(normalized.endsWith(".eth") || normalized.includes("."));
      } catch (error) {
        setIsValid(false);
      }
    } else {
      setIsValid(false);
    }
  }, [ensName]);

  const {
    data: address,
    isLoading,
    error,
  } = useEnsAddress({
    name: ensName,
    chainId: 1,
    enabled: isValid,
  });

  // Debug logging
  useEffect(() => {
    if (ensName && isValid) {
      console.log('🔍 ENS Resolution:', {
        ensName,
        address,
        isLoading,
        error: error?.message,
        chainId: 1,
      });
    }
  }, [ensName, address, isLoading, error, isValid]);

  return {
    address,
    isLoading,
    error,
    isValid,
  };
};

/**
 * Hook to get ENS text records (social profiles, etc.)
 * @param {string} ensName - ENS name
 * @returns {object} - Text records
 */
export const useEnsTextRecords = (ensName) => {
  const [textRecords, setTextRecords] = useState({
    twitter: null,
    github: null,
    discord: null,
    telegram: null,
    email: null,
    url: null,
    description: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ensName) return;

    const fetchTextRecords = async () => {
      setLoading(true);
      try {
        // Note: This requires a public client setup
        // For now, we'll implement basic caching
        const cacheKey = `ens_text_${ensName.toLowerCase()}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 3600000) {
            setTextRecords(parsed.records);
            setLoading(false);
            return;
          }
        }

        // In production, you would fetch from ENS resolver
        // For now, return empty to avoid errors
        setTextRecords({
          twitter: null,
          github: null,
          discord: null,
          telegram: null,
          email: null,
          url: null,
          description: null,
        });
      } catch (error) {
        console.error("Error fetching ENS text records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTextRecords();
  }, [ensName]);

  return { textRecords, loading };
};

/**
 * Utility function to shorten address or show ENS name
 * @param {string} address - Ethereum address
 * @param {string} ensName - ENS name (optional)
 * @param {boolean} showFull - Show full address
 * @returns {string} - Formatted display string
 */
export const formatAddressOrEns = (address, ensName = null, showFull = false) => {
  if (ensName) {
    return ensName;
  }
  
  if (!address) return "";
  
  if (showFull) {
    return address;
  }
  
  // Shorten address: 0x1234...5678
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Check if string is a valid ENS name
 * @param {string} input - Input string
 * @returns {boolean} - Is valid ENS name
 */
export const isValidEnsName = (input) => {
  if (!input) return false;
  
  try {
    const normalized = normalize(input);
    return normalized.endsWith(".eth") || normalized.includes(".");
  } catch (error) {
    return false;
  }
};

/**
 * Check if string is a valid Ethereum address
 * @param {string} input - Input string
 * @returns {boolean} - Is valid address
 */
export const isValidAddress = (input) => {
  if (!input) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(input);
};
