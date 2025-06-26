"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { 
  Wallet, 
  Link as LinkIcon, 
  TrendingUp, 
  Eye, 
  Download,
  Settings,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { formatCurrency, formatDate, getPlatformIcon } from "~/lib/utils";
import type { Consumer, CustodialWallet, LinkedAccount } from "~/types";
import Link from "next/link";

const platforms = [
  { id: 'netflix', name: 'Netflix', icon: '🎬', connected: false },
  { id: 'spotify', name: 'Spotify', icon: '🎵', connected: false },
  { id: 'instagram', name: 'Instagram', icon: '📸', connected: false },
  { id: 'apple-music', name: 'Apple Music', icon: '🍎', connected: false },
  { id: 'facebook', name: 'Facebook', icon: '👥', connected: false },
  { id: 'google', name: 'Google', icon: '🔍', connected: false },
];

export default function ConsumerDashboard() {
  const { toast } = useToast();
  const [consumer, setConsumer] = useState<Consumer | null>(null);
  const [wallet, setWallet] = useState<CustodialWallet | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading - in production, this would fetch from API
    const loadConsumerData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock consumer data
      const mockConsumer: Consumer = {
        id: 'consumer-1',
        email: 'alice@example.com',
        name: 'Alice Johnson',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z',
        custodialWalletId: 'wallet-consumer-1',
        linkedAccounts: [
          {
            id: 'netflix-alice',
            platform: 'netflix',
            accountId: 'alice.netflix.001',
            linkedAt: '2024-01-15T10:30:00Z',
            dataAvailable: true,
            lastSync: '2024-01-20T15:00:00Z'
          },
          {
            id: 'spotify-alice',
            platform: 'spotify',
            accountId: 'alice.spotify.001',
            linkedAt: '2024-01-16T14:00:00Z',
            dataAvailable: true,
            lastSync: '2024-01-20T14:30:00Z'
          }
        ],
        kycStatus: 'verified'
      };

      const mockWallet: CustodialWallet = {
        id: 'wallet-consumer-1',
        consumerId: 'consumer-1',
        address: '0x1234567890123456789012345678901234567890',
        privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        balance: {
          eth: '0.0045',
          usdc: '12.50'
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z'
      };

      setConsumer(mockConsumer);
      setWallet(mockWallet);
      setLinkedAccounts(mockConsumer.linkedAccounts);
      setTotalEarnings(25.75); // Mock total earnings
      setIsLoading(false);
    };

    loadConsumerData();
  }, []);

  const handleAccountLink = (platformId: string) => {
    toast({
      title: "Account Connected!",
      description: `Successfully connected your ${platforms.find(p => p.id === platformId)?.name} account.`,
    });

    // Update linked accounts state
    const newAccount: LinkedAccount = {
      id: `${platformId}-${Date.now()}`,
      platform: platformId as any,
      accountId: `user.${platformId}.${Date.now()}`,
      linkedAt: new Date().toISOString(),
      dataAvailable: true,
    };

    setLinkedAccounts(prev => [...prev, newAccount]);
  };

  const handleDataSync = (accountId: string) => {
    toast({
      title: "Data Synced",
      description: "Your data has been successfully synchronized.",
    });

    setLinkedAccounts(prev => 
      prev.map(acc => 
        acc.id === accountId 
          ? { ...acc, lastSync: new Date().toISOString() }
          : acc
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  const connectedPlatforms = platforms.map(platform => ({
    ...platform,
    connected: linkedAccounts.some(acc => acc.platform === platform.id)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {consumer?.name}
            </h1>
            <p className="text-gray-300">Manage your data and earnings</p>
          </div>
          <div className="flex space-x-4">
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link href="/consumer/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Link href="/">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(wallet?.balance.usdc || '0', 'USDC')}
              </div>
              <p className="text-xs text-gray-400">
                {formatCurrency(wallet?.balance.eth || '0', 'ETH')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(totalEarnings)}
              </div>
              <p className="text-xs text-gray-400">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {linkedAccounts.length}
              </div>
              <p className="text-xs text-gray-400">of {platforms.length} platforms</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">KYC Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {consumer?.kycStatus === 'verified' ? '✓' : '⏳'}
              </div>
              <p className="text-xs text-gray-400">
                {consumer?.kycStatus === 'verified' ? 'Verified' : 'Pending'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Linking */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <LinkIcon className="w-5 h-5 mr-2" />
                Connect Your Accounts
              </CardTitle>
              <CardDescription className="text-gray-300">
                Link your accounts to start earning from your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {connectedPlatforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div>
                        <div className="text-white font-medium">{platform.name}</div>
                        {platform.connected && (
                          <div className="text-xs text-green-400">Connected</div>
                        )}
                      </div>
                    </div>
                    {platform.connected ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => {
                          const account = linkedAccounts.find(acc => acc.platform === platform.id);
                          if (account) handleDataSync(account.id);
                        }}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Sync
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-600"
                        onClick={() => handleAccountLink(platform.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custodial Wallet */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Your Custodial Wallet
              </CardTitle>
              <CardDescription className="text-gray-300">
                Secure wallet managed by the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Wallet Address</div>
                  <div className="text-white font-mono text-sm break-all">
                    {wallet?.address}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">USDC Balance</div>
                    <div className="text-white font-bold">
                      {formatCurrency(wallet?.balance.usdc || '0', 'USDC')}
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">ETH Balance</div>
                    <div className="text-white font-bold">
                      {formatCurrency(wallet?.balance.eth || '0', 'ETH')}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button asChild className="w-full bg-gradient-to-r from-green-500 to-teal-600">
                    <Link href="/consumer/withdraw">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Withdraw Funds
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    <Link href="/consumer/transactions">
                      <Eye className="w-4 h-4 mr-2" />
                      View Transactions
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-300">
              Your latest data sales and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  date: '2024-01-20T14:00:00Z',
                  description: 'Data sale: Netflix + Spotify data',
                  amount: '+$5.25',
                  status: 'completed'
                },
                {
                  date: '2024-01-19T16:30:00Z',
                  description: 'Withdrawal to external wallet',
                  amount: '-$3.00',
                  status: 'completed'
                },
                {
                  date: '2024-01-19T10:45:00Z',
                  description: 'Data sale: Instagram data',
                  amount: '+$3.25',
                  status: 'completed'
                }
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div>
                    <div className="text-white font-medium">{activity.description}</div>
                    <div className="text-xs text-gray-400">{formatDate(activity.date)}</div>
                  </div>
                  <div className={`font-bold ${
                    activity.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {activity.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 