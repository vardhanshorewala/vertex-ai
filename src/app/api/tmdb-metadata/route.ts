import { NextRequest, NextResponse } from "next/server";

// TMDB API configuration - using a demo key for testing
const TMDB_API_KEY = "8265bd1679663a7ea12ac168da84d2e8"; // Public demo key
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const type = searchParams.get("type") || "movie"; // movie, tv, music

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter required" },
        { status: 400 },
      );
    }

    if (type === "movie" || type === "tv") {
      // Search TMDB for movies/TV shows
      const searchUrl = `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return NextResponse.json({
          title: result.title || result.name,
          poster_url: result.poster_path
            ? `${TMDB_IMAGE_BASE}${result.poster_path}`
            : null,
          backdrop_url: result.backdrop_path
            ? `${TMDB_IMAGE_BASE}${result.backdrop_path}`
            : null,
          overview: result.overview,
          release_date: result.release_date || result.first_air_date,
          rating: result.vote_average,
          tmdb_id: result.id,
          genre_ids: result.genre_ids,
        });
      }
    }

    // If no results found, return default metadata
    return NextResponse.json({
      title: query,
      poster_url: null,
      overview: `Recommended ${type}: ${query}`,
      rating: null,
    });
  } catch (error) {
    console.error("TMDB API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 },
    );
  }
}
