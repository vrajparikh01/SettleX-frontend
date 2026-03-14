# ENS Integration — SettleX

> **"Best Creative Use of ENS"** — ETHGlobal Hackathon Submission
>
> SettleX uses ENS not just as a name resolver, but as a decentralized identity, reputation, and preferences layer for peer-to-peer OTC trading.

---

## Overview

SettleX is an OTC + Premarket trading platform where users trade directly with each other. The core problem: **who am I trading with?** ENS solves this by turning every trader's `.eth` name into a full on-chain identity — avatar, social links, trust score, and custom trading preferences — with zero backend, zero sign-up, and zero centralized storage.

---

## What We Built Beyond Name Resolution

| Feature | Description | ENS Mechanism |
|---|---|---|
| **`settlex.prefs`** | Custom ENS text record stores OTC trading preferences as JSON on Ethereum | `getEnsText(client, { key: "settlex.prefs" })` |
| **Trust Score** | 0–100 score computed from on-chain profile completeness | Multiple text record keys combined |
| **Counterparty Preview** | Type `alice.eth` → see her full profile + preferences inline before submitting | ENS name → address → text records |
| **Verified Checkmark** | Forward + reverse resolution both checked — anti-spoofing | `useEnsName` + `useEnsAddress` cross-check |
| **Veteran Badge** | ENS registration age from The Graph subgraph | ENS subgraph GraphQL query |
| **NFT Avatar Badge** | Detects `eip155:1/erc721:...` avatar records (BAYC, CryptoPunks, etc.) | Raw `avatar` text record parsing |
| **Farcaster + Lens** | Social profile links pulled from ENS text records | `xyz.farcaster`, `xyz.lens` keys |
| **ENS-Only Filter** | Marketplace filter showing only traders with ENS names | Live resolution per trade card |
| **ENS Name Search** | Search the marketplace by ENS name (e.g. `alice.eth`) | `useEnsAddress` for resolution |
| **Preference Matching** | Highlights trades matching the logged-in user's `settlex.prefs` | Cross-reference two ENS records |
| **Dual Trade Route** | Shows `creator.eth → receiver.eth` on every trade card | Two `EnsDisplay` components per card |
| **On-chain Stats** | Deal history (trades created, fills, volume) pulled from platform APIs | ENS-resolved address as API key |

---

## The Key Innovation: `settlex.prefs`

Any ENS holder can set a custom text record on [app.ens.domains](https://app.ens.domains):

```
Key:   settlex.prefs
Value: {"tokens":["USDC","WETH"],"min":"1000","max":"50000","note":"Large deals only"}
```

This stores their OTC trading preferences **directly on Ethereum** — no backend, no account, no sign-up. SettleX reads this record and:

1. Shows the counterparty's preferences **while you are typing their ENS name** in the deal creation form
2. Highlights marketplace trades that match **your own** `settlex.prefs` preferences
3. Adds **+5 points** to the trust score for verified SettleX traders

The `settlex.prefs` key is an open standard — any other DeFi protocol can adopt it. Trader sovereignty: they own their preferences on-chain.

---

## ENS Trust Score

Computed purely from on-chain ENS data — no centralized database:

```
ENS name registered    → 30 pts  (owns an on-chain identity)
ENS avatar set         → 20 pts  (cares about presence)
Twitter record set     → 15 pts  (public social accountability)
GitHub record set      → 15 pts  (developer credibility)
Discord record set     → 10 pts  (community membership)
Description set        →  5 pts  (took time to fill profile)
settlex.prefs set      →  5 pts  (verified SettleX trader)
──────────────────────────────────────────────────────
Maximum                → 100 pts
```

**Tiers:** Verified Trader (≥70, green) · Active Trader (≥40, blue) · Basic Profile (≥1, gray) · Anonymous (0, hidden)

Shown as a compact badge on every trade card and a full badge with tier label in confirm modals.

---

## Architecture

```
App Layer (React)
  WagmiProvider
    chains: [mainnet, polygon, base]
    mainnet transport → ENS resolution (all ENS hooks use chainId: 1)
    polygon/base transport → OTC smart contracts

ENS Layer (src/hooks/useEns.js)
  useEnsProfile(address)      → { ensName, avatar, isVerified }
  useEnsResolver(ensName)     → { address }
  useEnsTextRecords(ensName)  → { twitter, github, discord, telegram, email,
                                  url, description, settlex_prefs,
                                  farcaster, lens, avatar_raw }
  useEnsReputationScore(addr) → { score, tier, prefs, isVerified, textRecords }
  useEnsNameAge(ensName)      → { nameAge, isVeteran }
  parseNftAvatar(rawAvatar)   → "BAYC" | "CryptoPunks" | null

Component Layer
  EnsDisplay         → name + avatar for any address, verified checkmark
  EnsInput           → live ENS resolution in form fields
  EnsSocialProfile   → social links (full card or compact icon row)
  EnsReputationBadge → trust score pill or full badge with tier
  EnsTraderCard      → full identity card (avatar, name, score, prefs, socials, stats)
  EnsTraderStats     → on-chain deal history via platform APIs
```

---

## Key Technical Decisions

### 1. Direct wagmi v2 + viem v2 — No SDK Black Box

All ENS hooks are built directly on `wagmi v2` and `viem v2`. No RainbowKit ENS helpers, no `@ensdomains/ensjs` for resolution. Full control over every query, caching strategy, and error handling.

```js
// Fetch 11 ENS text record keys in parallel — one failed key never blocks others
const results = await Promise.allSettled(
  keys.map((key) => getEnsText(publicClient, { name: normalizedName, key }))
);
```

### 2. Anti-Spoofing Verification

When showing a verified checkmark, we check that reverse resolution AND forward resolution both match. This prevents someone from setting a reverse record pointing to a name they no longer own.

```js
// useEnsProfile — forward + reverse must both match
const isVerified =
  !!resolvedName &&
  !!forwardAddress &&
  forwardAddress.toLowerCase() === address?.toLowerCase();
```

### 3. localStorage Caching

- ENS profiles: 1-hour TTL
- ENS text records: 1-hour TTL
- ENS name age (from The Graph): 24-hour TTL

Prevents redundant mainnet RPC calls on every render. wagmi's internal React Query deduplication further reduces duplicate network requests.

### 4. Cross-Chain Design

Trading contracts run on Polygon / Base. ENS resolution always queries Ethereum mainnet (`chainId: 1`). Both transports configured in the same wagmi `WagmiProvider` — no chain switching required.

### 5. `query: { enabled }` Pattern

All conditional ENS hooks use wagmi v2's correct pattern to prevent queries from firing when input is invalid:

```js
useEnsAddress({
  name: ensName,
  chainId: 1,
  query: { enabled: isValid }, // wagmi v2 — not top-level enabled
});
```

---

## Files

| File | Lines | Purpose |
|---|---|---|
| `src/hooks/useEns.js` | ~450 | All 6 ENS hooks + utilities |
| `src/components/common/EnsDisplay.jsx` | ~110 | Name + avatar + verified checkmark |
| `src/components/common/EnsInput.jsx` | ~190 | Live ENS resolution in form fields |
| `src/components/common/EnsSocialProfile.jsx` | ~265 | Social links — full + compact |
| `src/components/common/EnsReputationBadge.jsx` | ~85 | Trust score badge |
| `src/components/common/EnsTraderCard.jsx` | ~237 | Full identity card |
| `src/components/common/EnsTraderStats.jsx` | ~80 | On-chain trading stats |
| `src/components/OtcGrid.jsx` | — | Trade cards with ENS identity + dual route display |
| `src/components/OtcList.jsx` | — | Trade rows with ENS identity + dual route display |
| `src/components/modal/BuyModal.jsx` | — | ENS input + counterparty profile preview |
| `src/components/modal/SellModal.jsx` | — | Same |
| `src/components/modal/BuySummary.jsx` | — | Full EnsTraderCard in confirm modal |
| `src/components/modal/SellSummary.jsx` | — | Same |
| `src/components/Premarket/DealGridView.jsx` | — | ENS display on premarket cards |
| `src/pages/otc.jsx` | — | A3 ENS filter · A7 ENS search · A8 pref matching |

---

## ENS Text Record Keys Used

| Key | Standard | Used For |
|---|---|---|
| `com.twitter` | ENS standard | Social link, trust score |
| `com.github` | ENS standard | Social link, trust score |
| `com.discord` | ENS standard | Social link, trust score |
| `org.telegram` | ENS standard | Social link |
| `email` | ENS standard | Contact |
| `url` | ENS standard | Website link |
| `description` | ENS standard | Profile bio, trust score |
| `avatar` | ENS standard | NFT avatar detection |
| `xyz.farcaster` | Community | Farcaster social link |
| `xyz.lens` | Community | Lens Protocol link |
| **`settlex.prefs`** | **Custom** | **OTC trading preferences (our innovation)** |

---

## Live Demo

| Step | Location | What to See |
|---|---|---|
| ENS name + avatar on cards | `/otc` → Grid view | Every trader card shows ENS identity |
| Trust score badge | `/otc` → any card | `🛡 85` badge beside ENS name |
| Social icons | `/otc` → any card | Tiny 🐦 🔗 💻 icons below name |
| ENS-only filter | `/otc` → toolbar | "ENS only" button filters anonymous traders |
| ENS name search | `/otc` → search bar | Type `vitalik.eth` → cards filter |
| ENS input + resolve | Buy modal → Receiver field | Type `vitalik.eth` → spinner → ✓ green |
| Counterparty preview | Buy modal → type ENS | Full profile appears below input |
| Full trader card | Click Buy on any trade | Seller's ENS profile in confirm modal |
| `settlex.prefs` panel | Confirm modal | Green panel showing token preferences |
| On-chain stats | Confirm modal | "12 deals · 4 fills · ~$4.2K vol" |

---

## Dependencies

```json
"wagmi": "^2.12.10"
"viem": "^2.21.5"
"@rainbow-me/rainbowkit": "^2.1.6"
"@tanstack/react-query": "^5.55.4"
```

No additional ENS-specific packages required. All resolution via wagmi + viem built-ins.

---

*SettleX — ENS as the identity and preferences layer for peer-to-peer OTC trading.*