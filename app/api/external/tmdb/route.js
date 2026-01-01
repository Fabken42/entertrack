// /entertrack/app/api/external/tmdb/route.js
import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/api/tmdb';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const page = searchParams.get('page') || '1';
  const id = searchParams.get('id');

  try {
    switch (action) {
      case 'search-movies':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }
        const movies = await tmdbClient.searchMovies(query, parseInt(page));
        return NextResponse.json(movies);

      case 'search-tv':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }
        const tvShows = await tmdbClient.searchTVShows(query, parseInt(page));
        return NextResponse.json(tvShows);

      case 'search-multi':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }
        const multi = await tmdbClient.searchMulti(query, parseInt(page));
        return NextResponse.json(multi);

      case 'movie-details':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
        }
        const movieDetails = await tmdbClient.getMovieDetails(parseInt(id));
        return NextResponse.json(movieDetails);

      case 'tv-details':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
        }
        const tvDetails = await tmdbClient.getTVShowSeasonsInfo(parseInt(id));
        return NextResponse.json(tvDetails);

      case 'movie-genres':
        const movieGenres = await tmdbClient.getMovieGenres();
        return NextResponse.json(movieGenres);

      case 'tv-genres':
        const tvGenres = await tmdbClient.getTVGenres();
        return NextResponse.json(tvGenres);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('TMDB API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from TMDB' },
      { status: 500 }
    );
  }
}