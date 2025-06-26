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
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { mockUserProfiles, calculateDataValue, type MockUserProfile } from '~/lib/mock-user-data';

interface BulkDataRequest {
  dataSources: string[];
  quantity: number;
}

interface PurchaseResult {
  transactionHash?: string;
  dataPoints: MockUserProfile[];
  totalCost: number;
  purchaseId: string;
  purchaseInfo?: any;
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
  const { address, isConnected, connector } = useAccount();
  
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<PurchaseResult[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);

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

  const handleSuccessfulPurchase = (dataPoints: MockUserProfile[], purchaseInfo: any) => {
    const totalCost = calculateTotalCost();
    
    const result: PurchaseResult = {
      dataPoints,
      totalCost,
      purchaseId: purchaseInfo.purchaseId || `purchase-${Date.now()}`,
      purchaseInfo
    };

    setPurchaseResult(result);
    setRecentPurchases(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 purchases

    toast({
      title: "Purchase Successful!",
      description: `Received ${dataPoints.length} data points via x402 payment.`,
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

    setIsPurchasing(true);

    try {
      toast({
        title: "Processing Payment",
        description: "Initiating x402 payment flow...",
      });

      // Make request to x402-protected endpoint
      // The x402 middleware will handle the 402 response and payment flow
      const response = await fetch('/api/data-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sources: selectedSources,
          quantity: quantity,
        }),
      });

      if (response.status === 402) {
        // This is the x402 payment required response
        const paymentInfo = await response.json();
        
        toast({
          title: "Payment Required",
          description: `x402 payment needed: ${paymentInfo.amount || '$' + totalCost.toFixed(2)} USDC`,
          variant: "destructive"
        });
        
        // In a full implementation, x402-fetch would automatically:
        // 1. Parse the payment requirements
        // 2. Create a payment signature with your wallet
        // 3. Retry the request with the payment header
        // 4. Return the actual data
        
        // For demo purposes, simulate successful payment after a delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast({
          title: "x402 Payment Completed",
          description: "Payment processed, fetching data...",
        });
        
        // Simulate the successful retry with payment
        const retryResponse = await fetch('/api/data-purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-PAYMENT': 'simulated-payment-header', // This would contain the actual payment proof
          },
          body: JSON.stringify({
            sources: selectedSources,
            quantity: quantity,
          }),
        });
        
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          if (data.success) {
            handleSuccessfulPurchase(data.dataPoints, data.purchaseInfo);
            return;
          }
        }
      } else if (response.ok) {
        // Payment not required or already processed
        const data = await response.json();
        if (data.success) {
          handleSuccessfulPurchase(data.dataPoints, data.purchaseInfo);
          return;
        }
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    } catch (error) {
      console.error('x402 Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "x402 payment failed",
        variant: "destructive"
      });
    } finally {
      setIsPurchasing(false);
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
            <h1 className="text-4xl font-bold text-white mb-2">x402 Data Broker Portal</h1>
            <p className="text-gray-300">Purchase bulk consumer data with automatic x402 payments on Base Sepolia</p>
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
                  <p className="text-gray-300 text-sm">x402 Status</p>
                  <div className="flex items-center mt-1">
                    {isPurchasing ? (
                      <>
                        <Clock className="w-4 h-4 text-yellow-400 mr-2 animate-spin" />
                        <span className="text-white font-semibold">Processing...</span>
                      </>
                    ) : purchaseResult ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-white font-semibold">Completed</span>
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
                  <p className="text-gray-400 text-xs">${totalCost.toFixed(2)} USDC</p>
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
                  x402 Bulk Data Purchase
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Select data types and quantity - payments handled automatically via x402
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
                            ${source.price.toFixed(2)}
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
                            <span>${((sourceData?.price || 0) * quantity).toFixed(2)}</span>
                          </div>
                        );
                      })}
                      {quantity > 10 && (
                        <div className="flex justify-between text-green-400">
                          <span>Bulk Discount (10%)</span>
                          <span>-${(calculateTotalCost() * 0.1).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-white/20 pt-2 flex justify-between text-white font-semibold">
                        <span>Total (USDC)</span>
                        <span>${totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing || !isConnected || selectedSources.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:opacity-50"
                >
                  {isPurchasing ? "Processing x402 Payment..." : 
                   `Purchase ${quantity} Data Points for $${totalCost.toFixed(2)} USDC`}
                </Button>
                
                {!isConnected && (
                  <p className="text-yellow-400 text-sm text-center">
                    Connect your wallet to make x402 payments
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
                    x402 Purchase Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-300">Payment Method</label>
                      <p className="text-white font-semibold">x402 Protocol</p>
                    </div>
                    <div>
                      <label className="text-gray-300">Data Points Received</label>
                      <p className="text-white font-semibold">{purchaseResult.dataPoints.length}</p>
                    </div>
                    <div>
                      <label className="text-gray-300">Total Cost</label>
                      <p className="text-white font-semibold">${purchaseResult.totalCost.toFixed(2)} USDC</p>
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
                  x402 Payment Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">1</span>
                    <span>Select data sources and quantity</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">2</span>
                    <span>Click purchase (x402 handles payment)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</span>
                    <span>Automatic USDC payment on Base Sepolia</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">4</span>
                    <span>Download JSON data instantly</span>
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
                    Recent x402 Purchases
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
                          ${purchase.totalCost.toFixed(2)} USDC
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
                  x402 Protocol Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm">Facilitator</label>
                  <div className="bg-white/5 rounded p-2 mt-1">
                    <span className="text-gray-300 text-sm">x402.org/facilitator</span>
                  </div>
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Network</label>
                  <div className="bg-white/5 rounded p-2 mt-1">
                    <span className="text-gray-300 text-sm">Base Sepolia Testnet</span>
                  </div>
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Payment Token</label>
                  <div className="bg-white/5 rounded p-2 mt-1">
                    <span className="text-gray-300 text-sm">USDC</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Automatic payment handling</p>
                  <p>• Fee-free USDC transactions</p>
                  <p>• Instant data access</p>
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