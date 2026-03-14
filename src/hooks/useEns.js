import { useEffect, useState, useMemo } from "react";
import { useEnsName, useEnsAvatar, useEnsAddress, usePublicClient } from "wagmi";
import { normalize } from "viem/ens";
import { getEnsText } from "viem/actions";

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

  // A2: Forward resolution check — confirms ENS name forward-resolves back to same address.
  // Prevents spoofing: someone could set primary name but if forward record was removed,
  // the name is stale. isVerified = true only when reverse + forward both match.
  const {
    data: forwardAddress,
    isLoading: forwardLoading,
  } = useEnsAddress({
    name: ensName || cachedData?.ensName || undefined,
    chainId: 1,
  });

  const resolvedName = ensName || cachedData?.ensName || null;
  const isVerified =
    !!resolvedName &&
    !!forwardAddress &&
    forwardAddress.toLowerCase() === address?.toLowerCase();

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
    isVerified,
    isLoading: nameLoading || avatarLoading || forwardLoading,
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
    query: { enabled: isValid },
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
  const publicClient = usePublicClient({ chainId: 1 });
  const [textRecords, setTextRecords] = useState({
    twitter: null,
    github: null,
    discord: null,
    telegram: null,
    email: null,
    url: null,
    description: null,
    settlex_prefs: null,
    farcaster: null,
    lens: null,
    avatar_raw: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ensName || !publicClient) return;

    const fetchTextRecords = async () => {
      setLoading(true);
      try {
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

        const normalizedName = normalize(ensName);
        const keys = [
          "com.twitter",
          "com.github",
          "com.discord",
          "org.telegram",
          "email",
          "url",
          "description",
          "settlex.prefs",  // Custom SettleX record: decentralized trade preferences
          "xyz.farcaster",  // A6: Farcaster Web3 social profile
          "xyz.lens",       // A6: Lens Protocol social profile
          "avatar",         // A4: Raw avatar record for NFT detection (eip155: format)
        ];

        const results = await Promise.allSettled(
          keys.map((key) => getEnsText(publicClient, { name: normalizedName, key }))
        );

        const records = {
          twitter: results[0].status === "fulfilled" ? results[0].value : null,
          github: results[1].status === "fulfilled" ? results[1].value : null,
          discord: results[2].status === "fulfilled" ? results[2].value : null,
          telegram: results[3].status === "fulfilled" ? results[3].value : null,
          email: results[4].status === "fulfilled" ? results[4].value : null,
          url: results[5].status === "fulfilled" ? results[5].value : null,
          description: results[6].status === "fulfilled" ? results[6].value : null,
          settlex_prefs: results[7].status === "fulfilled" ? results[7].value : null,
          farcaster:     results[8].status === "fulfilled" ? results[8].value : null,
          lens:          results[9].status === "fulfilled" ? results[9].value : null,
          avatar_raw:    results[10].status === "fulfilled" ? results[10].value : null,
        };

        setTextRecords(records);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ records, timestamp: Date.now() })
        );
      } catch (error) {
        console.error("Error fetching ENS text records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTextRecords();
  }, [ensName, publicClient]);

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
 * A4: Known NFT collections for avatar badge detection.
 * ENS avatar records with eip155: prefix are NFTs.
 * Format: eip155:1/erc721:0xBC4CA.../tokenId
 */
const KNOWN_NFT_COLLECTIONS = {
  "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D": "BAYC",
  "0x60E4d786628Fea6478F785A6d7e704777c86a7c6": "MAYC",
  "0xED5AF388653567Af2F388E6224dC7C4b3241C544": "Azuki",
  "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB": "CryptoPunks",
  "0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B": "CloneX",
  "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e": "Doodles",
  "0x23581767a106ae21c074b2276D25e5C3e136a68b": "Moonbirds",
  "0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7": "Meebits",
  "0x1A92f7381B9F03921564a437210bB9396471050C": "Cool Cats",
};

/**
 * A4: Parse NFT avatar text record to get collection name.
 * @param {string} rawAvatar - Raw ENS avatar text record value
 * @returns {string|null} - Collection name or null if not an NFT avatar
 */
export const parseNftAvatar = (rawAvatar) => {
  if (!rawAvatar || !rawAvatar.startsWith("eip155:")) return null;
  // Format: eip155:1/erc721:0xBC4CA.../123
  const parts = rawAvatar.split("/");
  if (parts.length < 2) return null;
  const [, contractAddress] = parts[1].split(":");
  if (!contractAddress) return null;
  const match = Object.keys(KNOWN_NFT_COLLECTIONS).find(
    (k) => k.toLowerCase() === contractAddress.toLowerCase()
  );
  return match ? KNOWN_NFT_COLLECTIONS[match] : "NFT Holder";
};

/**
 * A1: Hook to get ENS name registration date and age.
 * Queries ENS subgraph (The Graph) for on-chain registration timestamp.
 * @param {string} ensName - ENS name (e.g., "vitalik.eth")
 * @returns {{ nameAge: number|null, registrationDate: Date|null, isVeteran: boolean }}
 *   nameAge: age in years (1 decimal), isVeteran: true if registered > 1 year ago
 */
export const useEnsNameAge = (ensName) => {
  const [nameAge, setNameAge] = useState(null);
  const [registrationDate, setRegistrationDate] = useState(null);

  useEffect(() => {
    if (!ensName || !ensName.endsWith(".eth")) return;

    const label = ensName.replace(".eth", "").toLowerCase();
    const cacheKey = `ens_age_${label}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.fetchTime < 86400000) { // 24-hour cache
        setNameAge(parsed.nameAge);
        setRegistrationDate(parsed.registrationDate ? new Date(parsed.registrationDate) : null);
        return;
      }
    }

    fetch("https://api.thegraph.com/subgraphs/name/ensdomains/ens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{ registrations(where: { labelName: "${label}" }) { registrationDate expiryDate } }`,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const reg = data?.data?.registrations?.[0];
        if (reg?.registrationDate) {
          const regDate = new Date(Number(reg.registrationDate) * 1000);
          const ageYears =
            (Date.now() - regDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          const rounded = Math.floor(ageYears * 10) / 10;
          setNameAge(rounded);
          setRegistrationDate(regDate);
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              nameAge: rounded,
              registrationDate: regDate.toISOString(),
              fetchTime: Date.now(),
            })
          );
        }
      })
      .catch((err) => console.error("ENS name age fetch error:", err));
  }, [ensName]);

  return {
    nameAge,
    registrationDate,
    isVeteran: nameAge !== null && nameAge >= 1,
  };
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

/**
 * ENS-based reputation score for a trader.
 * Score is computed purely from on-chain ENS profile completeness + custom settlex.prefs record.
 *
 * Scoring:
 *   ENS name registered  → 30 pts
 *   Avatar set           → 20 pts
 *   Twitter record       → 15 pts
 *   GitHub record        → 15 pts
 *   Discord record       → 10 pts
 *   Description record   →  5 pts
 *   settlex.prefs record →  5 pts  (custom SettleX text record)
 *   Maximum             → 100 pts
 *
 * Tiers:
 *   Verified  ≥ 70
 *   Active    ≥ 40
 *   Basic     ≥ 1
 *   Anon      = 0  (no ENS)
 *
 * @param {string} address - Ethereum address
 * @returns {{ score, tier, prefs, ensName, avatar, textRecords, isLoading }}
 */
export const useEnsReputationScore = (address) => {
  const { ensName, avatar, isVerified, isLoading: profileLoading } = useEnsProfile(address);
  const { textRecords, loading: recordsLoading } = useEnsTextRecords(ensName);

  const score = useMemo(() => {
    let s = 0;
    if (ensName) s += 30;
    if (avatar) s += 20;
    if (textRecords?.twitter) s += 15;
    if (textRecords?.github) s += 15;
    if (textRecords?.discord) s += 10;
    if (textRecords?.description) s += 5;
    if (textRecords?.settlex_prefs) s += 5;
    return s;
  }, [ensName, avatar, textRecords]);

  const tier = useMemo(() => {
    if (score >= 70) return "verified";
    if (score >= 40) return "active";
    if (score > 0) return "basic";
    return "anon";
  }, [score]);

  // Parse settlex.prefs JSON from ENS text record
  // Format: {"tokens":["USDC","WETH"],"min":"1000","max":"50000","note":"Large deals only"}
  const prefs = useMemo(() => {
    if (!textRecords?.settlex_prefs) return null;
    try {
      return JSON.parse(textRecords.settlex_prefs);
    } catch {
      // If not valid JSON, treat the raw string as a note
      return { note: textRecords.settlex_prefs };
    }
  }, [textRecords?.settlex_prefs]);

  return {
    score,
    tier,
    prefs,
    ensName,
    avatar,
    isVerified,
    textRecords,
    isLoading: profileLoading || recordsLoading,
  };
};
