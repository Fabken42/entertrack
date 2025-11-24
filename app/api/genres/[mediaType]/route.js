import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/api/tmdb';
import { rawgClient } from '@/lib/api/rawg';

export async function GET(request, { params }) {
  try {
    const { mediaType } = await params;

    let genres;

    switch (mediaType) {
      case 'movies':
        const movieGenres = await tmdbClient.getMovieGenres();
        genres = movieGenres.genres;
        break;
      case 'series':
        const tvGenres = await tmdbClient.getTVGenres();
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
      case 'mangas': // MESMOS gêneros para animes e mangás
        genres = [
          { id: '1', name: 'Ação' },
          { id: '2', name: 'Aventura' },
          { id: '4', name: 'Comédia' },
          { id: '7', name: 'Mistério' },
          { id: '8', name: 'Drama' },
          { id: '10', name: 'Fantasia' },
          { id: '14', name: 'Terror' },
          { id: '22', name: 'Romance' },
          { id: '24', name: 'Ficção Científica' },
          { id: '36', name: 'Slice of Life' },
          { id: '30', name: 'Esportes' },
          { id: '37', name: 'Sobrenatural' },
          { id: '41', name: 'Suspense' },
          { id: '25', name: 'Shoujo' },
          { id: '27', name: 'Shounen' },
          { id: '42', name: 'Seinen' },
          { id: '43', name: 'Josei' },
          { id: '9', name: 'Ecchi' }
        ];
        break;
      case 'books':
        genres = [
          { id: 'fiction', name: 'Ficção' },
          { id: 'fantasy', name: 'Fantasia' },
          { id: 'romance', name: 'Romance' },
          { id: 'mystery', name: 'Mistério' },
          { id: 'science', name: 'Ciência' },
          { id: 'history', name: 'História' },
          { id: 'biography', name: 'Biografia' },
          { id: 'business', name: 'Negócios' },
          { id: 'young-adult', name: 'Young Adult' },
          { id: 'children', name: 'Infantil' },
          { id: 'thriller', name: 'Suspense' },
          { id: 'horror', name: 'Terror' },
          { id: 'science-fiction', name: 'Ficção Científica' },
          { id: 'self-help', name: 'Autoajuda' }
        ];
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