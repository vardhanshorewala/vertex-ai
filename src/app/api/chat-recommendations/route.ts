import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "~/env";

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
  baseURL: env.OPENAI_BASE_URL,
});

// Enhanced mock user data for more personalized recommendations
const mockUserData = {
  netflix: {
    viewingHistory: [
      {
        title: "Stranger Things",
        genre: "Sci-Fi/Horror",
        rating: 9.1,
        watchTime: "evening",
        completionRate: 100,
        rewatched: true,
        season: 4,
        dateWatched: "2024-01-15",
      },
      {
        title: "The Crown",
        genre: "Drama/Historical",
        rating: 8.7,
        watchTime: "weekend",
        completionRate: 85,
        rewatched: false,
        season: 6,
        dateWatched: "2024-01-20",
      },
      {
        title: "Black Mirror",
        genre: "Sci-Fi/Thriller",
        rating: 8.8,
        watchTime: "night",
        completionRate: 90,
        rewatched: false,
        season: 6,
        dateWatched: "2024-01-25",
      },
      {
        title: "Ozark",
        genre: "Crime/Drama",
        rating: 8.4,
        watchTime: "evening",
        completionRate: 100,
        rewatched: false,
        season: 4,
        dateWatched: "2024-01-10",
      },
      {
        title: "Wednesday",
        genre: "Horror/Comedy",
        rating: 8.1,
        watchTime: "night",
        completionRate: 100,
        rewatched: false,
        season: 1,
        dateWatched: "2024-01-30",
      },
      {
        title: "The Bear",
        genre: "Comedy/Drama",
        rating: 9.2,
        watchTime: "evening",
        completionRate: 100,
        rewatched: true,
        season: 3,
        dateWatched: "2024-02-01",
      },
      {
        title: "Dark",
        genre: "Sci-Fi/Mystery",
        rating: 9.3,
        watchTime: "night",
        completionRate: 95,
        rewatched: false,
        season: 3,
        dateWatched: "2024-01-08",
      },
    ],
    preferences: {
      favoriteGenres: ["Sci-Fi", "Drama", "Thriller", "Mystery", "Horror"],
      preferredWatchTime: "evening/night",
      avgRatingThreshold: 8.0,
      bingeWatching: true,
      preferSubtitles: true,
      skipIntros: false,
      devicePreference: "TV",
    },
    currentlyWatching: [
      { title: "The Last of Us", episode: "S2E3", progress: 45 },
      { title: "House of the Dragon", episode: "S2E5", progress: 20 },
    ],
    watchlist: [
      "Dune: Part Two",
      "The Gentlemen",
      "Nobody Wants This",
      "Emily in Paris S4",
    ],
  },
  spotify: {
    topArtists: [
      {
        name: "Taylor Swift",
        playTime: "45 hours",
        topSong: "Anti-Hero",
        genre: "Pop",
      },
      {
        name: "The Weeknd",
        playTime: "32 hours",
        topSong: "Blinding Lights",
        genre: "R&B/Pop",
      },
      {
        name: "Billie Eilish",
        playTime: "28 hours",
        topSong: "What Was I Made For?",
        genre: "Alternative/Pop",
      },
      {
        name: "Arctic Monkeys",
        playTime: "25 hours",
        topSong: "505",
        genre: "Indie Rock",
      },
      {
        name: "Lana Del Rey",
        playTime: "22 hours",
        topSong: "West Coast",
        genre: "Dream Pop",
      },
    ],
    topGenres: [
      { genre: "Pop", percentage: 35 },
      { genre: "Alternative", percentage: 25 },
      { genre: "Indie Rock", percentage: 20 },
      { genre: "Electronic", percentage: 15 },
      { genre: "R&B", percentage: 5 },
    ],
    recentlyPlayed: [
      {
        track: "Anti-Hero - Taylor Swift",
        timestamp: "2024-02-01 20:30",
        skipped: false,
      },
      {
        track: "Flowers - Miley Cyrus",
        timestamp: "2024-02-01 20:26",
        skipped: false,
      },
      {
        track: "As It Was - Harry Styles",
        timestamp: "2024-02-01 20:22",
        skipped: false,
      },
      {
        track: "Bad Habit - Steve Lacy",
        timestamp: "2024-02-01 20:18",
        skipped: true,
      },
    ],
    listeningHabits: {
      mostActiveTime: "evening (7-10pm)",
      averageSessionLength: "45 minutes",
      skipRate: "15%",
      discoverWeeklyEngagement: "high",
      playlistCreation: "frequent",
      shareMusic: true,
    },
    playlists: [
      { name: "Night Vibes", tracks: 127, lastUpdated: "2024-01-30" },
      { name: "Workout Energy", tracks: 89, lastUpdated: "2024-01-28" },
      { name: "Coffee Shop", tracks: 156, lastUpdated: "2024-01-25" },
      { name: "Road Trip", tracks: 203, lastUpdated: "2024-01-20" },
    ],
    moodPreferences: {
      chill: 40,
      energetic: 30,
      nostalgic: 20,
      experimental: 10,
    },
  },
  instagram: {
    interests: [
      {
        topic: "food",
        engagementLevel: "high",
        subCategories: ["cooking", "restaurants", "baking"],
      },
      {
        topic: "travel",
        engagementLevel: "high",
        subCategories: ["destinations", "photography", "culture"],
      },
      {
        topic: "fitness",
        engagementLevel: "medium",
        subCategories: ["yoga", "running", "nutrition"],
      },
      {
        topic: "photography",
        engagementLevel: "high",
        subCategories: ["portraits", "nature", "street"],
      },
      {
        topic: "technology",
        engagementLevel: "medium",
        subCategories: ["gadgets", "AI", "apps"],
      },
      {
        topic: "fashion",
        engagementLevel: "medium",
        subCategories: ["sustainable", "vintage", "streetwear"],
      },
    ],
    engagementTypes: [
      { type: "cooking videos", frequency: "daily", avgWatchTime: "2 minutes" },
      { type: "travel reels", frequency: "daily", avgWatchTime: "1.5 minutes" },
      {
        type: "workout posts",
        frequency: "3x/week",
        avgWatchTime: "45 seconds",
      },
      {
        type: "photography posts",
        frequency: "daily",
        avgWatchTime: "30 seconds",
      },
      { type: "tech reviews", frequency: "weekly", avgWatchTime: "3 minutes" },
    ],
    followedAccounts: [
      { type: "food bloggers", count: 45, topAccount: "@bonappetit" },
      { type: "travel influencers", count: 32, topAccount: "@expertvagabond" },
      { type: "tech reviewers", count: 18, topAccount: "@mkbhd" },
      { type: "photographers", count: 28, topAccount: "@jordanhammond" },
      { type: "fitness coaches", count: 15, topAccount: "@massy.arias" },
    ],
    activityPatterns: {
      mostActiveTime: "morning (8-10am) and evening (7-9pm)",
      contentPreference: "visual content with detailed captions",
      storiesVsPosts: "70% stories, 30% posts",
      saveRate: "high",
      shareRate: "medium",
    },
    locationData: {
      recentPlaces: ["San Francisco", "Napa Valley", "Big Sur"],
      favoriteSpots: ["cafes", "hiking trails", "art galleries"],
      travelStyle: "experiential, local culture focused",
    },
  },
  demographics: {
    age: 28,
    location: "San Francisco, CA",
    profession: "Software Engineer",
    lifestyle: "urban professional",
    relationshipStatus: "single",
    interests: ["technology", "food", "travel", "photography"],
  },
  behaviorPatterns: {
    decisionMaking: "research-driven",
    socialSharing: "moderate",
    brandLoyalty: "medium",
    priceConsciousness: "value-focused",
    adventurousness: "high",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Get the latest user message
    const userMessage = messages[messages.length - 1].content;

    // Create a comprehensive system prompt with enhanced user data context
    const systemPrompt = `You are an AI assistant that provides highly personalized recommendations based on comprehensive user data analysis.

USER PROFILE:
Demographics: 28-year-old Software Engineer in San Francisco, urban professional lifestyle, research-driven decision making

NETFLIX VIEWING PATTERNS:
- Favorite genres: ${mockUserData.netflix.preferences.favoriteGenres.join(", ")}
- Viewing time: ${mockUserData.netflix.preferences.preferredWatchTime} (prefers binge-watching)
- Quality threshold: ${mockUserData.netflix.preferences.avgRatingThreshold}+ rating required
- Recent favorites: ${mockUserData.netflix.viewingHistory
      .filter((show) => show.rating > 8.5)
      .map((show) => `${show.title} (${show.rating}/10)`)
      .join(", ")}
- Currently watching: ${mockUserData.netflix.currentlyWatching.map((show) => show.title).join(", ")}
- Completion rate: High (typically finishes shows), rewatches favorites
- Device: Prefers TV viewing, uses subtitles, doesn't skip intros

SPOTIFY MUSIC PROFILE:
- Top artists: ${mockUserData.spotify.topArtists.map((artist) => `${artist.name} (${artist.playTime})`).join(", ")}
- Genre distribution: ${mockUserData.spotify.topGenres.map((g) => `${g.genre} (${g.percentage}%)`).join(", ")}
- Listening habits: Active during ${mockUserData.spotify.listeningHabits.mostActiveTime}, ${mockUserData.spotify.listeningHabits.averageSessionLength} sessions
- Playlists: Creates frequently (${mockUserData.spotify.playlists.length} active playlists)
- Music discovery: High engagement with Discover Weekly, low skip rate (${mockUserData.spotify.listeningHabits.skipRate})
- Mood preferences: ${Object.entries(mockUserData.spotify.moodPreferences)
      .map(([mood, pct]) => `${mood} (${pct}%)`)
      .join(", ")}

INSTAGRAM INTERESTS & LIFESTYLE:
- Primary interests: ${mockUserData.instagram.interests
      .filter((i) => i.engagementLevel === "high")
      .map((i) => `${i.topic} (${i.subCategories.join(", ")})`)
      .join("; ")}
- Content engagement: Daily interaction with ${mockUserData.instagram.engagementTypes
      .slice(0, 3)
      .map((e) => e.type)
      .join(", ")}
- Location: San Francisco area, recent visits to ${mockUserData.instagram.locationData.recentPlaces.join(", ")}
- Social behavior: ${mockUserData.instagram.activityPatterns.saveRate} save rate, prefers visual content with detailed information

BEHAVIORAL PATTERNS:
- Decision style: ${mockUserData.behaviorPatterns.decisionMaking}
- Adventurousness: ${mockUserData.behaviorPatterns.adventurousness} (open to new experiences)
- Value focus: ${mockUserData.behaviorPatterns.priceConsciousness}

RECOMMENDATION GUIDELINES:
1. For MOVIES/TV: Consider viewing history patterns, current watchlist, time preferences, and genre mixing
2. For MUSIC: Factor in mood preferences, listening times, artist similarity, and playlist themes  
3. For ACTIVITIES: Consider location, interests depth, social preferences, and lifestyle
4. Always explain the "WHY" behind recommendations using specific data points
5. Suggest timing (when to watch/listen) based on their patterns
6. Include confidence levels and alternatives
7. Consider their research-driven nature - provide detailed reasoning

Be conversational, insightful, and reference specific data points that led to each recommendation.`;

    const result = streamText({
      model: openai("gpt-4.1"),
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat-recommendations API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate recommendations" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
