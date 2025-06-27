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

// Contract addresses
export const X402_PAYMENT_ADDRESS =
  "0x1176FCbC388c500D01E8B8ceDd816A86C3365156";

// Base Sepolia USDC contract
export const USDC_CONTRACT_ADDRESS =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC

// Payment recipient wallet address
export const PAYMENT_RECIPIENT_ADDRESS =
  "0x2211d1D0020DAEA8039E46Cf1367962070d77DA9";

// ERC20 ABI for USDC interactions
export const ERC20_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
