import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";

// Get WalletConnect project ID
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id";

// Singleton QueryClient to prevent re-initialization
let queryClientInstance: QueryClient | undefined;

export const getQueryClient = () => {
  queryClientInstance ??= new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  });
  return queryClientInstance;
};

export const queryClient = getQueryClient();

// Memoized connectors to prevent recreation
const getConnectors = () => {
  return connectorsForWallets(
    [
      {
        groupName: "Recommended",
        wallets: [metaMaskWallet, walletConnectWallet, coinbaseWallet],
      },
    ],
    {
      appName: "Data Marketplace",
      projectId,
    },
  );
};

// Singleton config to prevent re-initialization
let configInstance: ReturnType<typeof createConfig> | undefined;

export const getConfig = () => {
  configInstance ??= createConfig({
    connectors: getConnectors(),
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(),
    },
    ssr: true,
  });
  return configInstance;
};

export const config = getConfig();

// Contract address for x402 payments
export const X402_PAYMENT_ADDRESS =
  "0x1176FCbC388c500D01E8B8ceDd816A86C3365156";

// Base Sepolia USDC contract (mock for demo)
export const USDC_CONTRACT_ADDRESS =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC
