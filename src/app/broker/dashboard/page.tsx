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
  History
} from "lucide-react";
import { formatCurrency, formatDate, calculateDataPrice, calculateBulkDiscount } from "~/lib/utils";
import type { DataBroker, Transaction, DataSource } from "~/types";
import { toast } from "~/components/ui/use-toast";

interface SearchParams {
  fullName: string;
  state: string;
  phoneNumber: string;
}

interface SearchResults {
  profilesFound: number;
  estimatedCost: number;
  availableSources: DataSource[];
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

const recentTransactions: Transaction[] = [
  {
    id: "txn-001",
    type: "data_sale",
    fromWallet: "0xBrokerWallet123",
    toWallet: "0x1234567890123456789012345678901234567890",
    amount: "5.25",
    currency: "USDC",
    status: "completed",
    description: "Data purchase: Netflix + Spotify data",
    metadata: {
      dataBrokerId: "broker-001",
      dataSourcesRequested: ["netflix", "spotify"]
    },
    createdAt: "2024-01-20T14:00:00Z",
    completedAt: "2024-01-20T14:02:00Z"
  },
  {
    id: "txn-002",
    type: "data_sale",
    fromWallet: "0xBrokerWallet123",
    toWallet: "0x2345678901234567890123456789012345678901",
    amount: "3.25",
    currency: "USDC",
    status: "completed",
    description: "Data purchase: Instagram data",
    metadata: {
      dataBrokerId: "broker-001",
      dataSourcesRequested: ["instagram"]
    },
    createdAt: "2024-01-19T10:45:00Z",
    completedAt: "2024-01-19T10:47:00Z"
  }
];

export default function BrokerDashboard() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    fullName: "",
    state: "",
    phoneNumber: ""
  });
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleSearch = async () => {
    if (!searchParams.fullName || !searchParams.state) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a full name and state.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate API search
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockResults: SearchResults = {
      profilesFound: Math.floor(Math.random() * 10) + 1,
      estimatedCost: 0,
      availableSources: availableDataSources
    };

    setSearchResults(mockResults);
    setIsSearching(false);
    
    toast({
      title: "Search Complete",
      description: `Found ${mockResults.profilesFound} matching profiles.`
    });
  };

  const handlePurchase = async () => {
    if (selectedSources.length === 0) {
      toast({
        title: "No Data Sources Selected",
        description: "Please select at least one data source to purchase.",
        variant: "destructive"
      });
      return;
    }

    setIsPurchasing(true);
    
    // Simulate x402 payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsPurchasing(false);
    
    toast({
      title: "Purchase Successful",
      description: "Data has been purchased and added to your account. Consumer wallets have been credited."
    });

    // Reset form
    setSearchParams({ fullName: "", state: "", phoneNumber: "" });
    setSelectedSources([]);
    setSearchResults(null);
  };

  const sourcePrices = availableDataSources.reduce((acc, source) => {
    acc[source.platform] = source.price;
    return acc;
  }, {} as Record<string, number>);

  const pricing = selectedSources.length > 0 
    ? calculateDataPrice(sourcePrices, selectedSources, quantity)
    : { totalPrice: 0, breakdown: {}, discount: 0 };

  const resetTime = new Date(mockBroker.rateLimit.resetTime);
  const timeUntilReset = Math.max(0, resetTime.getTime() - Date.now());
  const hoursUntilReset = Math.ceil(timeUntilReset / (1000 * 60 * 60));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Data Broker Portal</h1>
          <p className="text-gray-300">Purchase consumer data with x402 payments and automated distribution</p>
        </div>

        {/* Broker Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">API Status</p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-white font-semibold">Active</span>
                  </div>
                </div>
                <Settings className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Rate Limit</p>
                  <p className="text-white font-semibold">{mockBroker.rateLimit.currentUsage}/{mockBroker.rateLimit.requestsPerHour}</p>
                  <p className="text-gray-400 text-xs">Resets in {hoursUntilReset}h</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">This Month</p>
                  <p className="text-white font-semibold">47 Requests</p>
                  <p className="text-gray-400 text-xs">$127.50 spent</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Wallet Balance</p>
                  <p className="text-white font-semibold">2,450 USDC</p>
                  <p className="text-gray-400 text-xs">≈ $2,450.00</p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Data Search & Purchase */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Data Search & Purchase
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Search for consumer profiles and purchase their data using x402 payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Full Name *</label>
                    <Input
                      placeholder="e.g., John Smith"
                      value={searchParams.fullName}
                      onChange={(e) => setSearchParams({ ...searchParams, fullName: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">State *</label>
                    <Input
                      placeholder="e.g., CA"
                      value={searchParams.state}
                      onChange={(e) => setSearchParams({ ...searchParams, state: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Phone Number</label>
                    <Input
                      placeholder="(555) 123-4567"
                      value={searchParams.phoneNumber}
                      onChange={(e) => setSearchParams({ ...searchParams, phoneNumber: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchParams.fullName || !searchParams.state}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isSearching ? "Searching..." : "Search Profiles"}
                </Button>

                {/* Search Results */}
                {searchResults && (
                  <div className="border-t border-white/20 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">Search Results</h3>
                      <span className="text-green-400 text-sm">
                        {searchResults.profilesFound} profiles found
                      </span>
                    </div>

                    {/* Data Source Selection */}
                    <div className="mb-6">
                      <label className="text-white text-sm font-medium mb-3 block">Available Data Sources</label>
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
                                +{formatCurrency(source.price)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quantity and Pricing */}
                    {selectedSources.length > 0 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Quantity</label>
                          <Input
                            type="number"
                            min="1"
                            max={searchResults.profilesFound}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-white/10 border-white/20 text-white w-32"
                          />
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="bg-white/5 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-3">Pricing Breakdown</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-300">
                              <span>Base Price (${1.50} × {quantity})</span>
                              <span>{formatCurrency(1.50 * quantity)}</span>
                            </div>
                            {selectedSources.map(source => {
                              const sourcePrice = sourcePrices[source] || 0;
                              return (
                                <div key={source} className="flex justify-between text-gray-300">
                                  <span className="capitalize">{source.replace('-', ' ')} (${sourcePrice} × {quantity})</span>
                                  <span>{formatCurrency(sourcePrice * quantity)}</span>
                                </div>
                              );
                            })}
                            {pricing.discount > 0 && (
                              <div className="flex justify-between text-green-400">
                                <span>Bulk Discount ({(pricing.discount * 100).toFixed(0)}%)</span>
                                <span>-{formatCurrency((1 - (1 - pricing.discount)) * (pricing.totalPrice / (1 - pricing.discount)))}</span>
                              </div>
                            )}
                            <div className="border-t border-white/20 pt-2 flex justify-between text-white font-semibold">
                              <span>Total</span>
                              <span>{formatCurrency(pricing.totalPrice)}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handlePurchase}
                          disabled={isPurchasing}
                          className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                        >
                          {isPurchasing ? "Processing Payment..." : `Purchase Data for ${formatCurrency(pricing.totalPrice)}`}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* API Information */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  API Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm">API Key</label>
                  <div className="bg-white/5 rounded p-2 mt-1">
                    <code className="text-gray-300 text-xs font-mono">
                      {mockBroker.apiKey.substring(0, 20)}...
                    </code>
                  </div>
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Wallet Address</label>
                  <div className="bg-white/5 rounded p-2 mt-1">
                    <code className="text-gray-300 text-xs font-mono">
                      {mockBroker.walletAddress.substring(0, 20)}...
                    </code>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
                  View Documentation
                </Button>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="border-b border-white/10 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-sm font-medium">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {transaction.metadata?.dataSourcesRequested?.join(' + ') || 'N/A'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
                  View All Transactions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 