import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { env } from "~/env";

export async function POST(request: NextRequest) {
  try {
    const { cdpWalletId } = await request.json();

    if (!cdpWalletId) {
      return NextResponse.json(
        { error: "CDP Wallet ID is required" },
        { status: 400 },
      );
    }

    // Check if CDP credentials are available
    if (!env.CDP_API_KEY_ID || !env.CDP_API_KEY_SECRET) {
      // Return mock funding response for demo
      return NextResponse.json({
        success: true,
        message: "Wallet funded successfully (demo mode)",
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        balance: {
          eth: "0.1",
          usdc: "100.0",
        },
        faucetAmount: "0.1",
        networkInfo: {
          name: "Base Sepolia",
          chainId: 84532,
          blockExplorer: "https://sepolia.basescan.org",
        },
        note: "Demo funding - configure CDP credentials for real testnet funding",
      });
    }

    // Initialize Coinbase CDP with proper error handling
    try {
      Coinbase.configure({
        apiKeyName: env.CDP_API_KEY_ID,
        privateKey: env.CDP_API_KEY_SECRET.replace(/\\n/g, "\n"),
      });
    } catch (configError) {
      console.error("CDP configuration error:", configError);
      return NextResponse.json(
        {
          error: "Failed to configure CDP SDK",
          details:
            configError instanceof Error
              ? configError.message
              : "Configuration error",
        },
        { status: 500 },
      );
    }

    // Fetch the wallet
    const wallet = await Wallet.fetch(cdpWalletId);
    const address = await wallet.getDefaultAddress();

    // Request testnet funds from the faucet
    const faucetTransaction = await address.faucet();

    // Wait for the transaction to complete
    await faucetTransaction.wait();

    // Get updated balance
    const balances = await address.listBalances();
    let ethBalance = "0.0";
    let usdcBalance = "0.0";

    balances.forEach((balance: any) => {
      const assetId = balance.asset.assetId;
      if (assetId === "eth") {
        ethBalance = balance.amount.toString();
      } else if (assetId === "usdc") {
        usdcBalance = balance.amount.toString();
      }
    });

    return NextResponse.json({
      success: true,
      message: "Wallet funded successfully",
      transactionHash: faucetTransaction.getTransactionHash(),
      balance: {
        eth: ethBalance,
        usdc: usdcBalance,
      },
      faucetAmount: "0.1",
      networkInfo: {
        name: "Base Sepolia",
        chainId: 84532,
        blockExplorer: "https://sepolia.basescan.org",
      },
    });
  } catch (error) {
    console.error("Error funding wallet:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Faucet rate limit exceeded. Please try again later." },
          { status: 429 },
        );
      }
      if (error.message.includes("already funded")) {
        return NextResponse.json(
          {
            error:
              "Wallet has already been funded recently. Please wait before requesting more funds.",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to fund wallet",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cdpWalletId = searchParams.get("cdpWalletId");

    if (!cdpWalletId) {
      return NextResponse.json(
        { error: "CDP Wallet ID is required" },
        { status: 400 },
      );
    }

    // Check if CDP credentials are available
    if (!env.CDP_API_KEY_ID || !env.CDP_API_KEY_SECRET) {
      // Return mock balance for demo
      return NextResponse.json({
        success: true,
        balance: {
          eth: "0.0",
          usdc: "0.0",
        },
        address: `0x${Math.random().toString(16).substring(2, 42).padStart(40, "0")}`,
        canRequestFunds: true,
        faucetInfo: {
          maxAmount: "0.1 ETH",
          cooldownPeriod: "24 hours",
          network: "Base Sepolia",
        },
        note: "Demo mode - configure CDP credentials for real integration",
      });
    }

    // Initialize Coinbase CDP
    try {
      Coinbase.configure({
        apiKeyName: env.CDP_API_KEY_ID,
        privateKey: env.CDP_API_KEY_SECRET.replace(/\\n/g, "\n"),
      });
    } catch (configError) {
      console.error("CDP configuration error:", configError);
      return NextResponse.json(
        {
          error: "Failed to configure CDP SDK",
          details:
            configError instanceof Error
              ? configError.message
              : "Configuration error",
        },
        { status: 500 },
      );
    }

    // Fetch wallet and get current balance
    const wallet = await Wallet.fetch(cdpWalletId);
    const address = await wallet.getDefaultAddress();
    const balances = await address.listBalances();

    let ethBalance = "0.0";
    let usdcBalance = "0.0";

    balances.forEach((balance: any) => {
      const assetId = balance.asset.assetId;
      if (assetId === "eth") {
        ethBalance = balance.amount.toString();
      } else if (assetId === "usdc") {
        usdcBalance = balance.amount.toString();
      }
    });

    return NextResponse.json({
      success: true,
      balance: {
        eth: ethBalance,
        usdc: usdcBalance,
      },
      address: address.getId(),
      canRequestFunds: parseFloat(ethBalance) < 0.01,
      faucetInfo: {
        maxAmount: "0.1 ETH",
        cooldownPeriod: "24 hours",
        network: "Base Sepolia",
      },
    });
  } catch (error) {
    console.error("Error getting wallet info:", error);
    return NextResponse.json(
      {
        error: "Failed to get wallet information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
