"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { 
  User, 
  CreditCard, 
  Search, 
  Settings,
  TrendingUp,
  Database,
  Key,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Phone,
  Star,
  ShoppingCart,
  History,
  Wallet,
  ExternalLink,
  Users,
  Mail,
  Calendar,
  Download,
  FileText
} from "lucide-react";
import { formatCurrency, formatDate, calculateDataPrice, calculateBulkDiscount } from "~/lib/utils";
import type { DataBroker, Transaction, DataSource } from "~/types";
import { toast } from "~/components/ui/use-toast";
import { Web3Provider } from "~/components/providers/web3-provider";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { X402_PAYMENT_ADDRESS } from '~/lib/web3-config';
import { mockUserProfiles, calculateDataValue, type MockUserProfile } from '~/lib/mock-user-data';
import { parseEther } from 'viem';

interface BulkDataRequest {
  dataSources: string[];
  quantity: number;
}

interface PurchaseResult {
  transactionHash: string;
  dataPoints: MockUserProfile[];
  totalCost: number;
  purchaseId: string;
}

const mockBroker: DataBroker = {
  id: "broker-001",
  name: "DataCorp Analytics",
  apiKey: "dc_api_key_123456789",
  walletAddress: "0xBrokerWallet123",
  isActive: true,
  rateLimit: {
    requestsPerHour: 100,
    currentUsage: 23,
    resetTime: "2024-01-21T15:00:00Z"
  },
  createdAt: "2024-01-10T12:00:00Z"
};

const availableDataSources: DataSource[] = [
  { platform: "netflix", price: 1.25 },
  { platform: "spotify", price: 1.00 },
  { platform: "instagram", price: 1.75 },
  { platform: "apple-music", price: 0.75 },
  { platform: "facebook", price: 2.00 }
];

function BrokerDashboardContent() {
  const { address, isConnected } = useAccount();
  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<PurchaseResult[]>([]);

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && txHash) {
      handleSuccessfulPurchase(txHash);
    }
  }, [isConfirmed, txHash]);

  const calculateTotalCost = () => {
    const baseCost = selectedSources.reduce((sum, source) => {
      const sourceData = availableDataSources.find(s => s.platform === source);
      return sum + (sourceData?.price || 0);
    }, 0);
    
    const totalCost = baseCost * quantity;
    
    // Apply bulk discount for orders > 10
    if (quantity > 10) {
      return totalCost * 0.9; // 10% discount
    }
    
    return totalCost;
  };

  const generateDataPoints = (sources: string[], count: number): MockUserProfile[] => {
    // Filter profiles that have the requested data
    const availableProfiles = mockUserProfiles.filter(profile => 
      sources.some(source => {
        const sourceKey = source.replace('-', '').toLowerCase() as keyof typeof profile.dataAvailable;
        return profile.dataAvailable[sourceKey];
      })
    );

    // Randomly select and duplicate profiles to reach requested quantity
    const selectedProfiles: MockUserProfile[] = [];
    for (let i = 0; i < count; i++) {
      const randomProfile = availableProfiles[Math.floor(Math.random() * availableProfiles.length)];
      if (randomProfile) {
        // Create a copy with modified ID to simulate different data points
        selectedProfiles.push({
          ...randomProfile,
          id: `${randomProfile.id}-${i}`,
          email: `${randomProfile.email.split('@')[0]}+${i}@${randomProfile.email.split('@')[1]}`
        });
      }
    }

    return selectedProfiles;
  };

  const handleSuccessfulPurchase = (transactionHash: `0x${string}`) => {
    const dataPoints = generateDataPoints(selectedSources, quantity);
    const totalCost = calculateTotalCost();
    
    const result: PurchaseResult = {
      transactionHash,
      dataPoints,
      totalCost,
      purchaseId: `purchase-${Date.now()}`
    };

    setPurchaseResult(result);
    setRecentPurchases(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 purchases

    toast({
      title: "Purchase Successful!",
      description: `Received ${dataPoints.length} data points. Transaction: ${transactionHash.slice(0, 10)}...`,
    });

    // Reset form
    setSelectedSources([]);
    setQuantity(1);
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make payments.",
        variant: "destructive"
      });
      return;
    }

    if (selectedSources.length === 0) {
      toast({
        title: "No Data Sources Selected",
        description: "Please select at least one data source to purchase.",
        variant: "destructive"
      });
      return;
    }

    if (quantity < 1 || quantity > 1000) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a quantity between 1 and 1000.",
        variant: "destructive"
      });
      return;
    }

    try {
      const totalAmount = calculateTotalCost();
      const amountInWei = parseEther((totalAmount * 0.001).toString());

      // Send simple ETH transfer (no data since X402_PAYMENT_ADDRESS is an EOA)
      await sendTransaction({
        to: X402_PAYMENT_ADDRESS as `0x${string}`,
        value: amountInWei,
        // Note: Removed data field since we're sending to an EOA
        // In production, this would be sent to a contract that can handle the metadata
      });

      toast({
        title: "Transaction Sent",
        description: "Processing payment... Please wait for confirmation.",
      });

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Transaction failed",
        variant: "destructive"
      });
    }
  };

  const downloadDataAsJSON = (result: PurchaseResult) => {
    const dataBlob = new Blob([JSON.stringify(result.dataPoints, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-purchase-${result.purchaseId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalCost = calculateTotalCost();
  const resetTime = new Date(mockBroker.rateLimit.resetTime);
  const timeUntilReset = Math.max(0, resetTime.getTime() - Date.now());
  const hoursUntilReset = Math.ceil(timeUntilReset / (1000 * 60 * 60));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Data Broker Portal</h1>
            <p className="text-gray-300">Purchase bulk consumer data with x402 payments on Base Sepolia</p>
          </div>
          
          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Wallet Status</p>
                  <div className="flex items-center mt-1">
                    {isConnected ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-white font-semibold">Connected</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />
                        <span className="text-white font-semibold">Not Connected</span>
                      </>
                    )}
                  </div>
                </div>
                <Wallet className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Transaction Status</p>
                  <div className="flex items-center mt-1">
                    {isSending || isConfirming ? (
                      <>
                        <Clock className="w-4 h-4 text-yellow-400 mr-2 animate-spin" />
                        <span className="text-white font-semibold">
                          {isSending ? "Sending..." : "Confirming..."}
                        </span>
                      </>
                    ) : isConfirmed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-white font-semibold">Confirmed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-white font-semibold">Ready</span>
                      </>
                    )}
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Current Order</p>
                  <p className="text-white font-semibold">{quantity} Data Points</p>
                  <p className="text-gray-400 text-xs">{formatCurrency(totalCost)} total</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Recent Purchases</p>
                  <p className="text-white font-semibold">{recentPurchases.length} Orders</p>
                  <p className="text-gray-400 text-xs">This session</p>
                </div>
                <History className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bulk Data Purchase */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Bulk Data Purchase
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Select data types and quantity to purchase consumer data in bulk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Source Selection */}
                <div>
                  <label className="text-white text-sm font-medium mb-3 block">
                    Data Sources to Purchase
                    {selectedSources.length === 0 && (
                      <span className="text-yellow-400 ml-2 font-normal">← Select data sources!</span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableDataSources.map((source) => (
                      <div
                        key={source.platform}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedSources.includes(source.platform)
                            ? 'bg-blue-500/20 border-blue-400'
                            : 'bg-white/5 border-white/20 hover:border-white/40'
                        }`}
                        onClick={() => {
                          setSelectedSources(prev =>
                            prev.includes(source.platform)
                              ? prev.filter(s => s !== source.platform)
                              : [...prev, source.platform]
                          );
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white capitalize font-medium">
                            {source.platform.replace('-', ' ')}
                          </span>
                          <span className="text-gray-300 text-sm">
                            {formatCurrency(source.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedSources.length > 0 && (
                    <p className="text-green-400 text-sm mt-2">
                      ✓ {selectedSources.length} data source{selectedSources.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                {/* Quantity Selection */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    Number of Data Points
                    {quantity > 10 && (
                      <span className="text-green-400 ml-2 font-normal">10% bulk discount applied!</span>
                    )}
                  </label>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 w-32"
                    />
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(10)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        10
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(50)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        50
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(100)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        100
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                {selectedSources.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Cost Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      {selectedSources.map(source => {
                        const sourceData = availableDataSources.find(s => s.platform === source);
                        return (
                          <div key={source} className="flex justify-between text-gray-300">
                            <span>{source.replace('-', ' ')} × {quantity}</span>
                            <span>{formatCurrency((sourceData?.price || 0) * quantity)}</span>
                          </div>
                        );
                      })}
                      {quantity > 10 && (
                        <div className="flex justify-between text-green-400">
                          <span>Bulk Discount (10%)</span>
                          <span>-{formatCurrency(calculateTotalCost() * 0.1)}</span>
                        </div>
                      )}
                      <div className="border-t border-white/20 pt-2 flex justify-between text-white font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(totalCost)} (≈ {(totalCost * 0.001).toFixed(6)} ETH)</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePurchase}
                  disabled={isSending || isConfirming || !isConnected || selectedSources.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:opacity-50"
                >
                  {isSending ? "Sending Transaction..." : 
                   isConfirming ? "Confirming Payment..." : 
                   `Purchase ${quantity} Data Points for ${formatCurrency(totalCost)}`}
                </Button>
                
                {!isConnected && (
                  <p className="text-yellow-400 text-sm text-center">
                    Connect your wallet to make purchases
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Purchase Results */}
            {purchaseResult && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                    Purchase Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-300">Transaction Hash</label>
                      <p className="text-white font-mono text-xs">{purchaseResult.transactionHash}</p>
                    </div>
                    <div>
                      <label className="text-gray-300">Data Points Received</label>
                      <p className="text-white font-semibold">{purchaseResult.dataPoints.length}</p>
                    </div>
                    <div>
                      <label className="text-gray-300">Total Cost</label>
                      <p className="text-white font-semibold">{formatCurrency(purchaseResult.totalCost)}</p>
                    </div>
                    <div>
                      <label className="text-gray-300">Purchase ID</label>
                      <p className="text-white font-mono text-xs">{purchaseResult.purchaseId}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => downloadDataAsJSON(purchaseResult)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Data as JSON
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How to Buy Instructions */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  How to Buy Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">1</span>
                    <span>Select data sources you want</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">2</span>
                    <span>Choose quantity (10+ gets discount)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</span>
                    <span>Click purchase and confirm in wallet</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">4</span>
                    <span>Download JSON data after confirmation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Purchases */}
            {recentPurchases.length > 0 && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    Recent Purchases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentPurchases.slice(0, 3).map((purchase) => (
                    <div key={purchase.purchaseId} className="bg-white/5 rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white text-sm font-medium">
                          {purchase.dataPoints.length} points
                        </span>
                        <span className="text-gray-300 text-xs">
                          {formatCurrency(purchase.totalCost)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDataAsJSON(purchase)}
                        className="w-full text-xs border-white/20 text-white hover:bg-white/10"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download JSON
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* x402 Information */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  x402 Payment Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm">Payment Address</label>
                  <div className="bg-white/5 rounded p-2 mt-1">
                    <code className="text-gray-300 text-xs font-mono break-all">
                      {X402_PAYMENT_ADDRESS}
                    </code>
                  </div>
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Network</label>
                  <div className="bg-white/5 rounded p-2 mt-1">
                    <span className="text-gray-300 text-sm">Base Sepolia Testnet</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Payments processed via x402 protocol</p>
                  <p>• Automatic fund distribution to consumers</p>
                  <p>• Instant data access upon confirmation</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BrokerDashboard() {
  return (
    <Web3Provider>
      <BrokerDashboardContent />
    </Web3Provider>
  );
} 