"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
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
  Plus,
  LogOut,
  User
} from "lucide-react";
import { formatCurrency, formatDate, getPlatformIcon } from "~/lib/utils";
import type { Consumer, CustodialWallet, LinkedAccount } from "~/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

const platforms = [
  { id: 'netflix', name: 'Netflix', icon: '🎬', connected: false },
  { id: 'spotify', name: 'Spotify', icon: '🎵', connected: false },
  { id: 'instagram', name: 'Instagram', icon: '📸', connected: false },
  { id: 'apple-music', name: 'Apple Music', icon: '🍎', connected: false },
  { id: 'facebook', name: 'Facebook', icon: '👥', connected: false },
  { id: 'google', name: 'Google', icon: '🔍', connected: false },
];

export default function ConsumerDashboard() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [wallet, setWallet] = useState<CustodialWallet | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session) {
      loadUserData();
    }
  }, [session, status, router]);

  const loadUserData = async () => {
    setIsLoading(true);
    
    try {
      // Check if user has a wallet using the correct endpoint
      const walletResponse = await fetch('/api/wallet');
      const walletData = await walletResponse.json();
      
      if (walletResponse.ok && walletData.hasWallet && walletData.wallet) {
        setWallet(walletData.wallet);
        setHasWallet(true);
      } else {
        setHasWallet(false);
        setWallet(null);
      }

      // Mock linked accounts for now
      const mockLinkedAccounts: LinkedAccount[] = [
        {
          id: 'netflix-user',
          platform: 'netflix',
          accountId: 'user.netflix.001',
          linkedAt: '2024-01-15T10:30:00Z',
          dataAvailable: true,
          lastSync: '2024-01-20T15:00:00Z'
        },
        {
          id: 'spotify-user',
          platform: 'spotify',
          accountId: 'user.spotify.001',
          linkedAt: '2024-01-16T14:00:00Z',
          dataAvailable: true,
          lastSync: '2024-01-20T14:30:00Z'
        }
      ];

      setLinkedAccounts(mockLinkedAccounts);
      setTotalEarnings(25.75);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountLink = (platformId: string) => {
    toast({
      title: "Account Connected!",
      description: `Successfully connected your ${platforms.find(p => p.id === platformId)?.name} account.`,
    });

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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to sign in
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
              Welcome back, {session.user?.name}
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
            <Button onClick={handleSignOut} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
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
                {wallet ? formatCurrency(wallet.balance.usdc || '0', 'USDC') : 'No Wallet'}
              </div>
              <p className="text-xs text-gray-400">
                {wallet ? formatCurrency(wallet.balance.eth || '0', 'ETH') : 'Create wallet to start earning'}
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
              <CardTitle className="text-sm font-medium text-gray-300">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                ✓
              </div>
              <p className="text-xs text-gray-400">
                Verified ({session.user?.email})
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
                {hasWallet ? 'Secure wallet managed by the platform' : 'Create your secure wallet to start earning'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hasWallet && wallet ? (
                  <>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Wallet Address</div>
                      <div className="text-white font-mono text-sm break-all">
                        {wallet.address}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">USDC Balance</div>
                        <div className="text-white font-bold">
                          {formatCurrency(wallet.balance.usdc || '0', 'USDC')}
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 mb-1">ETH Balance</div>
                        <div className="text-white font-bold">
                          {formatCurrency(wallet.balance.eth || '0', 'ETH')}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild className="bg-gradient-to-r from-green-500 to-teal-600">
                        <Link href="/consumer/withdraw">
                          <ArrowUpRight className="w-4 h-4 mr-2" />
                          Withdraw
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Link href="/consumer/transactions">
                          <Eye className="w-4 h-4 mr-2" />
                          Transactions
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                      <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-white font-semibold mb-2">No Wallet Found</h3>
                      <p className="text-gray-300 text-sm mb-4">
                        Create your secure custodial wallet to start earning from your data.
                      </p>
                      <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                        <Link href="/consumer/wallet/create">
                          <Plus className="w-4 h-4 mr-2" />
                          Create CDP Wallet
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
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
              {hasWallet ? [
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
              )) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">No activity yet</div>
                  <p className="text-gray-500 text-sm">Create a wallet and link your accounts to start earning!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 