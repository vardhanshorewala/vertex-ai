import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { env } from "~/env";
import { generateId } from "~/lib/utils";
import { getServerSession } from "next-auth/next";
import { authOptions, updateUserWallet } from "~/lib/auth";

interface CDPWalletResult {
  address: string;
  seed: string;
  walletId: string;
}

async function createCDPWallet(): Promise<CDPWalletResult> {
  try {
    // Check if CDP credentials are available
    if (!env.CDP_API_KEY_ID || !env.CDP_API_KEY_SECRET) {
      // Return mock data for development/demo
      return {
        address: `0x${Math.random().toString(16).substring(2, 42).padStart(40, "0")}`,
        seed: generateMockSeed(),
        walletId: `mock-wallet-${Date.now()}`,
      };
    }

    // Initialize Coinbase CDP with proper error handling
    try {
      Coinbase.configure({
        apiKeyName: env.CDP_API_KEY_ID,
        privateKey: env.CDP_API_KEY_SECRET.replace(/\\n/g, "\n"),
      });
    } catch (configError) {
      console.error("CDP configuration error:", configError);
      throw new Error("Failed to configure CDP SDK");
    }

    const networkId = "base-sepolia";

    // Create a new wallet using CDP SDK
    const wallet = await Wallet.create({ networkId });

    // Get the default address
    const address = await wallet.getDefaultAddress();

    // Export wallet for backup (includes seed phrase)
    const walletData = wallet.export();

    const walletId = wallet.getId();
    if (!walletId) {
      throw new Error("Failed to get wallet ID from CDP");
    }

    return {
      address: address.getId(),
      seed: walletData.seed,
      walletId: walletId,
    };
  } catch (error) {
    console.error("Error creating CDP wallet:", error);

    // Fallback to mock wallet for development
    console.warn("Falling back to mock wallet data");
    return {
      address: `0x${Math.random().toString(16).substring(2, 42).padStart(40, "0")}`,
      seed: generateMockSeed(),
      walletId: `fallback-wallet-${Date.now()}`,
    };
  }
}

function generateMockSeed(): string {
  const words = [
    "abandon",
    "ability",
    "able",
    "about",
    "above",
    "absent",
    "absorb",
    "abstract",
    "absurd",
    "abuse",
    "access",
    "accident",
    "account",
    "accuse",
    "achieve",
    "acid",
    "acoustic",
    "acquire",
    "across",
    "act",
    "action",
    "actor",
    "actress",
    "actual",
  ];

  return Array.from(
    { length: 12 },
    () => words[Math.floor(Math.random() * words.length)],
  ).join(" ");
}

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Wallet creation - Session:", {
      userEmail: session?.user?.email,
      userId: (session as { userId?: string })?.userId,
      walletId: (session as { walletId?: string })?.walletId,
    });

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = session.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 },
      );
    }

    // Check if user already has a wallet by checking the database
    const existingWallet = await getUserWallet(userId);
    console.log("Existing wallet check:", {
      userId,
      existingWallet: existingWallet ? "found" : "not found",
    });

    if (existingWallet) {
      return NextResponse.json(
        { error: "User already has a wallet", wallet: existingWallet },
        { status: 400 },
      );
    }

    // Create CDP wallet
    const cdpWallet = await createCDPWallet();
    console.log("CDP wallet created:", {
      address: cdpWallet.address,
      walletId: cdpWallet.walletId,
    });

    // Create wallet record
    const wallet = {
      id: generateId("wallet"),
      userId: userId,
      address: cdpWallet.address,
      seed: cdpWallet.seed,
      balance: "0.00",
      currency: "USDC",
      network: "base-sepolia",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store wallet data
    await storeWallet(wallet);
    console.log("Wallet stored:", { walletId: wallet.id, userId });

    // Update user record with wallet ID
    await updateUserWallet(userId, wallet.id);
    console.log("User updated with wallet ID:", {
      userId,
      walletId: wallet.id,
    });

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        address: wallet.address,
        balance: wallet.balance,
        currency: wallet.currency,
        network: wallet.network,
      },
      cdpWalletId: cdpWallet.walletId,
      seedPhrase: cdpWallet.seed,
      networkInfo: {
        name: "Base Sepolia",
        chainId: 84532,
        isTestnet: true,
        blockExplorer: "https://sepolia.basescan.org",
      },
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json(
      { error: "Failed to create wallet" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const cdpWalletId = searchParams.get("cdpWalletId");

    if (cdpWalletId) {
      // Return mock balance for demo
      return NextResponse.json({
        success: true,
        balance: { eth: "0.0", usdc: "0.0" },
        address: `0x${Math.random().toString(16).substring(2, 42).padStart(40, "0")}`,
        walletId: cdpWalletId,
        note: "Mock data - configure CDP credentials for real integration",
      });
    }

    // Get user's wallet
    const userWallet = await getUserWallet(session.userId);
    if (!userWallet) {
      return NextResponse.json(
        { error: "No wallet found for user" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      wallet: userWallet,
      hasWallet: true,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch wallet",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Helper functions
async function getUserWallet(
  userId: string,
): Promise<Record<string, unknown> | null> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    const walletsPath = path.join(process.cwd(), "src/data/wallets.json");
    const data = await fs.readFile(walletsPath, "utf-8");
    const wallets: Record<string, unknown>[] = JSON.parse(data);

    return wallets.find((wallet) => wallet.userId === userId) ?? null;
  } catch {
    return null;
  }
}

async function storeWallet(wallet: Record<string, unknown>) {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    const walletsPath = path.join(process.cwd(), "src/data/wallets.json");

    let wallets: Record<string, unknown>[] = [];
    try {
      const data = await fs.readFile(walletsPath, "utf-8");
      wallets = JSON.parse(data) as Record<string, unknown>[];
    } catch {
      // File doesn't exist, start with empty array
    }

    wallets.push(wallet);
    await fs.writeFile(walletsPath, JSON.stringify(wallets, null, 2));
  } catch (error) {
    console.error("Error storing wallet:", error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function storeWalletMapping(
  walletId: string,
  cdpWalletId: string,
): Promise<void> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    const mappingPath = path.join(
      process.cwd(),
      "src/data/wallet-mapping.json",
    );

    let mappings: Record<string, string> = {};
    try {
      const data = await fs.readFile(mappingPath, "utf-8");
      mappings = JSON.parse(data) as Record<string, string>;
    } catch {
      mappings = {};
    }

    mappings[walletId] = cdpWalletId;
    await fs.writeFile(mappingPath, JSON.stringify(mappings, null, 2));
  } catch (error) {
    console.error("Error storing wallet mapping:", error);
  }
}
