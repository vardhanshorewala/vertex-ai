"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Wallet,
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Download,
  ArrowLeft,
  Shield,
  Key,
  ExternalLink,
  Loader2,
  Globe,
} from "lucide-react";
import { formatAddress } from "~/lib/utils";
import { toast } from "~/components/ui/use-toast";
import Link from "next/link";

interface WalletCreationResult {
  wallet: {
    id: string;
    address: string;
    balance: {
      eth: string;
      usdc: string;
    };
  };
  cdpWalletId: string;
  seedPhrase: string;
  networkInfo: {
    name: string;
    chainId: number;
    isTestnet: boolean;
    blockExplorer: string;
  };
}

function PageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [walletResult, setWalletResult] = useState<WalletCreationResult | null>(
    null,
  );
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhraseCopied, setSeedPhraseCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "create" | "backup" | "complete"
  >("create");
  const [isFunding, setIsFunding] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
  }, [status, router]);

  const handleCreateWallet = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/wallet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          networkId: "base-sepolia",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create wallet");
      }

      setWalletResult(data);
      setCurrentStep("backup");

      toast({
        title: "Wallet Created Successfully!",
        description:
          "Your CDP wallet has been created on Base Sepolia testnet.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Failed to Create Wallet",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async (text: string, type: "seed" | "address") => {
    await navigator.clipboard.writeText(text);
    if (type === "seed") {
      setSeedPhraseCopied(true);
      setTimeout(() => setSeedPhraseCopied(false), 2000);
    } else {
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
    toast({
      title: "Copied to Clipboard",
      description: `Your ${type === "seed" ? "seed phrase" : "wallet address"} has been copied.`,
      variant: "default",
    });
  };

  const handleDownloadBackup = () => {
    if (walletResult) {
      const backupData = {
        seedPhrase: walletResult.seedPhrase,
        address: walletResult.wallet.address,
        cdpWalletId: walletResult.cdpWalletId,
        networkInfo: walletResult.networkInfo,
        createdAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wallet-backup-${walletResult.wallet.address.slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Downloaded",
        description: "Your wallet backup file has been downloaded.",
        variant: "default",
      });
    }
  };

  const handleConfirmBackup = () => {
    setCurrentStep("complete");
    toast({
      title: "Wallet Setup Complete!",
      description: "Your CDP wallet is ready to use.",
      variant: "default",
    });
  };

  const handleFundWallet = async () => {
    if (!walletResult?.cdpWalletId) return;

    setIsFunding(true);

    try {
      const response = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cdpWalletId: walletResult.cdpWalletId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fund wallet");
      }

      toast({
        title: "Wallet Funded!",
        description: `Successfully funded with ${data.faucetAmount} ETH. ${data.note || ""}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error funding wallet:", error);
      toast({
        title: "Funding Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsFunding(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "create":
        return (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="text-primary mr-3 h-6 w-6" />
                Create Your CDP Wallet
              </CardTitle>
              <CardDescription>
                Generate a new custodial wallet on Base Sepolia testnet using
                Coinbase's secure Developer Platform infrastructure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <Shield className="text-success mt-1 h-5 w-5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Secure Infrastructure</h3>
                    <p className="text-muted-foreground text-sm">
                      Built on Coinbase's enterprise-grade security
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Key className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Full Control</h3>
                    <p className="text-muted-foreground text-sm">
                      You own your private keys and seed phrase
                    </p>
                  </div>
                </div>
              </div>

              <Card className="bg-secondary">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">
                    Network Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network</span>
                    <span>Base Sepolia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chain ID</span>
                    <span>84532</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>Testnet</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Block Explorer
                    </span>
                    <a
                      href="https://sepolia.basescan.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary flex items-center hover:underline"
                    >
                      BaseScan <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-warning/10 border-warning/20 flex items-start space-x-3 rounded-lg border p-4">
                <AlertTriangle className="text-warning mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <h4 className="text-warning mb-1 font-medium">Important</h4>
                  <p className="text-muted-foreground text-sm">
                    This wallet is for testnet use only. You will receive a seed
                    phrase that you must store securely. It is the only way to
                    recover your wallet.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCreateWallet}
                disabled={isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Wallet...
                  </>
                ) : (
                  "Create CDP Wallet"
                )}
              </Button>
            </CardContent>
          </Card>
        );

      case "backup":
        return (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="text-success mr-3 h-6 w-6" />
                Wallet Created Successfully
              </CardTitle>
              <CardDescription>
                Please securely store your seed phrase. This is the only way to
                recover your wallet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <div className="bg-secondary flex-1 rounded p-3 font-mono text-sm break-all">
                    {walletResult?.wallet.address}
                  </div>
                  <Button
                    onClick={() =>
                      handleCopy(walletResult?.wallet.address || "", "address")
                    }
                    variant="outline"
                    size="icon"
                  >
                    {addressCopied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Seed Phrase (Recovery Phrase)
                </label>
                <div className="bg-secondary border-destructive/30 rounded border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-destructive text-sm font-medium">
                      ⚠️ Keep this safe and private
                    </span>
                    <Button
                      onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                      variant="ghost"
                      size="icon"
                    >
                      {showSeedPhrase ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {showSeedPhrase ? (
                    <div className="space-y-3">
                      <p className="font-mono leading-relaxed break-all">
                        {walletResult?.seedPhrase}
                      </p>
                      <Button
                        onClick={() =>
                          handleCopy(walletResult?.seedPhrase || "", "seed")
                        }
                        variant="outline"
                        size="sm"
                      >
                        {seedPhraseCopied ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Seed Phrase
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Click the eye icon to reveal your seed phrase.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={handleDownloadBackup}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Backup
                </Button>
                <Button onClick={handleConfirmBackup} className="flex-1">
                  I've Saved My Seed Phrase
                </Button>
              </div>

              <div className="bg-destructive/10 border-destructive/20 flex items-start space-x-3 rounded-lg border p-4">
                <AlertTriangle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <h4 className="text-destructive mb-1 font-medium">
                    Security Warning
                  </h4>
                  <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                    <li>Never share your seed phrase with anyone.</li>
                    <li>Store it in a secure location offline.</li>
                    <li>Coinbase cannot recover lost seed phrases.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "complete":
        return (
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <div className="bg-success/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <CheckCircle className="text-success h-8 w-8" />
              </div>
              <CardTitle>Setup Complete!</CardTitle>
              <CardDescription>
                Your CDP wallet is now ready to use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="bg-secondary">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Your Wallet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-mono">
                      {formatAddress(walletResult?.wallet.address || "")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network</span>
                    <span>{walletResult?.networkInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-success font-medium">Active</span>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h4 className="mb-3 font-medium">Next Steps</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                    Fund your wallet with testnet tokens.
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                    Link your data sources on the dashboard.
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                    Start earning and withdraw funds.
                  </li>
                </ul>
              </div>

              <Card className="bg-secondary">
                <CardContent className="pt-6">
                  <h4 className="mb-2 font-medium">Get Testnet Tokens</h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Fund your wallet with Base Sepolia testnet tokens to start
                    testing transactions. This is a free faucet.
                  </p>
                  <Button
                    onClick={handleFundWallet}
                    disabled={isFunding}
                    className="w-full"
                    variant="success"
                  >
                    {isFunding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Funding...
                      </>
                    ) : (
                      "Fund with Testnet Tokens"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild variant="outline" className="flex-1">
                  <Link
                    href={`${walletResult?.networkInfo.blockExplorer}/address/${walletResult?.wallet.address}`}
                    target="_blank"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Explorer
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/consumer/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

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
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h1 className="text-foreground mb-2 text-4xl font-bold">
              Create New Wallet
            </h1>
            <p className="text-muted-foreground text-lg">
              Follow the steps to create, back up, and fund your new secure
              wallet.
            </p>
          </div>
          {renderStepContent()}
        </div>
      </main>
    </div>
  );
}

export default function CreateWalletPage() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <PageContent />;
}
