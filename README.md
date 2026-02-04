# SettleX - Decentralized Trading Platform

A Web3 decentralized trading platform that facilitates OTC (Over-The-Counter) trading, premarket equity deals, and broker services with full **ENS (Ethereum Name Service) integration**.

## 🎉 ENS Integration

SettleX features **comprehensive ENS support** throughout the platform:

- ✅ **Human-Readable Names** - Display `vitalik.eth` instead of `0x1234...5678`
- ✅ **ENS Avatars** - Profile pictures from ENS records
- ✅ **Social Profiles** - Twitter, GitHub, Discord, Telegram links from ENS
- ✅ **ENS Input Fields** - Accept ENS names in all address inputs
- ✅ **Search by ENS** - Find trades and traders by ENS name
- ✅ **Real-time Resolution** - Automatic ENS ↔ Address conversion

### ENS Features
- Display ENS names in header, wallet button, and trade cards
- ENS avatars throughout the UI
- Input validation for ENS names and addresses
- Social profile integration (Twitter, GitHub, Discord, etc.)
- ENS-based search and filtering
- Caching for performance (1-hour TTL)

**[📖 Complete ENS Documentation](./ENS_INTEGRATION.md)**

## 🚀 Tech Stack

### Core Technologies
- **React 18.3.1** - UI framework
- **Vite 5.3.4** - Build tool with HMR
- **TailwindCSS 3.4.7** - Utility-first styling
- **React Router DOM 6.26.0** - Client-side routing

### Web3 & ENS
- **Wagmi 2.12.10** - React hooks for Ethereum
- **Viem 2.21.5** - TypeScript Ethereum library
- **RainbowKit 2.1.6** - Wallet connection (70+ wallets)
- **@ensdomains/ensjs 3.7.0** - ENS integration

### State & API
- **TanStack React Query 5.55.4** - Server state management
- **Axios 1.7.7** - HTTP client

### UI/UX
- **React Toastify 10.0.6** - Notifications
- **React DatePicker 7.4.0** - Date selection
- **date-fns 4.1.0** - Date utilities

### Blockchain Networks
- **Sepolia** (testnet) - Development
- **Polygon** (mainnet) - Production
- **Ethereum Mainnet** - ENS resolution

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌟 Key Features

### Trading
- **OTC Marketplace** - Peer-to-peer token trading
- **Premarket Deals** - Invest in equity before public listing
- **Broker Services** - Facilitated trading with commission

### ENS Integration
- **Profile Display** - ENS names and avatars everywhere
- **Input Fields** - Accept ENS names in forms
- **Social Profiles** - Display Twitter, GitHub, Discord from ENS
- **Search** - Find traders by ENS name

### User Experience
- **Multi-Wallet Support** - 70+ wallets via RainbowKit
- **Dark Mode** - Full theme support
- **Responsive Design** - Mobile-friendly
- **Real-time Updates** - Live trade data
- **Dashboard** - Track all trading activity

### Admin Features
- **Token Management** - Add/edit tokens
- **Deal Approval** - Review and approve equity deals
- **Analytics** - Trading metrics and insights

## 🎯 ENS Bounty Qualification

**SettleX meets all requirements for the ENS $3,500 bounty:**

✅ **Custom Code** - Built custom ENS hooks and components (not just RainbowKit)
✅ **Functional Demo** - Live on Sepolia testnet with real ENS resolution
✅ **No Hard-coded Values** - Dynamic blockchain queries
✅ **Open Source** - Available on GitHub
✅ **Video Demo** - Included in submission

**Integration Highlights:**
- 6 custom ENS components
- 4 ENS hooks (useEnsProfile, useEnsResolver, useEnsTextRecords)
- 10+ components updated with ENS
- Full social profile system
- ENS input validation
- Search by ENS name

## 📁 Project Structure

```
src/
├── hooks/
│   └── useEns.js                 # ENS hooks and utilities
├── components/
│   ├── common/
│   │   ├── EnsDisplay.jsx        # Display ENS + avatar
│   │   ├── EnsInput.jsx          # ENS input field
│   │   ├── EnsSocialProfile.jsx  # Social profile
│   │   └── ConnectWalletButton.jsx
│   ├── OtcGrid.jsx               # OTC cards with ENS
│   ├── OtcList.jsx               # OTC list with ENS
│   ├── Premarket/                # Premarket components
│   └── modal/                    # Trading modals
├── pages/
│   ├── otc.jsx                   # OTC marketplace
│   ├── premarket.jsx             # Premarket deals
│   ├── dashboard.jsx             # User dashboard
│   └── admin.jsx                 # Admin panel
├── services/                     # API integration
├── config/                       # Contract & API config
└── utils/                        # Helper functions
```

## 🔧 Environment Variables

```env
VITE_ENV=development
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
VITE_RPC_URL=https://rpc.sepolia.org
VITE_BASE_URL=http://localhost:3000
```

## 🎮 Usage Examples

### Display ENS Name
```jsx
import EnsDisplay from "./components/common/EnsDisplay";

<EnsDisplay 
  address="0x1234..."
  showAvatar={true}
  showAddress={true}
/>
```

### ENS Input Field
```jsx
import EnsInput from "./components/common/EnsInput";

<EnsInput
  value={recipient}
  onChange={setRecipient}
  placeholder="vitalik.eth or 0x..."
/>
```

### Social Profile
```jsx
import EnsSocialProfile from "./components/common/EnsSocialProfile";

<EnsSocialProfile 
  address={userAddress}
  showSocials={true}
/>
```

## 🏗️ Development

This project uses:
- **Vite** for fast development and HMR
- **ESLint** for code quality
- **TailwindCSS** for styling
- **Wagmi** for Web3 interactions

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

For contribution guidelines, please contact the project maintainers.

## 📚 Documentation

- [ENS Integration Guide](./ENS_INTEGRATION.md) - Complete ENS documentation
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Wagmi Documentation](https://wagmi.sh/)
- [ENS Documentation](https://docs.ens.domains/)

## 🔗 Links

- **ENS Docs**: https://docs.ens.domains
- **RainbowKit**: https://rainbowkit.com
- **Wagmi**: https://wagmi.sh
- **Vite**: https://vitejs.dev

---

Built with ❤️ using React, Vite, and ENS
