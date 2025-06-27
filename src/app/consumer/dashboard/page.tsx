"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
  User,
  Globe,
  Loader2,
} from "lucide-react";
import { formatCurrency, formatDate } from "~/lib/utils";
import type { CustodialWallet, LinkedAccount } from "~/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

const platforms = [
  { id: "netflix", name: "Netflix", icon: "🎬", connected: false },
  { id: "spotify", name: "Spotify", icon: "🎵", connected: false },
  { id: "instagram", name: "Instagram", icon: "📸", connected: false },
  { id: "apple-music", name: "Apple Music", icon: "🍎", connected: false },
  { id: "facebook", name: "Facebook", icon: "👥", connected: false },
  { id: "google", name: "Google", icon: "🔍", connected: false },
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
      const walletResponse = await fetch("/api/wallet");
      const walletData = await walletResponse.json();

      if (walletResponse.ok && walletData.hasWallet && walletData.wallet) {
        setWallet(walletData.wallet);
        setHasWallet(true);
      } else {
        setHasWallet(false);
        setWallet(null);
      }

      // Mock linked accounts for now
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const mockLinkedAccounts: LinkedAccount[] = [
        {
          id: "netflix-user",
          platform: "netflix",
          accountId: "user.netflix.001",
          linkedAt: "2024-01-15T10:30:00Z",
          dataAvailable: true,
          lastSync: twoMinutesAgo,
        },
        {
          id: "spotify-user",
          platform: "spotify",
          accountId: "user.spotify.001",
          linkedAt: "2024-01-16T14:00:00Z",
          dataAvailable: true,
          lastSync: twoMinutesAgo,
        },
      ];

      setLinkedAccounts(mockLinkedAccounts);
      // setTotalEarnings(25.75);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountLink = (platformId: string) => {
    toast({
      title: "Account Connected!",
      description: `Successfully connected your ${platforms.find((p) => p.id === platformId)?.name} account.`,
      variant: "default",
    });

    const newAccount: LinkedAccount = {
      id: `${platformId}-${Date.now()}`,
      platform: platformId as any,
      accountId: `user.${platformId}.${Date.now()}`,
      linkedAt: new Date().toISOString(),
      dataAvailable: true,
    };

    setLinkedAccounts((prev) => [...prev, newAccount]);
  };

  const handleDataSync = (accountId: string) => {
    toast({
      title: "Data Synced",
      description: "Your data has been successfully synchronized.",
      variant: "default",
    });

    setLinkedAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? { ...acc, lastSync: new Date().toISOString() }
          : acc,
      ),
    );
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-lg">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to sign in
  }

  const connectedPlatforms = platforms.map((platform) => ({
    ...platform,
    connected: linkedAccounts.some((acc) => acc.platform === platform.id),
  }));

  return (
    <div className="bg-surface min-h-screen">
      {/* Navigation Header */}
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                  <Globe className="text-primary-foreground h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-foreground text-xl font-bold">
                    DataMarket
                  </h1>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-secondary flex h-8 w-8 items-center justify-center rounded-full">
                  <User className="text-muted-foreground h-4 w-4" />
                </div>
                <span className="text-sm font-medium">
                  {session.user?.name}
                </span>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/consumer/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="section-padding">
        <div className="container">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-foreground mb-2 text-4xl font-bold">
              Consumer Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your data, earnings, and wallet.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Wallet Balance
                </CardTitle>
                <Wallet className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">
                  {wallet
                    ? formatCurrency(wallet.balance.usdc || "0", "USDC")
                    : "N/A"}
                </div>
                <p className="text-muted-foreground text-xs">
                  {wallet
                    ? `${formatCurrency(wallet.balance.eth || "0", "ETH")} for gas`
                    : "Create a wallet to start earning"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Total Earnings
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-success text-2xl font-bold">
                  {formatCurrency(totalEarnings)}
                </div>
                <p className="text-muted-foreground text-xs">
                  All time earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Connected Accounts
                </CardTitle>
                <LinkIcon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-primary text-2xl font-bold">
                  {linkedAccounts.length}
                </div>
                <p className="text-muted-foreground text-xs">
                  of {platforms.length} available platforms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Account Status
                </CardTitle>
                <User className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-success flex items-center text-2xl font-bold">
                  Verified
                </div>
                <p className="text-muted-foreground truncate text-xs">
                  {session.user?.email}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Account Linking */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LinkIcon className="text-primary mr-3 h-5 w-5" />
                  Connect Your Accounts
                </CardTitle>
                <CardDescription>
                  Link your accounts to start earning from your data. More
                  platforms coming soon!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {connectedPlatforms.map((platform) => (
                    <div
                      key={platform.id}
                      className="bg-secondary flex items-center justify-between rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{platform.icon}</span>
                        <div>
                          <div className="font-medium">{platform.name}</div>
                          {platform.connected && (
                            <div className="text-success text-xs">
                              Connected
                            </div>
                          )}
                        </div>
                      </div>
                      {platform.connected ? (
                        <div className="flex items-center space-x-2">
                          <div className="group relative">
                            <div className="flex items-center space-x-2">
                              <div className="relative">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-green-500 opacity-75"></div>
                              </div>
                              <span className="text-sm font-medium text-green-600">
                                Synced
                              </span>
                            </div>
                            {/* Tooltip */}
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-lg bg-gray-900 px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              Last synced:{" "}
                              {formatDate(
                                linkedAccounts.find(
                                  (acc) => acc.platform === platform.id,
                                )?.lastSync || new Date().toISOString(),
                              )}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAccountLink(platform.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Connect
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custodial Wallet & Recent Activity */}
            <div className="space-y-8 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="text-primary mr-3 h-5 w-5" />
                    Your Custodial Wallet
                  </CardTitle>
                  <CardDescription>
                    {hasWallet
                      ? "Secure wallet managed by the platform for receiving earnings."
                      : "Create your secure wallet to start earning."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasWallet && wallet ? (
                    <div className="space-y-4">
                      <div className="bg-secondary rounded-lg p-4">
                        <div className="text-muted-foreground mb-1 text-xs">
                          Wallet Address
                        </div>
                        <div className="font-mono text-sm break-all">
                          {wallet.address}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary rounded-lg p-3">
                          <div className="text-muted-foreground mb-1 text-xs">
                            USDC Balance
                          </div>
                          <div className="text-lg font-bold">
                            {formatCurrency(wallet.balance.usdc || "0", "USDC")}
                          </div>
                        </div>
                        <div className="bg-secondary rounded-lg p-3">
                          <div className="text-muted-foreground mb-1 text-xs">
                            ETH Balance
                          </div>
                          <div className="text-lg font-bold">
                            {formatCurrency(wallet.balance.eth || "0", "ETH")}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button asChild>
                          <Link href="/consumer/withdraw">
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Withdraw
                          </Link>
                        </Button>
                        <Button asChild variant="secondary">
                          <Link href="/consumer/transactions">
                            <Eye className="mr-2 h-4 w-4" />
                            Transactions
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-secondary rounded-lg p-6 text-center">
                      <Wallet className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-semibold">
                        No Wallet Found
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Create your secure custodial wallet to start earning
                        from your data.
                      </p>
                      <Button asChild>
                        <Link href="/consumer/wallet/create">
                          <Plus className="mr-2 h-4 w-4" />
                          Create CDP Wallet
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="text-primary mr-3 h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest data sales and earnings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hasWallet ? (
                      [
                        {
                          date: "2024-01-20T14:00:00Z",
                          description: "Data sale: Netflix + Spotify data",
                          amount: "+$5.25",
                          status: "completed",
                        },
                        {
                          date: "2024-01-19T16:30:00Z",
                          description: "Withdrawal to external wallet",
                          amount: "-$3.00",
                          status: "completed",
                        },
                        {
                          date: "2024-01-19T10:45:00Z",
                          description: "Data sale: Instagram data",
                          amount: "+$3.25",
                          status: "completed",
                        },
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="bg-secondary flex items-center justify-between rounded-lg p-3"
                        >
                          <div>
                            <div className="font-medium">
                              {activity.description}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {formatDate(activity.date)}
                            </div>
                          </div>
                          <div
                            className={`font-bold ${
                              activity.amount.startsWith("+")
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {activity.amount}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <div className="text-muted-foreground mb-2">
                          No activity yet
                        </div>
                        <p className="text-sm">
                          Create a wallet and link your accounts to start
                          earning!
                        </p>
                      </div>
                    )}
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
