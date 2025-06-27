"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Globe,
  Loader2,
} from "lucide-react";
import {
  formatCurrency,
  calculateNetworkFee,
  estimateWithdrawalTime,
  validateWalletAddress,
} from "~/lib/utils";
import type { CustodialWallet, BankAccount } from "~/types";
import Link from "next/link";

const mockWallet: CustodialWallet = {
  id: "wallet-consumer-1",
  consumerId: "consumer-1",
  address: "0x1234567890123456789012345678901234567890",
  privateKey:
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  balance: {
    eth: "0.0045",
    usdc: "12.50",
  },
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T15:30:00Z",
};

const mockBankAccounts: BankAccount[] = [
  {
    id: "bank-001",
    consumerId: "consumer-1",
    accountType: "checking",
    last4: "1234",
    bankName: "Chase Bank",
    isVerified: true,
    addedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "bank-002",
    consumerId: "consumer-1",
    accountType: "savings",
    last4: "5678",
    bankName: "Bank of America",
    isVerified: false,
    addedAt: "2024-01-18T09:00:00Z",
  },
];

export default function WithdrawPage() {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<CustodialWallet | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [withdrawalMethod, setWithdrawalMethod] = useState<"wallet" | "bank">(
    "wallet",
  );
  const [currency, setCurrency] = useState<"eth" | "usdc">("usdc");
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [securityPin, setSecurityPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSecurityStep, setShowSecurityStep] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setWallet(mockWallet);
      setBankAccounts(mockBankAccounts);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const validateWithdrawal = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return false;
    }

    const withdrawalAmount = parseFloat(amount);
    const availableBalance = parseFloat(wallet?.balance[currency] || "0");

    if (withdrawalAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${formatCurrency(availableBalance, currency.toUpperCase() as "ETH" | "USDC")} available`,
        variant: "destructive",
      });
      return false;
    }

    if (withdrawalMethod === "wallet") {
      if (!destinationAddress) {
        toast({
          title: "Missing Address",
          description: "Please enter a destination wallet address",
          variant: "destructive",
        });
        return false;
      }

      if (!validateWalletAddress(destinationAddress)) {
        toast({
          title: "Invalid Address",
          description: "Please enter a valid Ethereum wallet address",
          variant: "destructive",
        });
        return false;
      }
    } else {
      if (!selectedBankAccount) {
        toast({
          title: "No Bank Account",
          description: "Please select a bank account for withdrawal",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleWithdrawal = async () => {
    if (!validateWithdrawal()) return;

    setShowSecurityStep(true);
  };

  const confirmWithdrawal = async () => {
    if (!securityPin) {
      toast({
        title: "Security PIN Required",
        description: "Please enter your security PIN to confirm withdrawal",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Withdrawal Initiated",
        description: `Your withdrawal of ${formatCurrency(amount, currency.toUpperCase() as "ETH" | "USDC")} has been initiated. Expected completion: ${estimateWithdrawalTime(withdrawalMethod)}`,
        variant: "default",
      });

      // Reset form
      setAmount("");
      setDestinationAddress("");
      setSelectedBankAccount("");
      setSecurityPin("");
      setShowSecurityStep(false);
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateFees = () => {
    if (!amount) return { networkFee: "0", processingFee: "0", totalFees: "0" };

    const networkFee = calculateNetworkFee(
      amount,
      currency.toUpperCase() as "ETH" | "USDC",
    );
    const processingFee = withdrawalMethod === "bank" ? "2.50" : "0";
    const totalFees = (
      parseFloat(networkFee) + parseFloat(processingFee)
    ).toString();

    return { networkFee, processingFee, totalFees };
  };

  const { networkFee, processingFee, totalFees } = calculateFees();
  const netAmount = amount
    ? (parseFloat(amount) - parseFloat(totalFees)).toFixed(2)
    : "0";

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-lg">
            Loading withdrawal interface...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Globe className="text-primary-foreground h-5 w-5" />
              </div>
              <h1 className="text-foreground text-xl font-bold">DataMarket</h1>
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/consumer/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="section-padding">
        <div className="container max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="text-foreground mb-2 text-4xl font-bold">
              Withdraw Funds
            </h1>
            <p className="text-muted-foreground text-lg">
              Transfer your earnings to an external wallet or bank account.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              {!showSecurityStep ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary rounded-lg p-3">
                          <div className="text-muted-foreground mb-1 text-xs">
                            USDC
                          </div>
                          <div className="text-lg font-bold">
                            {formatCurrency(
                              wallet?.balance.usdc || "0",
                              "USDC",
                            )}
                          </div>
                        </div>
                        <div className="bg-secondary rounded-lg p-3">
                          <div className="text-muted-foreground mb-1 text-xs">
                            ETH
                          </div>
                          <div className="text-lg font-bold">
                            {formatCurrency(wallet?.balance.eth || "0", "ETH")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Withdrawal Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setWithdrawalMethod("wallet")}
                          className={`rounded-lg border-2 p-4 text-center transition-colors ${
                            withdrawalMethod === "wallet"
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:bg-secondary"
                          }`}
                        >
                          <Wallet className="mx-auto mb-2 h-8 w-8" />
                          <div className="font-medium">External Wallet</div>
                          <div className="text-muted-foreground text-xs">
                            2-5 minutes
                          </div>
                        </button>
                        <button
                          onClick={() => setWithdrawalMethod("bank")}
                          className={`rounded-lg border-2 p-4 text-center transition-colors ${
                            withdrawalMethod === "bank"
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:bg-secondary"
                          }`}
                        >
                          <CreditCard className="mx-auto mb-2 h-8 w-8" />
                          <div className="font-medium">Bank Account</div>
                          <div className="text-muted-foreground text-xs">
                            1-3 business days
                          </div>
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Amount & Destination</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Currency
                          </label>
                          <select
                            value={currency}
                            onChange={(e) =>
                              setCurrency(e.target.value as "eth" | "usdc")
                            }
                            className="bg-secondary border-border w-full rounded-md border p-2"
                          >
                            <option value="usdc">USDC</option>
                            <option value="eth">ETH</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Amount
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                            />
                            <button
                              onClick={() =>
                                setAmount(wallet?.balance[currency] || "0")
                              }
                              className="text-primary absolute top-1/2 right-3 -translate-y-1/2 text-xs hover:underline"
                            >
                              MAX
                            </button>
                          </div>
                        </div>
                      </div>

                      {withdrawalMethod === "wallet" ? (
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Wallet Address
                          </label>
                          <Input
                            placeholder="0x..."
                            value={destinationAddress}
                            onChange={(e) =>
                              setDestinationAddress(e.target.value)
                            }
                            className="font-mono"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Select Bank Account
                          </label>
                          <select
                            value={selectedBankAccount}
                            onChange={(e) =>
                              setSelectedBankAccount(e.target.value)
                            }
                            className="bg-secondary border-border w-full rounded-md border p-2"
                          >
                            <option value="">Select an account...</option>
                            {bankAccounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.bankName} - {account.accountType}{" "}
                                ending in {account.last4}
                                {!account.isVerified && " (Unverified)"}
                              </option>
                            ))}
                          </select>
                          <Button variant="secondary" className="mt-3 w-full">
                            + Add New Bank Account
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Button
                    onClick={handleWithdrawal}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="w-full"
                    size="lg"
                  >
                    Continue to Security Verification
                  </Button>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="text-primary mr-3 h-5 w-5" />
                      Security Verification
                    </CardTitle>
                    <CardDescription>
                      Please confirm your withdrawal with your 4-digit security
                      PIN.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-warning/10 border-warning/20 flex items-start space-x-3 rounded-lg border p-4">
                      <AlertTriangle className="text-warning mt-0.5 h-5 w-5 flex-shrink-0" />
                      <div>
                        <h4 className="text-warning mb-1 font-medium">
                          Confirmation Required
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          This is a final security check before initiating the
                          withdrawal.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Security PIN
                      </label>
                      <Input
                        type="password"
                        placeholder="••••"
                        value={securityPin}
                        onChange={(e) => setSecurityPin(e.target.value)}
                        maxLength={4}
                        className="text-center text-lg tracking-[0.5em]"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => setShowSecurityStep(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={confirmWithdrawal}
                        disabled={isProcessing || !securityPin}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Withdrawal
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Withdrawal Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="capitalize">{withdrawalMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <span>{currency.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span>
                      {formatCurrency(
                        amount || "0",
                        currency.toUpperCase() as "ETH" | "USDC",
                      )}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Network Fee:
                      </span>
                      <span>
                        {formatCurrency(
                          networkFee,
                          currency.toUpperCase() as "ETH" | "USDC",
                        )}
                      </span>
                    </div>
                    {withdrawalMethod === "bank" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Processing Fee:
                        </span>
                        <span>${processingFee}</span>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between text-base font-bold">
                      <span>You'll Receive:</span>
                      <span className="text-success">
                        {formatCurrency(
                          netAmount,
                          currency.toUpperCase() as "ETH" | "USDC",
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Time:</span>
                    <span>{estimateWithdrawalTime(withdrawalMethod)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="text-info mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="mb-1 font-medium">Withdrawal Information</p>
                      <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs">
                        <li>
                          Wallet withdrawals are processed on Base network.
                        </li>
                        <li>Bank withdrawals may take 1-3 business days.</li>
                        <li>Fees are deducted from the withdrawal amount.</li>
                        <li>All withdrawals require security confirmation.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
