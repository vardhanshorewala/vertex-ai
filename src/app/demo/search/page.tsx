"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Wallet,
  Search,
  Sparkles,
  User,
  Eye,
  Zap,
  CheckCircle,
  Info,
  Globe,
  Loader2,
  ArrowLeft,
  Database,
  BarChart3,
  Star,
} from "lucide-react";
import { formatCurrency } from "~/lib/utils";
import type { AIRecommendation, MockDataSet } from "~/types";
import { toast } from "~/components/ui/use-toast";
import Link from "next/link";

interface DemoProfile {
  name: string;
  state: string;
  phone: string;
  avatar: string;
  dataScore: number;
}

interface PaymentStep {
  step: number;
  title: string;
  description: string;
  status: "pending" | "processing" | "completed";
}

const sampleProfiles: DemoProfile[] = [
  {
    name: "Alex Chen",
    state: "CA",
    phone: "(555) 123-4567",
    avatar: "👨‍💻",
    dataScore: 92,
  },
  {
    name: "Sarah Johnson",
    state: "NY",
    phone: "(555) 987-6543",
    avatar: "👩‍🎨",
    dataScore: 87,
  },
  {
    name: "Mike Rodriguez",
    state: "TX",
    phone: "(555) 456-7890",
    avatar: "👨‍🏫",
    dataScore: 94,
  },
];

const mockDataSet: MockDataSet = {
  netflix: {
    viewingHistory: [
      {
        title: "Stranger Things",
        genre: "Sci-Fi",
        watchedAt: "2024-01-15T20:30:00Z",
        rating: 5,
      },
      {
        title: "The Crown",
        genre: "Drama",
        watchedAt: "2024-01-14T19:15:00Z",
        rating: 4,
      },
    ],
    preferences: {
      favoriteGenres: ["Drama", "Sci-Fi"],
      watchingHabits: "Binge watcher",
    },
  },
  spotify: {
    listeningHistory: [
      {
        track: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        playedAt: "2024-01-20T14:30:00Z",
        duration: 200,
      },
      {
        track: "Watermelon Sugar",
        artist: "Harry Styles",
        album: "Fine Line",
        playedAt: "2024-01-20T13:15:00Z",
        duration: 174,
      },
    ],
    preferences: { topGenres: ["Pop", "Electronic"], discoveryMode: "High" },
  },
  instagram: {
    engagementData: {
      postsPerWeek: 4,
      averageLikes: 127,
      topHashtags: ["#fitness", "#travel"],
    },
    interests: ["Health & Fitness", "Travel", "Photography"],
  },
};

const aiRecommendations: AIRecommendation[] = [
  {
    id: "rec-001",
    type: "movie",
    title: "Dune: Part Two",
    description: "Based on your love for sci-fi.",
    confidence: 0.94,
    basedOn: ["netflix_viewing"],
    metadata: { platform: "Netflix" },
  },
  {
    id: "rec-002",
    type: "music",
    title: "Charli XCX - Brat",
    description: "Matches your pop taste.",
    confidence: 0.89,
    basedOn: ["spotify_history"],
    metadata: { platform: "Spotify" },
  },
  {
    id: "rec-003",
    type: "content",
    title: "Mediterranean Cooking Class",
    description: "Matches your foodie interests.",
    confidence: 0.82,
    basedOn: ["instagram_interests"],
    metadata: { platform: "Local Events" },
  },
];

export default function DemoSearch() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<DemoProfile | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showDataView, setShowDataView] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [paymentSteps, setPaymentSteps] = useState<PaymentStep[]>([
    {
      step: 1,
      title: "Initiate x402 Payment",
      description: "Processing payment request",
      status: "pending",
    },
    {
      step: 2,
      title: "Verify Consumer Data",
      description: "Confirming data availability",
      status: "pending",
    },
    {
      step: 3,
      title: "Transfer Funds",
      description: "Sending payment to consumer wallet",
      status: "pending",
    },
    {
      step: 4,
      title: "Deliver Data",
      description: "Providing access to requested data",
      status: "pending",
    },
  ]);

  const handleWalletConnect = () => {
    setIsWalletConnected(!isWalletConnected);
    toast({
      title: isWalletConnected ? "Wallet Disconnected" : "Wallet Connected",
      description: isWalletConnected
        ? "Your demo wallet has been disconnected."
        : "Demo wallet connected successfully!",
      variant: "default",
    });
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      toast({
        title: "Enter Search Query",
        description: "Please enter a name to search.",
        variant: "destructive",
      });
      return;
    }
    setIsSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSearching(false);
    setSelectedProfile(null);
    toast({
      title: "Search Complete",
      description: `Found ${sampleProfiles.length} demo profiles.`,
    });
  };

  const handleProfileSelect = (profile: DemoProfile) => {
    setSelectedProfile(profile);
    setShowDataView(false);
    setShowPaymentFlow(false);
    setShowRecommendations(false);
  };

  const handleViewData = () => {
    setShowDataView(true);
    setShowRecommendations(false);
    toast({
      title: "Data Preview",
      description: "Viewing sample data for selected profile.",
      variant: "default",
    });
  };

  const handlePurchaseData = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to demo the payment flow.",
        variant: "destructive",
      });
      return;
    }
    setShowPaymentFlow(true);

    for (let i = 0; i < paymentSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPaymentSteps((prev) =>
        prev.map((step, index) =>
          index === i ? { ...step, status: "processing" as const } : step,
        ),
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPaymentSteps((prev) =>
        prev.map((step, index) =>
          index === i ? { ...step, status: "completed" as const } : step,
        ),
      );
    }

    setShowRecommendations(true);
    toast({
      title: "Purchase Complete!",
      description: "AI recommendations generated based on purchased data.",
      variant: "default",
    });
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
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="section-padding">
        <div className="container">
          <div className="mb-12 text-center">
            <h1 className="text-foreground mb-2 text-4xl font-bold">
              Interactive Marketplace Demo
            </h1>
            <p className="text-muted-foreground text-lg">
              Experience the complete data marketplace workflow with AI-powered
              recommendations.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${isWalletConnected ? "bg-success/10" : "bg-secondary"}`}
                  >
                    <Wallet
                      className={`h-6 w-6 ${isWalletConnected ? "text-success" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">Demo Wallet</h3>
                    <p className="text-muted-foreground text-sm">
                      {isWalletConnected
                        ? "Connected: 0x1234...5678"
                        : "Connect to experience payment flows"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleWalletConnect}
                  variant={isWalletConnected ? "destructive" : "default"}
                >
                  {isWalletConnected ? "Disconnect" : "Connect Wallet"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="text-primary mr-3 h-5 w-5" />
                    Consumer Profile Search
                  </CardTitle>
                  <CardDescription>
                    Search for demo consumer profiles to explore available data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <Input
                      placeholder="Search by name (e.g., Alex, Sarah, Mike)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </div>

                  {!isSearching && (
                    <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3">
                      {sampleProfiles.map((profile, index) => (
                        <button
                          key={index}
                          className={`rounded-lg border-2 p-4 text-center transition-all ${
                            selectedProfile?.name === profile.name
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:bg-secondary"
                          }`}
                          onClick={() => handleProfileSelect(profile)}
                        >
                          <div className="mb-2 text-3xl">{profile.avatar}</div>
                          <h3 className="font-semibold">{profile.name}</h3>
                          <p className="text-muted-foreground text-sm">
                            {profile.state}
                          </p>
                          <div className="mt-2 flex items-center justify-center">
                            <Star className="mr-1 h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {profile.dataScore}/100
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedProfile && showDataView && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="text-primary mr-3 h-5 w-5" />
                      Available Data Sources for {selectedProfile.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="mb-3 flex items-center font-semibold">
                        🎬 Netflix Data{" "}
                        <span className="text-muted-foreground ml-2 text-sm">
                          ({formatCurrency(2.75)})
                        </span>
                      </h4>
                      <p className="text-sm">
                        Recent Views:{" "}
                        {mockDataSet.netflix?.viewingHistory
                          .map((v) => v.title)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="mb-3 flex items-center font-semibold">
                        🎵 Spotify Data{" "}
                        <span className="text-muted-foreground ml-2 text-sm">
                          ({formatCurrency(2.5)})
                        </span>
                      </h4>
                      <p className="text-sm">
                        Top Genres:{" "}
                        {mockDataSet.spotify?.preferences.topGenres.join(", ")}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="mb-3 flex items-center font-semibold">
                        📸 Instagram Data{" "}
                        <span className="text-muted-foreground ml-2 text-sm">
                          ({formatCurrency(3.25)})
                        </span>
                      </h4>
                      <p className="text-sm">
                        Interests: {mockDataSet.instagram?.interests.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="text-lg font-bold">
                        Total: {formatCurrency(8.5)}
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handlePurchaseData} variant="success">
                          Purchase Data
                        </Button>
                        <Button asChild variant="outline">
                          <Link href="/demo/data-use">Demo Data Use</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showPaymentFlow && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="text-primary mr-3 h-5 w-5" />
                      x402 Payment Processing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {paymentSteps.map((step) => (
                      <div
                        key={step.step}
                        className="flex items-center space-x-4"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                            step.status === "completed"
                              ? "bg-success"
                              : step.status === "processing"
                                ? "bg-warning"
                                : "bg-muted"
                          }`}
                        >
                          {step.status === "completed" ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : step.status === "processing" ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <span className="font-medium">{step.step}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{step.title}</p>
                          <p className="text-muted-foreground text-sm">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {showRecommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="text-primary mr-3 h-5 w-5" />
                      AI-Powered Recommendations
                    </CardTitle>
                    <CardDescription>
                      Personalized suggestions based on purchased data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiRecommendations.map((rec) => (
                      <div key={rec.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{rec.title}</h4>
                            <p className="text-muted-foreground text-sm">
                              {rec.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-success font-semibold">
                              {(rec.confidence * 100).toFixed(0)}%
                            </p>
                            <p className="text-muted-foreground text-xs">
                              confidence
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {selectedProfile && (
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="text-primary mr-3 h-5 w-5" />
                      Selected Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-3 text-4xl">
                      {selectedProfile.avatar}
                    </div>
                    <h3 className="text-lg font-semibold">
                      {selectedProfile.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedProfile.state}
                    </p>
                    <div className="mt-3 mb-4 flex items-center justify-center">
                      <Star className="mr-2 h-5 w-5 text-yellow-400" />
                      <span className="font-semibold">
                        {selectedProfile.dataScore}/100
                      </span>
                      <span className="text-muted-foreground ml-1 text-sm">
                        Data Quality
                      </span>
                    </div>
                    <Button onClick={handleViewData} className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      View Available Data
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="text-primary mr-3 h-5 w-5" />
                    Demo Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    "Sample consumer profiles",
                    "Real data source previews",
                    "x402 payment simulation",
                    "AI recommendation engine",
                    "Wallet integration demo",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center">
                      <CheckCircle className="text-success mr-3 h-4 w-4 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="text-primary mr-3 h-5 w-5" />
                    Live Demo Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Profiles Available
                    </span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Sources</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Avg Data Quality
                    </span>
                    <span className="font-medium">91/100</span>
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
