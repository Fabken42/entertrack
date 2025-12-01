// /app/api/genres/[mediaType]/route.js
import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/api/tmdb';
import { rawgClient } from '@/lib/api/rawg';
import { malClient } from '@/lib/api/myanimelist';
import { googleBooksClient } from '@/lib/api/google-books';

export async function GET(request, { params }) {
  try {
    const { mediaType } = await params;

    let genres;

    switch (mediaType) {
      case 'movies':
        const movieGenres = await tmdbClient.getGenres('movie');
        genres = movieGenres.genres;
        break;
      case 'series':
        const tvGenres = await tmdbClient.getGenres('tv');
        genres = tvGenres.genres;
        break;
      case 'games':
        const gameGenres = await rawgClient.getGenres();
        genres = gameGenres.results.map(genre => ({
          id: genre.id.toString(),
          name: genre.name
        }));
        break;
      case 'animes':
        const animeGenres = await malClient.getGenres('anime'); 
        genres = animeGenres;
        break;
      case 'mangas':
        const mangaGenres = await malClient.getGenres('manga'); 
        genres = mangaGenres;
        break;
      case 'books':
        const bookGenres = await googleBooksClient.getGenres();
        genres = bookGenres;
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