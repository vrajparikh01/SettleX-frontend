# SettleX — System Guide

> How the platform works, who each role is, and exactly what happens step by step for every action.

---

## Table of Contents

- [SettleX — System Guide](#settlex--system-guide)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [User Roles](#user-roles)
  - [How the Chain \& Wallet Works](#how-the-chain--wallet-works)
  - [Role: Regular User](#role-regular-user)
    - [1. Connect Wallet](#1-connect-wallet)
    - [2. Premarket — Browse Offers](#2-premarket--browse-offers)
    - [3. Premarket — Fill / Invest in an Offer](#3-premarket--fill--invest-in-an-offer)
    - [4. OTC — Browse Trades](#4-otc--browse-trades)
    - [5. OTC — Execute a Buy](#5-otc--execute-a-buy)
    - [6. OTC — Execute a Sell](#6-otc--execute-a-sell)
    - [7. OTC Broker Marketplace](#7-otc-broker-marketplace)
    - [8. Equity Deals — Browse Only](#8-equity-deals--browse-only)
    - [9. Settings](#9-settings)
  - [Role: Offer Creator (User Creating Orders)](#role-offer-creator-user-creating-orders)
    - [1. Create OTC Buy Order](#1-create-otc-buy-order)
    - [2. Create OTC Sell Order](#2-create-otc-sell-order)
    - [3. Create Premarket Offer](#3-create-premarket-offer)
  - [Role: Dashboard — Managing Your Positions](#role-dashboard--managing-your-positions)
    - [1. My OTC Trades \& Activities](#1-my-otc-trades--activities)
    - [2. Premarket — Distribute Tokens (Seller after TGE)](#2-premarket--distribute-tokens-seller-after-tge)
    - [3. Premarket — Buyer Claims Tokens](#3-premarket--buyer-claims-tokens)
    - [4. Premarket — Cancel After 24h (Seller)](#4-premarket--cancel-after-24h-seller)
    - [5. Premarket — Cancel After 24h (Buyer)](#5-premarket--cancel-after-24h-buyer)
    - [6. Premarket — Delete Your Offer](#6-premarket--delete-your-offer)
    - [7. Premarket — Claim Back Untraded Amount](#7-premarket--claim-back-untraded-amount)
  - [Role: Broker](#role-broker)
    - [1. Generate a Broker Deal Link](#1-generate-a-broker-deal-link)
    - [2. Client Approves a Broker Deal](#2-client-approves-a-broker-deal)
  - [Role: Admin](#role-admin)
    - [1. Verify Admin Identity](#1-verify-admin-identity)
    - [2. Add Premarket Token](#2-add-premarket-token)
    - [3. Edit Premarket Token](#3-edit-premarket-token)
    - [4. Add Collateral Token](#4-add-collateral-token)
    - [5. Add OTC Token](#5-add-otc-token)
    - [6. Add Equity Deal](#6-add-equity-deal)
    - [7. Update Commission Rates](#7-update-commission-rates)
      - [Premarket Commission](#premarket-commission)
      - [OTC Commission](#otc-commission)
  - [Contract Call Reference](#contract-call-reference)
  - [API Service Reference](#api-service-reference)

---

## Overview

SettleX is a decentralized trading platform with three core markets:

| Market | What it is |
|---|---|
| **OTC** | Peer-to-peer token swap. You post an offer, someone else fills it. |
| **Premarket** | Invest in tokens *before* they are publicly listed (pre-TGE). |
| **Equity** | Institutional equity deals — contact-based, no on-chain action from users. |
| **Broker** | A broker creates a private link for a client to execute a specific OTC deal. |

Every on-chain action follows the same pattern:
```
Check Balance → Approve Token → Call Contract → Wait for Confirmation → Save to API
```

---

## User Roles

| Role | How it is determined | Pages used |
|---|---|---|
| **Unauthenticated** | No wallet connected | `/login` |
| **Regular User** | Any connected wallet | `/`, `/otc`, `/otc/details`, `/broker`, `/equity`, `/dashboard`, `/settings` |
| **Offer Creator** | Same as regular user, uses the "Create" flow | `/dashboard` → Buy/Sell buttons |
| **Broker** | Any user who generates a broker link | `/dashboard` → OTC Broker tab |
| **Admin** | Wallet address equals the OTC contract's `owner()` | `/admin` |

> There is no role stored in a database. Admin access is verified live against the smart contract.

---

## How the Chain & Wallet Works

```
User opens MetaMask → selects a network (Polygon, Base, Sepolia)
         ↓
RainbowKit reads the active chain → account.chainId
         ↓
If the chain is not in [mainnet, polygon, base] → "Wrong network" button appears
         ↓
Every contract call uses account.chainId to pick the right contract address:
  otc_contract(account.chainId)        → .env VITE_OTC_CONTRACT_POLYGON / _BASE / _SEPOLIA
  premarket_contract(account.chainId)  → .env VITE_PREMARKET_CONTRACT_POLYGON / _BASE / _SEPOLIA
```

The app never forces a network. The user switches in their wallet; the app follows.

---

## Role: Regular User

### 1. Connect Wallet

**Where:** Every page — header top-right  
**Component:** `ConnectWalletButton` → RainbowKit `ConnectButton`

**Steps:**
1. Click **Connect** button
2. RainbowKit modal opens — choose from 70+ wallets
3. Approve connection in wallet
4. Header calls `loginUser({ wallet_address, chainId })` → backend login
5. ENS name + avatar automatically resolve and display (if the address has an ENS)

---

### 2. Premarket — Browse Offers

**Where:** `/` (home page)  
**Page:** `premarket.jsx`

**Steps:**
1. Page loads → fetches `getAllPremarketTrade(page, type, search, chainId)` from API
2. Cards show: token name, offer type (Buy/Sell), price, amount, collateral token
3. Search bar filters by token name (debounced)
4. Tabs: **All / Buy / Sell** — re-fetches with the selected type
5. Pagination at the bottom

**No wallet needed to browse.**

---

### 3. Premarket — Fill / Invest in an Offer

**Where:** `/` → click a deal card  
**Page:** `premarket.jsx`

**Steps:**
1. Click a deal → `BuySummary` or `SellSummary` modal opens
2. Review the deal details (price, collateral, amounts)
3. Click **Confirm**
4. ► **Check Balance** — reads `balanceOf(wallet)` on the collateral ERC20 token
5. If insufficient balance → error shown, stop
6. ► **Approve** — calls `approve(premarketContract, amount)` on the ERC20 token
   - MetaMask popup: "Allow SettleX to spend your USDC"
7. ► **Contribute to Offer** — calls `contributeToOffer(offerIndex, collateralAmount, offerAmount)` on the Premarket contract
   - MetaMask popup: confirms the contribution transaction
8. ► **Wait** — waits for 1 block confirmation
9. ► **Save to API** — `postPremarketActivity(activityData)` records the investment

---

### 4. OTC — Browse Trades

**Where:** `/otc`  
**Page:** `otc.jsx`

**Steps:**
1. Fetches `getAllTrades(page, type, search, chainId)`
2. Analytics banner: `getTradeAnalytics(chainId)` — shows volume / counts
3. Cards show: offer token, receive token, price, amount, lot size
4. Search, Tabs (All/Buy/Sell), Pagination — same as Premarket

---

### 5. OTC — Execute a Buy

**Where:** `/otc` → Buy button on a trade card

**Steps:**
1. Click **Buy** → `BuySummary` modal opens with trade details
2. Enter how many tokens you want to buy
3. Click **Confirm**
4. ► **Check Balance** — reads `balanceOf(wallet)` on the *receive* (payment) token
5. If insufficient → error, stop
6. ► **Approve** — `approve(otcContract, receiveAmount)` on the ERC20
7. ► **Execute Trade** — `executeTrade(tradeIndex, offerAmount, receiveAmount)` on the OTC contract
8. ► **Wait** — 1 block confirmation
9. ► **Save to API** — `postActivity({ activity_type: 1 })` (1 = buy)

---

### 6. OTC — Execute a Sell

Same as Buy, but reversed:
- Balance check is on the *offer* (the token you're selling)
- `activity_type: 0` (sell)
- `executeTrade` still called with the same contract function

---

### 7. OTC Broker Marketplace

**Where:** `/broker`  
**Page:** `otcBroker.jsx`

Identical flow to `/otc` but only shows trades created through broker links. Buy and Sell work exactly the same.

---

### 8. Equity Deals — Browse Only

**Where:** `/equity`  
**Page:** `equity.jsx`

**Steps:**
1. Loads `getEquityTokens(chainId, page, walletAddress)` from API
2. Shows institutional equity deal cards
3. Click **Invest** → `ContactOpenMarketModal` opens — this is just a **contact form**, no on-chain action

---

### 9. Settings

**Where:** `/settings`  
**Page:** `settings.jsx`

UI form fields: Full Name, Email, Website, Telegram, Twitter, Discord, Other Links.  
Currently a UI placeholder — no save API is wired yet.

---

## Role: Offer Creator (User Creating Orders)

### 1. Create OTC Buy Order

**Where:** `/dashboard` → **Create Buy Order** button  
**Component:** `BuyModal`

**Steps:**
1. Click **Buy** → `BuyModal` opens
2. Select the **Project Token** from dropdown (fetched via `getTokens(chainId)`)
3. Click on a token → loads token details via `getTokenDetails(id)`
4. Enter:
   - Number of tokens to buy
   - Price per token
   - Lot size (Full / Partial)
   - Optional: receiver wallet address (supports ENS names like `vitalik.eth`)
5. Click **Confirm**
6. ► **Check Balance** — `balanceOf(wallet)` on the collateral token
7. ► **Approve** — `approve(otcContract, collateralAmount)` on ERC20
8. ► **Create Trade on Chain** — `addTrade([tradeStruct])` on OTC contract
   - `tradeStruct` includes: offer token, receive token, amounts, lot type, is_broker=false
9. ► **Get Trade Index** — `getLastAddedTradeIndex(wallet)` — reads the on-chain ID of the new trade
10. ► **Save to API** — `postTrade(trade)` with the on-chain index

---

### 2. Create OTC Sell Order

Same as Buy Order but:
- `trade_type: 0` (sell)
- The token you *own* is the offer token
- The collateral token is what you want to receive

---

### 3. Create Premarket Offer

**Where:** `/dashboard` → **Create Premarket Offer** button  
**Component:** `CreateSellOffer`

**Steps:**
1. Select offer token from premarket token list (`getPremarketTokens(chainId)`)
2. Select collateral token (`getPremarketCollateralTokens(chainId)`)
3. Enter number of tokens and price per token
4. Collateral auto-calculates: `(price × amount) / collateralToken.price`
5. Click **Confirm**
6. ► **Check Balance** — `balanceOf(wallet)` on the collateral token
7. ► **Approve** — `approve(premarketContract, collateralAmount)` on ERC20
8. ► **Create Offer on Chain** — `createOffer([offerStruct])` on Premarket contract
9. ► **Get Offer Index** — `getLastAddedOfferIndex(wallet)`
10. ► **Save to API** — `postPremarketTrade(finalTrade)` with the on-chain index

---

## Role: Dashboard — Managing Your Positions

**Where:** `/dashboard`

Tabs: **Premarket** | **OTC** | **OTC Broker**

---

### 1. My OTC Trades & Activities

**Tab:** OTC  
**Component:** `OtcDashboard`

- **My Created Offers** — `getUserTrades(wallet, chainId, page)` — trades you created
- **My Activities** — `getUserActivities(wallet, chainId, page)` — trades you filled
- Read-only display with pagination. No contract calls.

---

### 2. Premarket — Distribute Tokens (Seller after TGE)

> The token has launched (TGE passed). You are the seller. You now send real tokens to buyers.

**Steps:**
1. In Dashboard → Premarket tab → Created Offers → click **Distribute**
2. ► **Check Balance** — `balanceOf(wallet)` on the real offer token
3. ► **Approve** — `approve(premarketContract, filledTokenAmount)` on ERC20
4. ► **Distribute** — `distributeTokensSell(offerId)` on Premarket contract
5. ► **Update API** — `updatePremarketTrade({ is_distributed: true }, tradeId)`

---

### 3. Premarket — Buyer Claims Tokens

> The token has launched. You are a buyer. You claim your tokens from the seller.

**Steps:**
1. Dashboard → Premarket → Investments → click **Claim**
2. ► **Check Balance** + **Approve** (same as above)
3. ► **Distribute to Buyer** — `distributeTokensBuy(offerId, buyerAddress)` on Premarket contract
4. ► **Update API** — `updatePremarketInvestment({ is_distributed: true }, investmentId)`

---

### 4. Premarket — Cancel After 24h (Seller)

> TGE passed but the seller did not distribute within 24 hours. Buyer can trigger a refund of their collateral.

**Steps:**
1. Dashboard → Investments → click **Cancel / Refund**
2. ► `distributeAfter24HoursBuy(offerId)` — Premarket contract (no approval needed)
3. ► **Update API** — `updatePremarketTrade({ is_claimed: true }, tradeId)`

---

### 5. Premarket — Cancel After 24h (Buyer)

> The buyer did not claim within 24h. Seller can reclaim.

**Steps:**
1. Dashboard → Created Offers → click **Cancel**
2. ► `distributeAfter24HoursSell(offerId, buyerAddress)` — Premarket contract
3. ► **Update API** — `updatePremarketInvestment({ is_claimed: true }, investmentId)`

---

### 6. Premarket — Delete Your Offer

> Cancel your open offer before anyone fills it.

**Steps:**
1. Dashboard → Created Offers → click **Delete**
2. ► `cancelOffer(offerId)` — Premarket contract (returns collateral to creator)
3. ► **Update API** — `deletePremarketDeal(data, tradeId)`

---

### 7. Premarket — Claim Back Untraded Amount

> Your offer was only partially filled. Claim back the collateral on the unfilled portion.

**Steps:**
1. Dashboard → Created Offers → click **Claim Untraded**
2. ► `distributeBuyPartialCreator(offerId)` — Premarket contract
3. ► **Update API** — `updatePremarketTrade({ is_untraded_claimed: true }, tradeId)`

---

## Role: Broker

A broker creates a **private, expiring link** for a specific client to execute a pre-configured OTC deal.  
The broker earns a `broker_fee` percentage on each deal the client executes.

---

### 1. Generate a Broker Deal Link

**Where:** `/dashboard` → OTC Broker tab → **Create Broker Link**  
**Component:** `BrokerModal`

**Steps:**
1. Click **Create Broker Link** → `BrokerModal` opens
2. Select offer token and collateral token
3. Enter amounts, price per token, lot size
4. Enter **client wallet address** (supports ENS names)
5. Enter **brokerage percentage** (your fee)
6. Click **Confirm**
7. ► **Check Balance** + **Approve** + **addTrade on chain** (same flow as Create OTC Buy/Sell — see above)
8. After on-chain: API `generateLink(brokerData)` — generates a short link containing:
   - `client_address`, `broker_address`, `broker_fee`, `expire_time` (10 min from now)
9. `BrokerSuccessModal` shows the shareable link — send it to your client

---

### 2. Client Approves a Broker Deal

**Where:** `/deal-approval?id=<linkId>`  
**Page:** `dealApproval.jsx`

**Steps:**
1. Client opens the broker link
2. Page loads → `getBrokerLinkData(id)` — fetches deal terms from API
3. If expired → error shown, no action possible
4. Deal summary shown: token, amount, price, broker fee
5. Client clicks **Approve Deal**
6. ► **Check Balance** — `balanceOf(clientWallet)` on the collateral token
7. ► **Approve** — `approve(otcContract, collateralAmount)` on ERC20
8. ► **Add Trade on Chain** — `addTrade([tradeStruct])` with `is_broker: true`, `broker_address` set
9. ► **Get Trade Index** — `getLastAddedTradeIndex(wallet)`
10. ► **Save to API** — `postTrade(trade)` with `broker_link_id`, `is_broker: true`

The broker receives their commission from the contract automatically at settlement.

---

## Role: Admin

The admin is the **deployer / owner** of the OTC smart contract.  
Access is verified live on every page load — no login, no JWT, just on-chain.

**Where:** `/admin`

---

### 1. Verify Admin Identity

**Automatic on page load:**

1. ► `readContract: owner()` on the OTC contract
2. If `owner === account.address` → admin panel unlocks
3. If not → "Access Denied" shown

---

### 2. Add Premarket Token

> Register a new pre-TGE token so users can create offers for it.

**Component:** `AddTokenModal` → `CreateOffer`

**Steps:**
1. Admin clicks **Add Token**
2. Enter token contract address
3. ► `readContract: decimals()`, `name()`, `symbol()` — validates the address is a real ERC20
4. Enter settlement start date, settlement end date, TGE date
5. Click **Confirm**
6. ► `writeContractAsync: addToken(tokenAddress, settlementStart, settlementEnd)` — Premarket contract
7. ► Wait for 1 block confirmation
8. ► API: `addPremarketTokens(data)` — saves token metadata to backend

---

### 3. Edit Premarket Token

Same as Add, but:
- Pre-fills existing dates
- ► `writeContractAsync: editTimestamps(tokenAddress, settlementStart, settlementEnd)` — Premarket contract
- ► API: `editPremarketTokens(data, id)`

---

### 4. Add Collateral Token

> Add a token that can be used as collateral in premarket offers (e.g. USDC, USDT).

**Component:** `AddTokenModal` (collateral mode)

**Steps:**
1. Enter token address
2. ► Token metadata read from chain (`decimals`, `name`, `symbol`)
3. Click **Confirm**
4. ► **API only** — `addPremarketTokens({ token_type: 1, ... })` — no contract call needed

---

### 5. Add OTC Token

> Register a token so users can select it in OTC Buy/Sell modals.

**Steps:**
1. Enter token details in `AddOtcTokenModal`
2. Click **Confirm**
3. ► **API only** — `addOtcToken(data)` — no contract call

---

### 6. Add Equity Deal

**Steps:**
1. Fill in `AddEquityDealModal` — name, details, chain
2. ► **API only** — `addEquityDeal(data)`

---

### 7. Update Commission Rates

**Component:** `OfferSection`

#### Premarket Commission
1. On load: `readContract: getCommissionPercentage()` — Premarket contract
2. Admin edits value → clicks Save
3. ► `writeContractAsync: setCommission(newPercentage)` — Premarket contract

#### OTC Commission
1. On load: `readContract: getCommissionInformation()` — OTC contract
2. Admin edits value → clicks Save
3. ► `writeContractAsync: setCommissionToken(1, newPercentage)` — OTC contract

---

## Contract Call Reference

| Function | Contract | Read / Write | Called By |
|---|---|---|---|
| `owner()` | OTC | Read | Admin page load |
| `getCommissionInformation()` | OTC | Read | Admin OfferSection |
| `getCommissionPercentage()` | Premarket | Read | Admin OfferSection |
| `setCommissionToken(type, pct)` | OTC | Write | Admin |
| `setCommission(pct)` | Premarket | Write | Admin |
| `addToken(addr, start, end)` | Premarket | Write | Admin |
| `editTimestamps(addr, start, end)` | Premarket | Write | Admin |
| `addTrade([tradeStruct])` | OTC | Write | Create OTC order, Broker deal |
| `executeTrade(index, offer, receive)` | OTC | Write | Fill OTC trade |
| `getLastAddedTradeIndex(wallet)` | OTC | Read | After addTrade |
| `createOffer([offerStruct])` | Premarket | Write | Create Premarket offer |
| `contributeToOffer(index, col, offer)` | Premarket | Write | Fill Premarket offer |
| `getLastAddedOfferIndex(wallet)` | Premarket | Read | After createOffer |
| `distributeTokensSell(offerId)` | Premarket | Write | Seller distributes after TGE |
| `distributeTokensBuy(offerId, buyer)` | Premarket | Write | Buyer claims tokens |
| `distributeAfter24HoursBuy(offerId)` | Premarket | Write | Buyer refund after 24h |
| `distributeAfter24HoursSell(offerId, buyer)` | Premarket | Write | Seller reclaim after 24h |
| `cancelOffer(offerId)` | Premarket | Write | Delete open offer |
| `distributeBuyPartialCreator(offerId)` | Premarket | Write | Claim back untraded collateral |
| `balanceOf(wallet)` | ERC20 | Read | All transaction flows |
| `approve(spender, amount)` | ERC20 | Write | All transaction flows |
| `decimals()`, `name()`, `symbol()` | ERC20 | Read | Admin token validation |

---

## API Service Reference

| Service file | Key functions | Used by |
|---|---|---|
| `services/auth.js` | `loginUser(wallet, chainId)` | Header on connect |
| `services/otc.js` | `getAllTrades`, `postTrade`, `postActivity`, `getTokens`, `getTokenDetails`, `getTradeAnalytics`, `getAllBrokerTrades`, `getTokenTrade`, `updateView` | OTC pages, Dashboard |
| `services/premarket.js` | `getAllPremarketTrade`, `postPremarketTrade`, `postPremarketActivity`, `updatePremarketTrade`, `updatePremarketInvestment`, `deletePremarketDeal`, `getPremarketTokens`, `addPremarketTokens`, `editPremarketTokens`, `getPremarketCollateralTokens`, `getPremarketInvestment`, `getPremarketTrade` | Premarket pages, Dashboard |
| `services/broker.js` | `generateLink`, `getBrokerLinkData`, `getBrokersDeal` | Broker flow, Deal Approval |
| `services/admin.js` | `addOtcToken`, `getOtcTokens`, `addEquityDeal`, `getEquityTokens` | Admin page |
| `services/users.js` | `getUserTrades`, `getUserActivities`, `getQuickUpdates`, `uploadImage` | Dashboard |

---

*Built with React + Vite + Wagmi + RainbowKit + smart contracts on Polygon / Base / Sepolia.*
