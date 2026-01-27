// /app/api/genres/[mediaType]/route.js
import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/api/tmdb';
import { rawgClient } from '@/lib/api/rawg';
import { jikanClient } from '@/lib/api/jikan';

export async function GET(request, { params }) {
  try {
    const { mediaType } = await params;

    let genres;

    switch (mediaType) {
      case 'movie':
        const movieGenres = await tmdbClient.getGenres('movie');
        genres = movieGenres.genres;
        break;
      case 'series':
        const tvGenres = await tmdbClient.getGenres('tv');
        genres = tvGenres.genres;
        break;
      case 'game':
        const gameGenres = await rawgClient.getGenres();
        genres = gameGenres;
        break;
      case 'anime':
        const animeGenres = await jikanClient.getGenres('anime');
        genres = animeGenres;
        break;
      case 'manga':
        const mangaGenres = await jikanClient.getGenres('manga');
        genres = mangaGenres;
        break;
      default:
        return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    return NextResponse.json(genres);
  } catch (error) {
    console.error('Genres API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch genres' },
      { status: 500 }
    );
  }
}