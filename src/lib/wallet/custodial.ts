import { createHash } from "crypto";
import { env } from "~/env";
import type { CustodialWallet, Transaction } from "~/types";
import { generateId } from "../utils";

// Mock wallet generation - in production, use proper key derivation
export function generateCustodialWallet(consumerId: string): CustodialWallet {
  const secretKey = env.MARKETPLACE_SECRET_KEY;
  const combinedSeed = `${secretKey}-${consumerId}-${Date.now()}`;

  // Generate deterministic private key from seed
  const hash = createHash("sha256").update(combinedSeed).digest("hex");
  const privateKey = `0x${hash}`;

  // Generate address from private key (simplified for demo)
  const addressHash = createHash("sha256").update(privateKey).digest("hex");
  const address = `0x${addressHash.slice(0, 40)}`;

  return {
    id: generateId("wallet"),
    consumerId,
    address,
    privateKey,
    balance: {
      eth: "0.0000",
      usdc: "0.0000",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getWalletByConsumerId(
  consumerId: string,
): Promise<CustodialWallet | null> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    const walletsPath = path.join(process.cwd(), "src/data/wallets.json");
    const walletsData = await fs.readFile(walletsPath, "utf-8");
    const wallets: CustodialWallet[] = JSON.parse(walletsData);

    return wallets.find((wallet) => wallet.consumerId === consumerId) || null;
  } catch (error) {
    console.error("Error reading wallets:", error);
    return null;
  }
}

export async function updateWalletBalance(
  walletId: string,
  currency: "eth" | "usdc",
  amount: string,
  operation: "add" | "subtract" = "add",
): Promise<boolean> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    const walletsPath = path.join(process.cwd(), "src/data/wallets.json");
    const walletsData = await fs.readFile(walletsPath, "utf-8");
    const wallets: CustodialWallet[] = JSON.parse(walletsData);

    const walletIndex = wallets.findIndex((wallet) => wallet.id === walletId);
    if (walletIndex === -1) return false;

    const wallet = wallets[walletIndex];
    if (!wallet) return false;

    const currentBalance = parseFloat(wallet.balance[currency]);
    const changeAmount = parseFloat(amount);

    let newBalance: number;
    if (operation === "add") {
      newBalance = currentBalance + changeAmount;
    } else {
      newBalance = Math.max(0, currentBalance - changeAmount); // Prevent negative balances
    }

    wallet.balance[currency] = newBalance.toFixed(currency === "eth" ? 6 : 2);
    wallet.updatedAt = new Date().toISOString();

    await fs.writeFile(walletsPath, JSON.stringify(wallets, null, 2));
    return true;
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    return false;
  }
}

export async function creditConsumerWallet(
  consumerId: string,
  amount: string,
  currency: "eth" | "usdc",
  description: string,
  metadata?: Record<string, any>,
): Promise<{ success: boolean; transactionId?: string }> {
  try {
    const wallet = await getWalletByConsumerId(consumerId);
    if (!wallet) {
      return { success: false };
    }

    // Update wallet balance
    const balanceUpdated = await updateWalletBalance(
      wallet.id,
      currency,
      amount,
      "add",
    );
    if (!balanceUpdated) {
      return { success: false };
    }

    // Record transaction
    const transaction: Transaction = {
      id: generateId("txn"),
      type: "data_sale",
      toWallet: wallet.address,
      amount,
      currency: currency.toUpperCase() as "ETH" | "USDC",
      status: "completed",
      description,
      metadata,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    await recordTransaction(transaction);

    return { success: true, transactionId: transaction.id };
  } catch (error) {
    console.error("Error crediting consumer wallet:", error);
    return { success: false };
  }
}

export async function processWithdrawal(
  consumerId: string,
  amount: string,
  currency: "eth" | "usdc",
  method: "wallet" | "bank",
  destination: { walletAddress?: string; bankAccountId?: string },
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    const wallet = await getWalletByConsumerId(consumerId);
    if (!wallet) {
      return { success: false, error: "Wallet not found" };
    }

    const currentBalance = parseFloat(wallet.balance[currency]);
    const withdrawalAmount = parseFloat(amount);

    if (currentBalance < withdrawalAmount) {
      return { success: false, error: "Insufficient balance" };
    }

    // Update wallet balance
    const balanceUpdated = await updateWalletBalance(
      wallet.id,
      currency,
      amount,
      "subtract",
    );
    if (!balanceUpdated) {
      return { success: false, error: "Failed to update balance" };
    }

    // Record transaction
    const transaction: Transaction = {
      id: generateId("txn"),
      type: "withdrawal",
      fromWallet: wallet.address,
      toWallet: destination.walletAddress,
      amount,
      currency: currency.toUpperCase() as "ETH" | "USDC",
      status: "pending",
      description: `Withdrawal to ${method === "wallet" ? "external wallet" : "bank account"}`,
      metadata: {
        withdrawalMethod: method,
        bankAccountId: destination.bankAccountId,
      },
      createdAt: new Date().toISOString(),
    };

    await recordTransaction(transaction);

    // Simulate processing time
    setTimeout(async () => {
      await updateTransactionStatus(transaction.id, "completed");
    }, 5000); // 5 seconds for demo

    return { success: true, transactionId: transaction.id };
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return { success: false, error: "Processing failed" };
  }
}

async function recordTransaction(transaction: Transaction): Promise<void> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    const transactionsPath = path.join(
      process.cwd(),
      "src/data/transactions.json",
    );
    const transactionsData = await fs.readFile(transactionsPath, "utf-8");
    const transactions: Transaction[] = JSON.parse(transactionsData);

    transactions.unshift(transaction); // Add to beginning for chronological order

    await fs.writeFile(transactionsPath, JSON.stringify(transactions, null, 2));
  } catch (error) {
    console.error("Error recording transaction:", error);
  }
}

async function updateTransactionStatus(
  transactionId: string,
  status: "pending" | "completed" | "failed",
): Promise<void> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    const transactionsPath = path.join(
      process.cwd(),
      "src/data/transactions.json",
    );
    const transactionsData = await fs.readFile(transactionsPath, "utf-8");
    const transactions: Transaction[] = JSON.parse(transactionsData);

    const transactionIndex = transactions.findIndex(
      (tx) => tx.id === transactionId,
    );
    if (transactionIndex !== -1) {
      const transaction = transactions[transactionIndex];
      if (transaction) {
        transaction.status = status;
        if (status === "completed") {
          transaction.completedAt = new Date().toISOString();
        }

        await fs.writeFile(
          transactionsPath,
          JSON.stringify(transactions, null, 2),
        );
      }
    }
  } catch (error) {
    console.error("Error updating transaction status:", error);
  }
}

export async function getTransactionHistory(
  consumerId: string,
): Promise<Transaction[]> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    const wallet = await getWalletByConsumerId(consumerId);
    if (!wallet) return [];

    const transactionsPath = path.join(
      process.cwd(),
      "src/data/transactions.json",
    );
    const transactionsData = await fs.readFile(transactionsPath, "utf-8");
    const transactions: Transaction[] = JSON.parse(transactionsData);

    return transactions.filter(
      (tx) =>
        tx.fromWallet === wallet.address || tx.toWallet === wallet.address,
    );
  } catch (error) {
    console.error("Error getting transaction history:", error);
    return [];
  }
}

export function validateWithdrawalLimits(
  amount: string,
  currency: "eth" | "usdc",
): { valid: boolean; error?: string } {
  const numAmount = parseFloat(amount);

  if (numAmount <= 0) {
    return { valid: false, error: "Amount must be greater than 0" };
  }

  // Set withdrawal limits
  const limits = {
    eth: { min: 0.001, max: 10.0 },
    usdc: { min: 1.0, max: 10000.0 },
  };

  const limit = limits[currency];

  if (numAmount < limit.min) {
    return {
      valid: false,
      error: `Minimum withdrawal is ${limit.min} ${currency.toUpperCase()}`,
    };
  }

  if (numAmount > limit.max) {
    return {
      valid: false,
      error: `Maximum withdrawal is ${limit.max} ${currency.toUpperCase()}`,
    };
  }

  return { valid: true };
}
