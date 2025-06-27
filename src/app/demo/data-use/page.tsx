"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useChat } from "ai/react";
import {
  ArrowLeft,
  Send,
  Globe,
  Loader2,
  Film,
  Music,
  Star,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "~/components/ui/use-toast";

interface Recommendation {
  id: string;
  type: "movie" | "music" | "tv" | "book";
  title: string;
  description: string;
  year?: number;
  genre?: string;
  rating?: number;
  duration?: string;
  poster_url?: string;
  cover_url?: string;
  tmdb_id?: string;
  spotify_id?: string;
  confidence: number;
}

export default function DemoDataUsePage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat-recommendations",
      onFinish: async (message) => {
        // Parse the AI response to extract recommendations
        try {
          setIsGeneratingRecs(true);
          const content = message.content;

          // Extract recommendations from the AI response
          const recs = parseRecommendationsFromResponse(content);
          setRecommendations(recs);

          toast({
            title: "Recommendations Generated!",
            description: `Found ${recs.length} personalized recommendations based on your data.`,
            variant: "default",
          });
        } catch (error) {
          console.error("Error processing recommendations:", error);
          toast({
            title: "Error",
            description:
              "Failed to generate recommendations. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsGeneratingRecs(false);
        }
      },
    });

  const parseRecommendationsFromResponse = (
    content: string,
  ): Recommendation[] => {
    // Try to extract structured recommendations from the AI response
    const recommendations: Recommendation[] = [];

    // Look for movie and music titles in the response
    const movieMatches = content.match(/(?:movie|film):\s*"([^"]+)"/gi) || [];
    const musicMatches =
      content.match(/(?:song|album|music):\s*"([^"]+)"/gi) || [];

    // For demo purposes, create some mock recommendations with real metadata
    const mockMovieRecs = [
      {
        id: "movie-1",
        type: "movie" as const,
        title: "Dune: Part Two",
        description: "Epic sci-fi sequel based on your viewing preferences",
        year: 2024,
        genre: "Science Fiction",
        rating: 8.6,
        duration: "2h 46m",
        poster_url:
          "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        tmdb_id: "693134",
        confidence: 0.94,
      },
      {
        id: "movie-2",
        type: "movie" as const,
        title: "The Batman",
        description: "Dark superhero thriller matching your action preferences",
        year: 2022,
        genre: "Action, Crime",
        rating: 7.8,
        duration: "2h 56m",
        poster_url:
          "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
        tmdb_id: "414906",
        confidence: 0.87,
      },
    ];

    const mockMusicRecs = [
      {
        id: "music-1",
        type: "music" as const,
        title: "Anti-Hero - Taylor Swift",
        description: "Pop hit that matches your musical taste",
        year: 2022,
        genre: "Pop",
        rating: 4.5,
        cover_url:
          "https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5",
        confidence: 0.91,
      },
      {
        id: "music-2",
        type: "music" as const,
        title: "Flowers - Miley Cyrus",
        description: "Upbeat track based on your listening history",
        year: 2023,
        genre: "Pop",
        rating: 4.2,
        cover_url:
          "https://i.scdn.co/image/ab67616d0000b273f4c4702c2ba16ef32834a8e6",
        confidence: 0.85,
      },
    ];

    // Combine recommendations based on AI response content
    if (
      content.toLowerCase().includes("movie") ||
      content.toLowerCase().includes("film")
    ) {
      recommendations.push(...mockMovieRecs);
    }
    if (
      content.toLowerCase().includes("music") ||
      content.toLowerCase().includes("song")
    ) {
      recommendations.push(...mockMusicRecs);
    }

    // If no specific type mentioned, include both
    if (recommendations.length === 0) {
      recommendations.push(
        ...mockMovieRecs.slice(0, 1),
        ...mockMusicRecs.slice(0, 1),
      );
    }

    return recommendations;
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(0)}%`;
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "movie":
      case "tv":
        return <Film className="h-5 w-5" />;
      case "music":
        return <Music className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <Link href="/demo/search" className="flex items-center space-x-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Globe className="text-primary-foreground h-5 w-5" />
              </div>
              <h1 className="text-foreground text-xl font-bold">DataMarket</h1>
              <span className="text-muted-foreground text-sm">
                Demo Data Use
              </span>
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/demo/search">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Demo
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="section-padding">
        <div className="container">
          <div className="mb-8 text-center">
            <h1 className="text-foreground mb-2 text-3xl font-bold">
              AI-Powered Data Insights
            </h1>
            <p className="text-muted-foreground text-lg">
              Ask questions about your data and get personalized recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* Chat Interface */}
              <Card>
                <CardHeader>
                  <CardTitle>Chat with Your Data</CardTitle>
                  <CardDescription>
                    Ask questions like "Give me movie suggestions based on what
                    I generally watch at night time"
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chat Messages */}
                  <div className="bg-muted/30 max-h-96 space-y-4 overflow-y-auto rounded-lg p-4">
                    {messages.length === 0 ? (
                      <div className="text-muted-foreground py-8 text-center">
                        <p>
                          Start a conversation by asking for recommendations!
                        </p>
                        <p className="mt-2 text-sm">
                          Try: "What movies should I watch tonight?" or "Suggest
                          music for my workout"
                        </p>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                              message.role === "user"
                                ? "bg-primary text-white"
                                : "bg-card text-foreground border"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-card max-w-xs rounded-lg border px-4 py-2 lg:max-w-md">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <p className="text-sm">AI is thinking...</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <Input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask for recommendations based on your data..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Recommendations Display */}
              {(recommendations.length > 0 || isGeneratingRecs) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="text-primary mr-3 h-5 w-5" />
                      Personalized Recommendations
                    </CardTitle>
                    <CardDescription>
                      Based on your Netflix, Spotify, and Instagram data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isGeneratingRecs ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="text-primary h-8 w-8 animate-spin" />
                        <p className="text-muted-foreground ml-3">
                          Generating recommendations with cover art...
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {recommendations.map((rec) => (
                          <div
                            key={rec.id}
                            className="hover:bg-muted/50 flex space-x-4 rounded-lg border p-4 transition-colors"
                          >
                            <div className="flex-shrink-0">
                              {rec.poster_url || rec.cover_url ? (
                                <img
                                  src={rec.poster_url || rec.cover_url}
                                  alt={rec.title}
                                  className="h-24 w-16 rounded object-cover"
                                />
                              ) : (
                                <div className="bg-muted flex h-24 w-16 items-center justify-center rounded">
                                  {getRecommendationIcon(rec.type)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="truncate text-sm font-semibold">
                                    {rec.title}
                                  </h4>
                                  <p className="text-muted-foreground mt-1 text-xs">
                                    {rec.description}
                                  </p>
                                  <div className="text-muted-foreground mt-2 flex items-center space-x-4 text-xs">
                                    {rec.year && (
                                      <div className="flex items-center">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        {rec.year}
                                      </div>
                                    )}
                                    {rec.duration && (
                                      <div className="flex items-center">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {rec.duration}
                                      </div>
                                    )}
                                    {rec.genre && (
                                      <span className="bg-muted rounded px-2 py-1 text-xs">
                                        {rec.genre}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-success text-sm font-semibold">
                                    {formatConfidence(rec.confidence)}
                                  </div>
                                  <p className="text-muted-foreground text-xs">
                                    match
                                  </p>
                                </div>
                              </div>
                              {rec.rating && (
                                <div className="mt-2 flex items-center">
                                  <Star className="mr-1 h-3 w-3 text-yellow-400" />
                                  <span className="text-xs font-medium">
                                    {rec.rating}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Available Data Sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">🎬 Netflix History</span>
                    <span className="text-success text-xs">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">🎵 Spotify Data</span>
                    <span className="text-success text-xs">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">📸 Instagram Interests</span>
                    <span className="text-success text-xs">Connected</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sample Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "What movies should I watch tonight?",
                    "Suggest music for my workout",
                    "Find shows similar to what I've been watching",
                    "Recommend albums based on my taste",
                    "What's trending that I might like?",
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        // Set the input value and submit
                        handleInputChange({
                          target: { value: question },
                        } as any);
                      }}
                      className="bg-muted/50 hover:bg-muted w-full rounded border p-2 text-left text-xs transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex items-center">
                    <div className="bg-success mr-2 h-2 w-2 rounded-full" />
                    <span>Real-time data analysis</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-success mr-2 h-2 w-2 rounded-full" />
                    <span>TMDB movie metadata</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-success mr-2 h-2 w-2 rounded-full" />
                    <span>Spotify music data</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-success mr-2 h-2 w-2 rounded-full" />
                    <span>Confidence scoring</span>
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
