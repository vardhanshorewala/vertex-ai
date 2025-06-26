"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { 
  Wallet, 
  Search, 
  Sparkles,
  User,
  MapPin,
  Phone,
  Eye,
  Play,
  TrendingUp,
  Database,
  CreditCard,
  CheckCircle,
  Info,
  Zap,
  Target,
  BarChart3,
  Heart,
  Star
} from "lucide-react";
import { formatCurrency, formatDate } from "~/lib/utils";
import type { AIRecommendation, MockDataSet } from "~/types";
import { toast } from "~/components/ui/use-toast";

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
  status: 'pending' | 'processing' | 'completed';
}

const sampleProfiles: DemoProfile[] = [
  {
    name: "Alex Chen",
    state: "CA", 
    phone: "(555) 123-4567",
    avatar: "👨‍💻",
    dataScore: 92
  },
  {
    name: "Sarah Johnson", 
    state: "NY",
    phone: "(555) 987-6543", 
    avatar: "👩‍🎨",
    dataScore: 87
  },
  {
    name: "Mike Rodriguez",
    state: "TX",
    phone: "(555) 456-7890",
    avatar: "👨‍🏫", 
    dataScore: 94
  }
];

const mockDataSet: MockDataSet = {
  netflix: {
    viewingHistory: [
      { title: "Stranger Things", genre: "Sci-Fi", watchedAt: "2024-01-15T20:30:00Z", rating: 5 },
      { title: "The Crown", genre: "Drama", watchedAt: "2024-01-14T19:15:00Z", rating: 4 },
      { title: "Bridgerton", genre: "Romance", watchedAt: "2024-01-13T21:00:00Z", rating: 4 }
    ],
    preferences: {
      favoriteGenres: ["Drama", "Sci-Fi", "Documentary"],
      watchingHabits: "Evening binge watcher, prefers series over movies"
    }
  },
  spotify: {
    listeningHistory: [
      { track: "Blinding Lights", artist: "The Weeknd", album: "After Hours", playedAt: "2024-01-20T14:30:00Z", duration: 200 },
      { track: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line", playedAt: "2024-01-20T13:15:00Z", duration: 174 },
      { track: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", playedAt: "2024-01-20T12:45:00Z", duration: 203 }
    ],
    preferences: {
      topGenres: ["Pop", "Electronic", "Indie"],
      discoveryMode: "High - loves finding new artists"
    }
  },
  instagram: {
    engagementData: {
      postsPerWeek: 4,
      averageLikes: 127,
      topHashtags: ["#fitness", "#travel", "#foodie"]
    },
    interests: ["Health & Fitness", "Travel", "Photography", "Food"]
  }
};

const aiRecommendations: AIRecommendation[] = [
  {
    id: "rec-001",
    type: "movie",
    title: "Dune: Part Two",
    description: "Based on your love for sci-fi series like Stranger Things",
    confidence: 0.94,
    basedOn: ["netflix_viewing", "genre_preferences"],
    metadata: {
      genre: "Sci-Fi",
      releaseYear: 2024,
      rating: 8.8,
      platform: "Netflix"
    }
  },
  {
    id: "rec-002", 
    type: "music",
    title: "Charli XCX - Brat",
    description: "Perfect match for your pop and electronic taste",
    confidence: 0.89,
    basedOn: ["spotify_history", "genre_preferences"],
    metadata: {
      genre: "Pop",
      releaseYear: 2024,
      rating: 4.2,
      platform: "Spotify"
    }
  },
  {
    id: "rec-003",
    type: "content",
    title: "Mediterranean Cooking Class",
    description: "Matches your foodie interests and engagement patterns", 
    confidence: 0.82,
    basedOn: ["instagram_interests", "hashtag_analysis"],
    metadata: {
      platform: "Local Events"
    }
  }
];

export default function DemoSearch() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<DemoProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDataView, setShowDataView] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [paymentSteps, setPaymentSteps] = useState<PaymentStep[]>([
    { step: 1, title: "Initiate x402 Payment", description: "Processing payment request", status: 'pending' },
    { step: 2, title: "Verify Consumer Data", description: "Confirming data availability", status: 'pending' },
    { step: 3, title: "Transfer Funds", description: "Sending payment to consumer wallet", status: 'pending' },
    { step: 4, title: "Deliver Data", description: "Providing access to requested data", status: 'pending' }
  ]);

  const handleWalletConnect = () => {
    setIsWalletConnected(!isWalletConnected);
    toast({
      title: isWalletConnected ? "Wallet Disconnected" : "Wallet Connected",
      description: isWalletConnected 
        ? "Your wallet has been disconnected from the demo." 
        : "Demo wallet connected successfully! You can now explore the marketplace."
    });
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      toast({
        title: "Enter Search Query",
        description: "Please enter a name to search for demo profiles.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSearching(false);
    setSelectedProfile(null);
    
    toast({
      title: "Search Complete",
      description: `Found ${sampleProfiles.length} demo profiles matching your query.`
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
      description: "Viewing sample data sources for selected profile."
    });
  };

  const handlePurchaseData = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to demo the payment flow.",
        variant: "destructive"
      });
      return;
    }

    setShowPaymentFlow(true);
    
    // Simulate payment steps
    for (let i = 0; i < paymentSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPaymentSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'processing' as const }
          : step
      ));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPaymentSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'completed' as const }
          : step
      ));
    }
    
    setShowRecommendations(true);
    
    toast({
      title: "Purchase Complete!",
      description: "Payment processed successfully. AI recommendations generated based on purchased data."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Interactive Marketplace Demo</h1>
          <p className="text-gray-300">Experience the complete data marketplace workflow with AI-powered recommendations</p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isWalletConnected ? 'bg-green-500/20' : 'bg-gray-500/20'
                  }`}>
                    <Wallet className={`w-6 h-6 ${isWalletConnected ? 'text-green-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Demo Wallet</h3>
                    <p className="text-gray-300 text-sm">
                      {isWalletConnected ? 'Connected: 0x1234...5678' : 'Connect to experience payment flows'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleWalletConnect}
                  className={`${
                    isWalletConnected 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                  }`}
                >
                  {isWalletConnected ? 'Disconnect' : 'Connect Wallet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Form */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Consumer Profile Search
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Search for demo consumer profiles to explore available data sources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <Input
                    placeholder="Search by name (e.g., Alex, Sarah, Mike)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {/* Sample Profiles */}
                {!isSearching && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {sampleProfiles.map((profile, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedProfile?.name === profile.name
                            ? 'bg-purple-500/20 border-purple-400'
                            : 'bg-white/5 border-white/20 hover:border-white/40'
                        }`}
                        onClick={() => handleProfileSelect(profile)}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{profile.avatar}</div>
                          <h3 className="text-white font-semibold">{profile.name}</h3>
                          <p className="text-gray-300 text-sm">{profile.state} • {profile.phone}</p>
                          <div className="flex items-center justify-center mt-2">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-yellow-400 text-sm">{profile.dataScore}/100</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Data View */}
            {selectedProfile && showDataView && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Available Data Sources - {selectedProfile.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Netflix Data */}
                  <div className="border border-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      🎬 Netflix Data <span className="ml-2 text-sm text-gray-300">($2.75)</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-300 mb-2">Recent Viewing:</p>
                        {mockDataSet.netflix?.viewingHistory.slice(0, 3).map((item, i) => (
                          <p key={i} className="text-white">• {item.title} ({item.genre})</p>
                        ))}
                      </div>
                      <div>
                        <p className="text-gray-300 mb-2">Preferences:</p>
                        <p className="text-white">Genres: {mockDataSet.netflix?.preferences.favoriteGenres.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Spotify Data */}
                  <div className="border border-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      🎵 Spotify Data <span className="ml-2 text-sm text-gray-300">($2.50)</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-300 mb-2">Recent Tracks:</p>
                        {mockDataSet.spotify?.listeningHistory.slice(0, 3).map((item, i) => (
                          <p key={i} className="text-white">• {item.track} - {item.artist}</p>
                        ))}
                      </div>
                      <div>
                        <p className="text-gray-300 mb-2">Music Taste:</p>
                        <p className="text-white">Genres: {mockDataSet.spotify?.preferences.topGenres.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Instagram Data */}
                  <div className="border border-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      📸 Instagram Data <span className="ml-2 text-sm text-gray-300">($3.25)</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-300 mb-2">Engagement:</p>
                        <p className="text-white">• {mockDataSet.instagram?.engagementData.postsPerWeek} posts/week</p>
                        <p className="text-white">• {mockDataSet.instagram?.engagementData.averageLikes} avg likes</p>
                      </div>
                      <div>
                        <p className="text-gray-300 mb-2">Interests:</p>
                        <p className="text-white">{mockDataSet.instagram?.interests.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div>
                      <p className="text-white font-semibold">Total: {formatCurrency(8.50)}</p>
                      <p className="text-gray-300 text-sm">All 3 data sources</p>
                    </div>
                    <Button
                      onClick={handlePurchaseData}
                      className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                    >
                      Purchase Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Flow */}
            {showPaymentFlow && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    x402 Payment Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentSteps.map((step) => (
                      <div key={step.step} className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'processing' ? 'bg-yellow-500' : 
                          'bg-gray-500'
                        }`}>
                          {step.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-white text-sm">{step.step}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{step.title}</p>
                          <p className="text-gray-300 text-sm">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Recommendations */}
            {showRecommendations && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI-Powered Recommendations
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Personalized suggestions based on purchased data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiRecommendations.map((rec) => (
                    <div key={rec.id} className="border border-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-semibold">{rec.title}</h4>
                          <p className="text-gray-300 text-sm">{rec.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">{(rec.confidence * 100).toFixed(0)}%</p>
                          <p className="text-gray-400 text-xs">confidence</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                        <span>📊 Based on: {rec.basedOn.join(', ')}</span>
                        {rec.metadata?.platform && (
                          <span>📱 Platform: {rec.metadata.platform}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Profile */}
            {selectedProfile && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Selected Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl mb-3">{selectedProfile.avatar}</div>
                  <h3 className="text-white font-semibold text-lg">{selectedProfile.name}</h3>
                  <p className="text-gray-300">{selectedProfile.state} • {selectedProfile.phone}</p>
                  <div className="flex items-center justify-center mt-3 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="text-yellow-400 font-semibold">{selectedProfile.dataScore}/100</span>
                    <span className="text-gray-300 ml-1">Data Quality</span>
                  </div>
                  <Button
                    onClick={handleViewData}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Available Data
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Demo Features */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Demo Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Sample consumer profiles
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Real data source previews
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  x402 payment simulation
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  AI recommendation engine
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Wallet integration demo
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Stats */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Live Demo Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Profiles Available</span>
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Data Sources</span>
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Avg Data Quality</span>
                  <span className="text-white font-semibold">91/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Demo Sessions</span>
                  <span className="text-white font-semibold">1,247</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 