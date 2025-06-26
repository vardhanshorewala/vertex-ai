# Data Marketplace Platform

A comprehensive three-sided marketplace connecting consumers, data brokers, and businesses with secure custodial wallet functionality, x402 payments on Base testnet, and CDP off-ramp integration.

## 🎯 Overview

This platform enables:
- **Consumers** to monetize their data safely through custodial wallets
- **Data Brokers** to purchase verified consumer data via x402 payments
- **Businesses** to access data insights through an interactive demo

## 🏗️ Architecture

### Three-Sided Marketplace Structure

```
├── Consumer Side (Dashboard & Wallet Management)
├── Data Broker Side (API & Payment Processing)
└── Interactive Demo (AI Recommendations & Wallet Integration)
```

### Technology Stack

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui
- **Payments**: x402 on Base testnet, RainbowKit for wallet connections
- **Custodial Wallets**: Secure key generation and fund management
- **Off-ramp**: Coinbase Developer Platform (CDP) integration
- **AI**: Vercel AI SDK for recommendations
- **Database**: JSON file-based storage (development)
- **Styling**: Dark theme with glass-morphism design

## 🚀 What's Been Implemented

### ✅ Core Infrastructure

#### Environment Configuration
- Complete `.env` setup with CDP, x402, and AI SDK variables
- Type-safe environment validation with Zod
- **File**: `src/env.js`

#### TypeScript Type System
- Comprehensive type definitions for all marketplace entities
- **File**: `src/types/index.ts`
- **Includes**: Consumer, CustodialWallet, Transaction, DataBroker, BankAccount, etc.

#### JSON Database Schema
- **Files**: 
  - `src/data/consumers.json` - Consumer profiles and linked accounts
  - `src/data/wallets.json` - Custodial wallet data
  - `src/data/transactions.json` - Transaction history
  - `src/data/brokers.json` - Data broker configurations

#### Utility Functions
- **File**: `src/lib/utils.ts`
- **Features**: Currency formatting, date handling, wallet address formatting, pricing calculations, validation functions

### ✅ Custodial Wallet System

#### Wallet Management
- **File**: `src/lib/wallet/custodial.ts`
- **Features**:
  - Secure wallet generation with deterministic key derivation
  - Balance tracking (ETH/USDC)
  - Automatic fund crediting from data sales
  - Withdrawal processing with validation
  - Transaction recording and status updates

#### Security Features
- PIN/password hashing utilities
- Withdrawal limits and validation
- Audit trail for all transactions

### ✅ CDP Off-ramp Integration

#### Mock CDP Service
- **File**: `src/lib/cdp/off-ramp.ts`
- **Features**:
  - Exchange rate fetching
  - Off-ramp transaction initiation
  - Bank account linking
  - KYC verification simulation
  - Fee calculation and processing time estimation

### ✅ UI Components

#### Modern Component Library
- **Files**: `src/components/ui/`
- **Components**: Button, Card, Input, Toast
- **Features**: Dark theme, responsive design, accessibility

#### Toast Notification System
- **Files**: `src/components/ui/toast.tsx`, `src/components/ui/use-toast.ts`
- **Features**: User feedback for account linking, data sync, transactions

### ✅ Consumer Dashboard

#### Complete Dashboard Implementation
- **File**: `src/app/(consumer)/dashboard/page.tsx`
- **Features**:
  - Account linking for 6 platforms (Netflix, Spotify, Instagram, Apple Music, Facebook, Google)
  - Real-time wallet balance display
  - Earnings tracking and statistics
  - KYC status display
  - Recent activity feed
  - Modern glassmorphism UI

#### Account Management
- Mock account linking with toast notifications
- Data synchronization capabilities
- Platform connection status tracking

### ✅ Homepage & Navigation

#### Professional Landing Page
- **File**: `src/app/page.tsx`
- **Features**:
  - Three-sided marketplace overview
  - Feature highlights (custodial wallets, x402 payments, CDP off-ramp)
  - Navigation to consumer, broker, and demo platforms

## 🔧 Setup & Installation

### Prerequisites

```bash
Node.js 18+ and npm
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vertex-ai

# Install dependencies
npm install

# Set up environment variables (optional for demo)
cp .env.example .env.local
```

### Environment Variables (Optional)

```env
# Coinbase Developer Platform
CDP_API_KEY_ID=your_cdp_api_key
CDP_API_KEY_SECRET=your_cdp_api_secret

# x402 Configuration
X402_FACILITATOR_URL=https://x402.org/facilitator

# AI Integration
OPENAI_API_KEY=your_openai_api_key

# Wallet Connection
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### Access Points

- **Homepage**: `http://localhost:3000`
- **Consumer Dashboard**: `http://localhost:3000/consumer/dashboard`
- **Data Broker Portal**: `http://localhost:3000/broker/dashboard` (pending)
- **Interactive Demo**: `http://localhost:3000/demo/search` (pending)

## 🎮 Current Features

### Consumer Experience

1. **Dashboard Access**: Visit the homepage and click "Access Consumer Portal"
2. **Account Linking**: Connect your Netflix, Spotify, Instagram, and other accounts
3. **Wallet Management**: View custodial wallet balance and address
4. **Earnings Tracking**: Monitor total earnings from data sales
5. **Activity Feed**: See recent transactions and data sales

### Mock Data & Interactions

- **Account Linking**: Click "Connect" on any platform for instant mock linking
- **Data Sync**: Click "Sync" on connected accounts for mock synchronization
- **Toast Notifications**: Real-time feedback for all user actions
- **Wallet Balances**: Pre-populated with sample USDC and ETH balances

## 🚧 What's Left to Implement

### High Priority (Core Functionality)

#### 1. Consumer Withdrawal Interface
- **Route**: `/consumer/withdraw`
- **Features**:
  - Withdrawal form with amount input and currency selection
  - Bank account linking via CDP integration
  - External wallet address input
  - Security confirmation (PIN/password)
  - Fee calculation and display
  - Withdrawal processing with status updates

#### 2. Transaction History Page
- **Route**: `/consumer/transactions`
- **Features**:
  - Complete transaction history with filtering
  - Transaction status tracking
  - Export functionality
  - Search and pagination

#### 3. Data Broker API & Dashboard
- **Route**: `/broker/dashboard`
- **Features**:
  - Person lookup by name, state, phone
  - Data source selection with dynamic pricing
  - x402 payment integration
  - Bulk discount calculations
  - API rate limiting and authentication
  - Automatic consumer wallet crediting

#### 4. x402 Payment Middleware
- **Files**: `src/middleware.ts`, API routes with x402 protection
- **Features**:
  - Payment verification for broker API endpoints
  - Automatic payment processing
  - Fund distribution to consumer wallets

### Medium Priority (Enhanced Experience)

#### 5. Interactive Demo Platform
- **Route**: `/demo/search`
- **Features**:
  - RainbowKit wallet connection
  - Person search with sample data
  - AI-powered recommendations using Vercel AI SDK
  - Live payment demonstrations
  - Data visualization and insights

#### 6. Consumer Settings & Security
- **Route**: `/consumer/settings`
- **Features**:
  - Profile management
  - Security settings (PIN change, 2FA)
  - Privacy controls
  - Account preferences
  - KYC verification flow

#### 7. Bank Account Management
- **Features**:
  - CDP bank account verification
  - Multiple account support
  - Account verification status
  - Off-ramp preferences

### Low Priority (Advanced Features)

#### 8. Real-time Features
- **WebSocket Integration**: Live balance updates
- **Push Notifications**: Transaction alerts
- **Real-time Activity Feed**: Live transaction streaming

#### 9. Analytics & Reporting
- **Consumer Analytics**: Earnings reports, data usage insights
- **Broker Analytics**: Purchase history, ROI tracking
- **Platform Analytics**: Marketplace metrics

#### 10. Advanced Security
- **Multi-factor Authentication**: Google Authenticator integration
- **Fraud Detection**: Suspicious activity monitoring
- **Compliance**: Enhanced KYC/AML procedures

## 🔧 Known Issues

### Current Bug
- **File**: `src/lib/cdp/off-ramp.ts:140`
- **Issue**: TypeScript error with `bankName` property
- **Status**: Needs fixing for proper CDP integration

## 📁 Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── (consumer)/              # Consumer dashboard routes
│   │   └── dashboard/           # ✅ Main consumer dashboard
│   ├── (broker)/                # 🚧 Data broker routes (pending)
│   ├── (demo)/                  # 🚧 Demo platform routes (pending)
│   ├── layout.tsx               # ✅ Root layout with toast provider
│   └── page.tsx                 # ✅ Homepage
├── components/
│   └── ui/                      # ✅ shadcn/ui components
├── data/                        # ✅ JSON database files
├── lib/
│   ├── cdp/                     # ✅ CDP off-ramp integration
│   ├── wallet/                  # ✅ Custodial wallet management
│   └── utils.ts                 # ✅ Utility functions
├── styles/
│   └── globals.css              # ✅ Dark theme with CSS variables
├── types/
│   └── index.ts                 # ✅ TypeScript definitions
└── env.js                       # ✅ Environment configuration
```

## 🎨 Design System

### Color Scheme
- **Primary**: Gradient from blue to purple
- **Secondary**: Green to teal for earnings/success
- **Background**: Dark gradient (slate-900 to purple-900)
- **Accent**: Glass-morphism with white/20 opacity

### Components
- **Cards**: Glassmorphism with backdrop blur
- **Buttons**: Gradient backgrounds with hover effects
- **Inputs**: Dark theme with focus rings
- **Toasts**: Slide-in notifications with auto-dismiss

## 🔒 Security Considerations

### Implemented
- Deterministic wallet generation with secure seed
- Transaction validation and limits
- PIN/password hashing utilities
- Audit logging for all financial transactions

### Recommended for Production
- Proper key management (HSMs, KMS)
- Rate limiting on all endpoints
- Real KYC/AML compliance integration
- Multi-signature wallet support
- Regular security audits

## 📊 Performance Considerations

### Current Implementation
- Client-side data loading with mock APIs
- JSON file-based storage (development only)
- Local state management

### Production Recommendations
- Database integration (PostgreSQL, MongoDB)
- Redis caching for frequently accessed data
- API rate limiting and pagination
- CDN for static assets
- Server-side rendering optimization

## 🧪 Testing Strategy

### Recommended Test Structure
```bash
# Unit Tests
- Utility functions (formatting, validation)
- Wallet generation and management
- Pricing calculations

# Integration Tests
- API endpoints with x402 middleware
- CDP off-ramp integration
- Database operations

# E2E Tests
- Complete user flows (account linking, withdrawals)
- Payment processing
- Multi-platform interactions
```

## 🚀 Deployment Guide

### Environment Setup
1. Configure CDP API credentials
2. Set up x402 facilitator endpoints
3. Configure database connections
4. Set up monitoring and logging

### Recommended Architecture
```
├── Frontend (Vercel/Netlify)
├── API Layer (Next.js API routes)
├── Database (PostgreSQL + Redis)
├── Blockchain Integration (Base testnet/mainnet)
└── External Services (CDP, x402, AI APIs)
```

## 📈 Roadmap

### Phase 1: Core Completion (2-3 weeks)
- Fix CDP integration bug
- Implement withdrawal interface
- Complete broker API with x402 integration
- Add transaction history page

### Phase 2: Enhanced Features (3-4 weeks)
- Interactive demo with RainbowKit
- AI recommendations integration
- Advanced security features
- Real-time updates

### Phase 3: Production Ready (4-6 weeks)
- Database migration
- Comprehensive testing
- Security audit
- Performance optimization
- Deployment automation

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Implement changes with tests
4. Submit pull request with detailed description

### Code Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- Component composition patterns
- Comprehensive error handling

## 📞 Support & Documentation

### Additional Resources
- [x402 Documentation](https://docs.cdp.coinbase.com/x402/)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)
- [RainbowKit Docs](https://www.rainbowkit.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/)

### Getting Help
- Check existing issues for common problems
- Review implementation guides in `/docs`
- Join community discussions

---

**Status**: 🟡 **In Development** - Core consumer functionality complete, broker and demo features pending

**Last Updated**: January 2024
