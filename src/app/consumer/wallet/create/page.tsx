"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
  ExternalLink
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

export default function CreateWallet() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [walletResult, setWalletResult] = useState<WalletCreationResult | null>(null);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhraseCopied, setSeedPhraseCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [currentStep, setCurrentStep] = useState<'create' | 'backup' | 'complete'>('create');
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
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          networkId: 'base-sepolia'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create wallet');
      }

      setWalletResult(data);
      setCurrentStep('backup');
      
      toast({
        title: "Wallet Created Successfully!",
        description: "Your CDP wallet has been created on Base Sepolia testnet."
      });

    } catch (error) {
      console.error('Error creating wallet:', error);
      toast({
        title: "Failed to Create Wallet",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopySeedPhrase = async () => {
    if (walletResult?.seedPhrase) {
      await navigator.clipboard.writeText(walletResult.seedPhrase);
      setSeedPhraseCopied(true);
      toast({
        title: "Seed Phrase Copied",
        description: "Your seed phrase has been copied to the clipboard."
      });
      setTimeout(() => setSeedPhraseCopied(false), 3000);
    }
  };

  const handleCopyAddress = async () => {
    if (walletResult?.wallet.address) {
      await navigator.clipboard.writeText(walletResult.wallet.address);
      setAddressCopied(true);
      toast({
        title: "Address Copied",
        description: "Your wallet address has been copied to the clipboard."
      });
      setTimeout(() => setAddressCopied(false), 3000);
    }
  };

  const handleDownloadBackup = () => {
    if (walletResult) {
      const backupData = {
        seedPhrase: walletResult.seedPhrase,
        address: walletResult.wallet.address,
        cdpWalletId: walletResult.cdpWalletId,
        networkInfo: walletResult.networkInfo,
        createdAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallet-backup-${walletResult.wallet.address.slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup Downloaded",
        description: "Your wallet backup file has been downloaded."
      });
    }
  };

  const handleConfirmBackup = () => {
    setCurrentStep('complete');
    toast({
      title: "Wallet Setup Complete!",
      description: "Your CDP wallet is ready to use."
    });
  };

  const handleFundWallet = async () => {
    if (!walletResult?.cdpWalletId) return;

    setIsFunding(true);
    
    try {
      const response = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cdpWalletId: walletResult.cdpWalletId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fund wallet');
      }

      toast({
        title: "Wallet Funded!",
        description: `Successfully funded with ${data.faucetAmount} ETH. ${data.note || ''}`
      });

    } catch (error) {
      console.error('Error funding wallet:', error);
      toast({
        title: "Funding Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsFunding(false);
    }
  };

  if (currentStep === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/consumer/dashboard" className="inline-flex items-center text-gray-300 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Create CDP Wallet</h1>
            <p className="text-gray-300">Create a new Coinbase Developer Platform wallet on Base Sepolia testnet</p>
          </div>

          {/* Create Wallet Card */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wallet className="w-6 h-6 mr-3" />
                Create Your Wallet
              </CardTitle>
              <CardDescription className="text-gray-300">
                Generate a new custodial wallet using Coinbase's CDP infrastructure. Your wallet will be created on Base Sepolia testnet for safe testing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-white font-medium">Secure Infrastructure</h3>
                    <p className="text-gray-300 text-sm">Built on Coinbase's enterprise-grade security</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Key className="w-5 h-5 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-white font-medium">Full Control</h3>
                    <p className="text-gray-300 text-sm">You own your private keys and seed phrase</p>
                  </div>
                </div>
              </div>

              {/* Network Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Network Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Network</span>
                    <span className="text-white">Base Sepolia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Chain ID</span>
                    <span className="text-white">84532</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Type</span>
                    <span className="text-white">Testnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Block Explorer</span>
                    <a href="https://sepolia.basescan.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center">
                      BaseScan <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateWallet}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3"
              >
                {isCreating ? "Creating Wallet..." : "Create CDP Wallet"}
              </Button>

              {/* Disclaimer */}
              <div className="flex items-start space-x-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-200 text-sm">
                    <strong>Important:</strong> This wallet will be created on Base Sepolia testnet. 
                    You'll receive a seed phrase that you must securely store - it's the only way to recover your wallet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentStep === 'backup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Secure Your Wallet</h1>
            <p className="text-gray-300">Save your seed phrase and wallet information safely</p>
          </div>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-6 h-6 mr-3" />
                Wallet Created Successfully
              </CardTitle>
              <CardDescription className="text-gray-300">
                Your CDP wallet has been created. Please securely store your seed phrase - it's the only way to recover your wallet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Address */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Wallet Address</label>
                <div className="flex items-center space-x-2">
                  <div className="bg-white/5 rounded p-3 flex-1">
                    <code className="text-gray-300 text-sm font-mono break-all">
                      {walletResult?.wallet.address}
                    </code>
                  </div>
                  <Button
                    onClick={handleCopyAddress}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {addressCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Seed Phrase */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Seed Phrase (Recovery Phrase)</label>
                <div className="bg-white/5 rounded p-4 border border-red-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-red-400 text-sm font-medium">⚠️ Keep this safe and private</span>
                    <Button
                      onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white"
                    >
                      {showSeedPhrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {showSeedPhrase ? (
                    <div className="space-y-3">
                      <p className="text-gray-300 text-sm font-mono break-all leading-relaxed">
                        {walletResult?.seedPhrase}
                      </p>
                      <Button
                        onClick={handleCopySeedPhrase}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        {seedPhraseCopied ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Seed Phrase
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Click the eye icon to reveal your seed phrase</p>
                  )}
                </div>
              </div>

              {/* Network Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Network Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Network</span>
                    <span className="text-white">{walletResult?.networkInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">CDP Wallet ID</span>
                    <span className="text-white font-mono text-xs">{formatAddress(walletResult?.cdpWalletId || '')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleDownloadBackup}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Backup
                </Button>
                <Button
                  onClick={handleConfirmBackup}
                  className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                >
                  I've Saved My Seed Phrase
                </Button>
              </div>

              {/* Security Warning */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-red-400 font-medium mb-1">Security Warning</h4>
                    <ul className="text-red-200 text-sm space-y-1">
                      <li>• Never share your seed phrase with anyone</li>
                      <li>• Store it in a secure location offline</li>
                      <li>• This is the only way to recover your wallet</li>
                      <li>• Coinbase cannot recover lost seed phrases</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Complete step
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Wallet Ready!</h1>
          <p className="text-gray-300">Your CDP wallet is now set up and ready to use</p>
        </div>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
              Setup Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wallet Summary */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Your Wallet</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Address</span>
                  <span className="text-white font-mono">{formatAddress(walletResult?.wallet.address || '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Network</span>
                  <span className="text-white">{walletResult?.networkInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div>
              <h4 className="text-white font-medium mb-3">Next Steps</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Fund your wallet with testnet tokens
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Start earning by linking your data sources
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Withdraw earnings to your bank account
                </li>
              </ul>
            </div>

            {/* Fund Wallet Button */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Get Testnet Tokens</h4>
              <p className="text-gray-300 text-sm mb-3">
                Fund your wallet with Base Sepolia testnet tokens to start testing transactions.
              </p>
              <Button
                onClick={handleFundWallet}
                disabled={isFunding}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
              >
                {isFunding ? "Funding Wallet..." : "Fund with Testnet Tokens"}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button 
                asChild 
                variant="outline" 
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                <Link href={`${walletResult?.networkInfo.blockExplorer}/address/${walletResult?.wallet.address}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Link>
              </Button>
              <Button 
                asChild 
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Link href="/consumer/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 