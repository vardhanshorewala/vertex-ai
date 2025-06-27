export interface Consumer {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  custodialWalletId: string;
  linkedAccounts: LinkedAccount[];
  kycStatus: "pending" | "verified" | "rejected";
  securityPin?: string; // Hashed PIN for wallet access
}

export interface LinkedAccount {
  id: string;
  platform:
    | "netflix"
    | "spotify"
    | "instagram"
    | "apple-music"
    | "facebook"
    | "google";
  accountId: string;
  linkedAt: string;
  dataAvailable: boolean;
  lastSync?: string;
}

export interface CustodialWallet {
  id: string;
  consumerId: string;
  address: string;
  privateKey: string; // Encrypted in production
  balance: {
    eth: string;
    usdc: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: "data_sale" | "withdrawal" | "deposit";
  fromWallet?: string;
  toWallet?: string;
  amount: string;
  currency: "ETH" | "USDC";
  status: "pending" | "completed" | "failed";
  description: string;
  metadata?: {
    dataBrokerId?: string;
    dataSourcesRequested?: string[];
    withdrawalMethod?: "wallet" | "bank";
    bankAccountId?: string;
  };
  createdAt: string;
  completedAt?: string;
}

export interface DataBroker {
  id: string;
  name: string;
  apiKey: string;
  walletAddress: string;
  isActive: boolean;
  rateLimit: {
    requestsPerHour: number;
    currentUsage: number;
    resetTime: string;
  };
  createdAt: string;
}

export interface DataRequest {
  searchParams: {
    fullName: string;
    state: string;
    phoneNumber?: string;
  };
  requestedSources: DataSource[];
  quantity: number;
}

export interface DataSource {
  platform: "netflix" | "spotify" | "instagram" | "apple-music" | "facebook";
  price: number; // Additional cost in USD
}

export interface PricingModel {
  basePrice: number; // $1.50 per profile
  sourceMultipliers: Record<string, number>;
  bulkDiscounts: {
    tier1: { minimum: number; discount: number }; // 10+ profiles, 10% off
    tier2: { minimum: number; discount: number }; // 50+ profiles, 20% off
  };
}

export interface MockDataSet {
  netflix?: {
    viewingHistory: Array<{
      title: string;
      genre: string;
      watchedAt: string;
      rating?: number;
    }>;
    preferences: {
      favoriteGenres: string[];
      watchingHabits: string;
    };
  };
  spotify?: {
    listeningHistory: Array<{
      track: string;
      artist: string;
      album: string;
      playedAt: string;
      duration: number;
    }>;
    preferences: {
      topGenres: string[];
      discoveryMode: string;
    };
  };
  instagram?: {
    engagementData: {
      postsPerWeek: number;
      averageLikes: number;
      topHashtags: string[];
    };
    interests: string[];
  };
  appleMusicc?: {
    musicLibrary: {
      totalSongs: number;
      topArtists: string[];
      recentlyPlayed: string[];
    };
  };
  facebook?: {
    activityData: {
      postsPerMonth: number;
      friendsCount: number;
      pageInteractions: string[];
    };
  };
}

export interface WithdrawalRequest {
  id: string;
  consumerId: string;
  amount: string;
  currency: "ETH" | "USDC";
  method: "wallet" | "bank";
  destination: {
    walletAddress?: string;
    bankAccountId?: string;
  };
  status: "pending" | "processing" | "completed" | "failed";
  estimatedCompletion?: string;
  fees: {
    networkFee: string;
    processingFee: string;
  };
  createdAt: string;
  processedAt?: string;
}

export interface BankAccount {
  id: string;
  consumerId: string;
  accountType: "checking" | "savings";
  last4: string;
  bankName: string;
  isVerified: boolean;
  addedAt: string;
}

export interface AIRecommendation {
  id: string;
  type: "movie" | "music" | "content";
  title: string;
  description: string;
  confidence: number;
  basedOn: string[];
  metadata?: {
    genre?: string;
    releaseYear?: number;
    rating?: number;
    platform?: string;
  };
}

export interface X402PaymentRequest {
  amount: string;
  currency: string;
  description: string;
  recipientAddress: string;
  metadata?: Record<string, unknown>;
}

export interface CDPOffRampResponse {
  transactionId: string;
  status: "pending" | "processing" | "completed" | "failed";
  estimatedAmount: string;
  exchangeRate: string;
  fees: {
    networkFee: string;
    platformFee: string;
  };
  estimatedCompletion: string;
}

export interface SecurityEvent {
  id: string;
  consumerId: string;
  eventType: "login" | "withdrawal_request" | "pin_change" | "account_link";
  ipAddress: string;
  userAgent: string;
  success: boolean;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// Utility types
export type NetworkType = "base-sepolia" | "base";
export type WalletProvider = "metamask" | "walletconnect" | "coinbase";
export type NotificationType = "success" | "error" | "warning" | "info";
