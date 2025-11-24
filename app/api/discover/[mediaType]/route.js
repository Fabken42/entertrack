// /entertrack/app/api/discover/[mediaType]/route.js

import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/api/tmdb';
import { malClient } from '@/lib/api/myanimelist';
import { rawgClient } from '@/lib/api/rawg';
import { googleBooksClient } from '@/lib/api/google-books';

export async function GET(request, { params }) {
  try {
    const { mediaType } = await params;
    const { searchParams } = new URL(request.url);

    const genre = searchParams.get('genre');

    const sortBy = searchParams.get('sortBy') || 'popularity';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let results;

    switch (mediaType) {
      case 'movies':
        results = await discoverMovies(genre, sortBy, page, limit);
        break;
      case 'series':
        results = await discoverSeries(genre, sortBy, page, limit);
        break;
      case 'animes':
        results = await discoverAnimes(genre, sortBy, page, limit);
        break;
      case 'games':
        results = await discoverGames(genre, sortBy, page, limit);
        break;
      case 'books':
        results = await discoverBooks(genre, sortBy, page, limit);
        break;
      case 'mangas':
        results = await discoverMangas(genre, sortBy, page, limit);
        break;
      default:
        return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Discover API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discovery data' },
      { status: 500 }
    );
  }
}

// TMDB - Filmes
async function discoverMovies(genre, sortBy, page, limit) {
  const sortMapping = {
    popularity: 'popularity.desc',
    newest: 'primary_release_date.desc', // Corrigido para filmes
    rating: 'vote_average.desc'
  };

  const params = {
    sort_by: sortMapping[sortBy] || 'popularity.desc',
    page: page.toString(),
    'vote_count.gte': '10', // Mínimo de votos para qualidade
    language: 'pt-BR'
  };

  // Adicionar filtro de gênero se especificado
  if (genre && genre !== '') {
    params.with_genres = genre;
  }

  const response = await tmdbClient.fetch('/discover/movie', params);

  return {
    results: response.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      description: movie.overview,
      imageUrl: tmdbClient.getImageURL(movie.poster_path),
      releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      genres: movie.genre_ids // IDs dos gêneros para referência
    })),
    totalPages: response.total_pages,
    totalResults: response.total_results
  };
}

// TMDB - Séries
async function discoverSeries(genre, sortBy, page, limit) {
  const sortMapping = {
    popularity: 'popularity.desc',
    newest: 'first_air_date.desc', // Corrigido para séries
    rating: 'vote_average.desc'
  };

  const params = {
    sort_by: sortMapping[sortBy] || 'popularity.desc',
    page: page.toString(),
    'vote_count.gte': '10',
    language: 'pt-BR'
  };

  if (genre && genre !== '') {
    params.with_genres = genre;
  }

  const response = await tmdbClient.fetch('/discover/tv', params);

  return {
    results: response.results.map(series => ({
      id: series.id,
      title: series.name,
      description: series.overview,
      imageUrl: tmdbClient.getImageURL(series.poster_path),
      releaseYear: series.first_air_date ? new Date(series.first_air_date).getFullYear() : undefined,
      releaseDate: series.first_air_date,
      rating: series.vote_average,
      voteCount: series.vote_count,
      popularity: series.popularity
    })),
    totalPages: response.total_pages,
    totalResults: response.total_results
  };
}

async function discoverAnimes(genre, sortBy, page, limit) {
  console.log('=== MAL DISCOVER DEBUG ===');
  console.log('Genre:', genre);
  console.log('SortBy:', sortBy);
  console.log('Page:', page);
  console.log('Limit:', limit);

  const rankingMapping = {
    popularity: 'bypopularity',
    rating: 'all',
    newest: 'airing'
  };

  // Se tem gênero específico, usamos busca por gênero com paginação
  if (genre && genre !== '') {
    try {
      console.log('Using genre-specific search with page parameter');

      const response = await malClient.getAnimeByGenre(genre, page, limit);

      console.log('Genre search results:', response.data?.length || 0);

      return {
        results: response.data.map(item => ({
          id: item.node.id,
          title: item.node.title,
          description: item.node.synopsis,
          imageUrl: malClient.getImageURL(item.node.main_picture),
          releaseYear: item.node.start_date ? new Date(item.node.start_date).getFullYear() : undefined,
          releaseDate: item.node.start_date,
          rating: item.node.mean,
          rank: item.node.rank,
          popularity: item.node.popularity,
          episodes: item.node.num_episodes,
          status: item.node.status,
          mediaType: item.node.media_type,
          members: item.node.num_list_users,
          genres: item.node.genres?.map(g => ({ id: g.id, name: g.name })) || []
        })),
        total: response.paging?.total || 1000, // A API não sempre retorna total exato
        totalPages: Math.ceil(1000 / limit), // Estimativa conservadora
        currentPage: page,
        itemsPerPage: limit
      };
    } catch (error) {
      console.error('MyAnimeList genre search error:', error);

      // Fallback: usar ranking geral
      console.log('Falling back to ranking due to genre search error');
      return await discoverAnimesWithRanking(rankingMapping[sortBy] || 'bypopularity', page, limit);
    }
  }

  // Sem gênero específico, usa ranking geral com offset
  console.log('No genre specified, using ranking with offset');
  return await discoverAnimesWithRanking(rankingMapping[sortBy] || 'bypopularity', page, limit);
}

async function discoverAnimesWithRanking(rankingType, page, limit) {
  try {
    const offset = (page - 1) * limit;

    console.log('MAL Ranking Search - Type:', rankingType, 'Page:', page, 'Limit:', limit, 'Offset:', offset);

    const response = await malClient.getAnimeRanking(rankingType, limit, offset);

    console.log('MAL Ranking Response - Total items:', response.data?.length || 0);

    // Para ranking, a API MAL retorna até 500-1000 animes no total
    const estimatedTotal = Math.min(1000, response.paging?.total || 1000);

    return {
      results: response.data.map(item => ({
        id: item.node.id,
        title: item.node.title,
        description: item.node.synopsis,
        imageUrl: malClient.getImageURL(item.node.main_picture),
        releaseYear: item.node.start_date ? new Date(item.node.start_date).getFullYear() : undefined,
        releaseDate: item.node.start_date,
        rating: item.node.mean,
        rank: item.node.rank,
        popularity: item.node.popularity,
        episodes: item.node.num_episodes,
        status: item.node.status,
        mediaType: item.node.media_type,
        members: item.node.num_list_users,
        genres: item.node.genres?.map(g => ({ id: g.id, name: g.name })) || []
      })),
      total: estimatedTotal,
      totalPages: Math.ceil(estimatedTotal / limit),
      currentPage: page,
      itemsPerPage: limit
    };
  } catch (error) {
    console.error('MyAnimeList ranking error:', error);
    return {
      results: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
      itemsPerPage: limit
    };
  }
}

async function discoverMangas(genre, sortBy, page, limit) {
  const rankingMapping = {
    popularity: 'bypopularity',
    rating: 'all',
    newest: 'all'
  };

  try {
    // Busca por gênero
    if (genre && genre !== '') {
      const response = await malClient.getMangaByGenre(genre, page, limit);
      return {
        results: response.data.map(item => malClient.formatMangaData(item.node)),
        total: response.paging?.total || 1000,
        totalPages: Math.ceil(1000 / limit),
        currentPage: page,
        itemsPerPage: limit
      };
    }

    // Ranking geral
    const offset = (page - 1) * limit;
    const response = await malClient.getMangaRanking(rankingMapping[sortBy], limit, offset);

    const estimatedTotal = Math.min(1000, response.paging?.total || 1000);

    return {
      results: response.data.map(item => malClient.formatMangaData(item.node)),
      total: estimatedTotal,
      totalPages: Math.ceil(estimatedTotal / limit),
      currentPage: page,
      itemsPerPage: limit
    };
  } catch (error) {
    console.error('Manga discovery error:', error);
    return {
      results: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
      itemsPerPage: limit
    };
  }
}

// RAWG - Jogos
async function discoverGames(genre, sortBy, page, limit) {
  const sortMapping = {
    popularity: '-added',
    newest: '-released',
    rating: '-rating'
  };

  const params = {
    ordering: sortMapping[sortBy] || '-added',
    page: page.toString(),
    page_size: limit.toString()
  };

  // Adicionar filtro de gênero se especificado
  if (genre && genre !== '') {
    params.genres = genre;
  }

  const response = await rawgClient.fetch('/games', params);

  return {
    results: response.results.map(game => ({
      id: game.id,
      title: game.name,
      description: game.description_raw || game.description,
      imageUrl: rawgClient.getImageURL(game.background_image),
      releaseYear: game.released ? new Date(game.released).getFullYear() : undefined,
      releaseDate: game.released,
      rating: game.rating,
      ratingTop: game.rating_top,
      ratingsCount: game.ratings_count,
      metacritic: game.metacritic,
      playtime: game.playtime,
      platforms: game.platforms?.map(p => p.platform.name) || [],
      genres: game.genres?.map(g => g.name) || []
    })),
    total: response.count
  };
}

// Google Books - Livros
async function discoverBooks(genre, sortBy, page, limit) {
  const orderBy = sortBy === 'newest' ? 'newest' : 'relevance';

  // Construir query base
  let query = '';
  if (genre && genre !== '') {
    query = `subject:${genre}`;
  } else {
    // Query padrão para livros populares
    query = 'bestseller';
  }

  const response = await googleBooksClient.fetch('/volumes', {
    q: query,
    orderBy: orderBy,
    maxResults: limit.toString(),
    startIndex: ((page - 1) * limit).toString(),
    langRestrict: 'pt' // Priorizar livros em português
  });

  return {
    results: response.items?.map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      description: item.volumeInfo.description,
      imageUrl: googleBooksClient.getImageURL(item.volumeInfo.imageLinks),
      releaseYear: item.volumeInfo.publishedDate ? new Date(item.volumeInfo.publishedDate).getFullYear() : undefined,
      releaseDate: item.volumeInfo.publishedDate,
      rating: item.volumeInfo.averageRating,
      ratingsCount: item.volumeInfo.ratingsCount,
      authors: item.volumeInfo.authors || [],
      pageCount: item.volumeInfo.pageCount,
      publisher: item.volumeInfo.publisher,
      categories: item.volumeInfo.categories || []
    })) || [],
    total: response.totalItems || 0
  };
}