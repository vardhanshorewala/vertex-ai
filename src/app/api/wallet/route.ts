import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = (session as any).userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 },
      );
    }

    // Get user's wallet
    const userWallet = await getUserWallet(userId);

    if (!userWallet) {
      return NextResponse.json({
        success: true,
        hasWallet: false,
        wallet: null,
      });
    }

    return NextResponse.json({
      success: true,
      hasWallet: true,
      wallet: {
        id: userWallet.id,
        address: userWallet.address,
        balance: {
          usdc: userWallet.balance || "0.00",
          eth: "0.00", // Mock ETH balance
        },
        currency: userWallet.currency,
        network: userWallet.network,
        createdAt: userWallet.createdAt,
        updatedAt: userWallet.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 },
    );
  }
}

// Helper function
async function getUserWallet(userId: string): Promise<any | null> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    const walletsPath = path.join(process.cwd(), "src/data/wallets.json");
    const data = await fs.readFile(walletsPath, "utf-8");
    const wallets: any[] = JSON.parse(data);

    return wallets.find((wallet) => wallet.userId === userId) || null;
  } catch {
    return null;
  }
}
