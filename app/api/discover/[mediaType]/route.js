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
    const limit = 20;

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

const genreCache = new Map();
async function mapGenreIdsToNames(genreIds, type) {
  const cacheKey = `${type}-genres`;

  if (!genreCache.has(cacheKey)) {
    const genresData = await tmdbClient.getGenres(type);
    genreCache.set(cacheKey, genresData.genres);
  }

  const genres = genreCache.get(cacheKey);
  return genreIds.map(id => {
    const genre = genres.find(g => g.id === id);
    return genre ? genre.name : id.toString();
  });
}

async function discoverMovies(genre, sortBy, page, limit) {
  const sortMapping = {
    popularity: 'popularity.desc',
    newest: 'primary_release_date.desc',
    rating: 'vote_average.desc',
    most_rated: 'vote_count.desc'
  };

  const params = {
    sort_by: sortMapping[sortBy] || 'popularity.desc',
    page: page.toString(),
    'vote_count.gte': sortBy === 'rating' ? '50' : '10',
    language: 'pt-BR'
  };

  if (genre && genre !== '') {
    params.with_genres = genre;
  }

  const response = await tmdbClient.fetch('/discover/movie', params);

  // 🔥 NOVA LOGICA: Limitar resultados aos primeiros 10.000
  const rawTotalResults = response.total_results || 0;
  const totalResults = Math.min(rawTotalResults, 10000); // Limite de 10.000

  // 🔥 Calcular total de páginas baseado no limite de 10.000
  const maxPages = Math.min(Math.ceil(totalResults / limit), 500); // TMDB só permite 500 páginas

  // 🔥 Garantir que a página atual não exceda o máximo
  const safePage = Math.min(page, maxPages);

  // Se a página solicitada for maior que o máximo, buscar a última página válida
  if (page > maxPages) {
    params.page = maxPages.toString();
    const correctedResponse = await tmdbClient.fetch('/discover/movie', params);
    return {
      results: await Promise.all(correctedResponse.results.map(async (movie) => ({
        id: movie.id,
        title: movie.title,
        description: movie.overview,
        imageUrl: tmdbClient.getImageURL(movie.poster_path),
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
        releaseDate: movie.release_date,
        rating: movie.vote_average,
        ratingsCount: movie.vote_count,
        genres: await mapGenreIdsToNames(movie.genre_ids || [], 'movie')
      }))),
      total: totalResults,
      totalPages: maxPages,
      currentPage: maxPages,
      itemsPerPage: limit
    };
  }

  return {
    results: await Promise.all(response.results.map(async (movie) => ({
      id: movie.id,
      title: movie.title,
      description: movie.overview,
      imageUrl: tmdbClient.getImageURL(movie.poster_path),
      releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      ratingsCount: movie.vote_count,
      genres: await mapGenreIdsToNames(movie.genre_ids || [], 'movie')
    }))),
    total: totalResults,
    totalPages: maxPages,
    currentPage: safePage,
    itemsPerPage: limit
  };
}

async function discoverSeries(genre, sortBy, page, limit) {
  const sortMapping = {
    popularity: 'popularity.desc',
    newest: 'first_air_date.desc',
    rating: 'vote_average.desc',
    most_rated: 'vote_count.desc'
  };

  const params = {
    sort_by: sortMapping[sortBy] || 'popularity.desc',
    page: page.toString(),
    'vote_count.gte': sortBy === 'rating' ? '50' : '10',
    language: 'pt-BR'
  };

  if (genre && genre !== '') {
    params.with_genres = genre;
  }

  const response = await tmdbClient.fetch('/discover/tv', params);

  // 🔥 NOVA LOGICA: Limitar resultados aos primeiros 10.000
  const rawTotalResults = response.total_results || 0;
  const totalResults = Math.min(rawTotalResults, 10000); // Limite de 10.000

  // 🔥 Calcular total de páginas baseado no limite de 10.000
  const maxPages = Math.min(Math.ceil(totalResults / limit), 500); // TMDB só permite 500 páginas

  // 🔥 Garantir que a página atual não exceda o máximo
  const safePage = Math.min(page, maxPages);

  // Se a página solicitada for maior que o máximo, buscar a última página válida
  if (page > maxPages) {
    params.page = maxPages.toString();
    const correctedResponse = await tmdbClient.fetch('/discover/tv', params);
    return {
      results: await Promise.all(correctedResponse.results.map(async (series) => ({
        id: series.id,
        title: series.name,
        description: series.overview,
        imageUrl: tmdbClient.getImageURL(series.poster_path),
        releaseYear: series.first_air_date ? new Date(series.first_air_date).getFullYear() : undefined,
        releaseDate: series.first_air_date,
        rating: series.vote_average,
        ratingsCount: series.vote_count, // PADRÃO: ratingsCount
        genres: await mapGenreIdsToNames(series.genre_ids || [], 'tv')
      }))),
      total: totalResults,
      totalPages: maxPages,
      currentPage: maxPages,
      itemsPerPage: limit
    };
  }

  return {
    results: await Promise.all(response.results.map(async (series) => ({
      id: series.id,
      title: series.name,
      description: series.overview,
      imageUrl: tmdbClient.getImageURL(series.poster_path),
      releaseYear: series.first_air_date ? new Date(series.first_air_date).getFullYear() : undefined,
      releaseDate: series.first_air_date,
      rating: series.vote_average,
      ratingsCount: series.vote_count, // PADRÃO: ratingsCount
      genres: await mapGenreIdsToNames(series.genre_ids || [], 'tv')
    }))),
    total: totalResults,
    totalPages: maxPages,
    currentPage: safePage,
    itemsPerPage: limit
  };
}

async function discoverAnimes(genre, sortBy, page, limit) {
  const rankingMapping = {
    popularity: 'bypopularity',
    rating: 'all',
    newest: 'airing'
  };

  // Se tem gênero específico, usamos busca por gênero com paginação
  if (genre && genre !== '') {
    try {
      const offset = (page - 1) * limit; // 🔥 CALCULA OFFSET BASEADO NO LIMITE
      const response = await malClient.getAnimeByGenre(genre, page, limit, offset);

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
        total: response.paging?.total || 1000,
        totalPages: Math.ceil((response.paging?.total || 1000) / limit), // 🔥 USA LIMITE PARA CALCULAR TOTAL PÁGINAS
        currentPage: page,
        itemsPerPage: limit
      };
    } catch (error) {
      console.error('MyAnimeList genre search error:', error);
      return await discoverAnimesWithRanking(rankingMapping[sortBy] || 'bypopularity', page, limit);
    }
  }

  return await discoverAnimesWithRanking(rankingMapping[sortBy] || 'bypopularity', page, limit);
}

async function discoverAnimesWithRanking(rankingType, page, limit) {
  try {
    const offset = (page - 1) * limit;
    const response = await malClient.getAnimeRanking(rankingType, limit, offset);

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
        ratingsCount: item.node.num_scoring_users,
        popularity: item.node.popularity,
        episodes: item.node.num_episodes,
        status: item.node.status,
        mediaType: item.node.media_type,
        members: item.node.num_list_users,
        genres: item.node.genres?.map(g => ({ id: g.id, name: g.name })) || []
      })),
      total: estimatedTotal,
      totalPages: Math.ceil(estimatedTotal / limit), // 🔥 USA LIMITE PARA CALCULAR TOTAL PÁGINAS
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
    if (genre && genre !== '') {
      const offset = (page - 1) * limit; // 🔥 CALCULA OFFSET BASEADO NO LIMITE
      const response = await malClient.getMangaByGenre(genre, page, limit, offset);
      return {
        results: response.data.map(item => ({
          ...malClient.formatMangaData(item.node),
          ratingsCount: item.node.num_scoring_users || Math.floor((item.node.num_list_users || 0) * 0.6)
        })),
        total: response.paging?.total || 1000,
        totalPages: Math.ceil((response.paging?.total || 1000) / limit), // 🔥 USA LIMITE PARA CALCULAR TOTAL PÁGINAS
        currentPage: page,
        itemsPerPage: limit
      };
    }

    const offset = (page - 1) * limit;
    const response = await malClient.getMangaRanking(rankingMapping[sortBy], limit, offset);

    const estimatedTotal = Math.min(1000, response.paging?.total || 1000);

    return {
      results: response.data.map(item => ({
        ...malClient.formatMangaData(item.node),
        ratingsCount: item.node.num_scoring_users || Math.floor((item.node.num_list_users || 0) * 0.6)
      })),
      total: estimatedTotal,
      totalPages: Math.ceil(estimatedTotal / limit), // 🔥 USA LIMITE PARA CALCULAR TOTAL PÁGINAS
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

  if (genre && genre !== '') {
    params.genres = genre;
  }

  const response = await rawgClient.fetch('/games', params);

  const totalPages = Math.ceil(response.count / limit);

  return {
    results: response.results.map(game => ({
      id: game.id,
      title: game.name,
      description: game.description_raw || game.description,
      imageUrl: rawgClient.getImageURL(game.background_image),
      releaseYear: game.released ? new Date(game.released).getFullYear() : undefined,
      releaseDate: game.released,
      rating: game.rating,
      ratingsCount: game.ratings_count,
      metacritic: game.metacritic,
      playtime: game.playtime,
      platforms: game.platforms?.map(p => p.platform.name) || [],
      genres: game.genres?.map(g => g.name) || []
    })),
    total: response.count,
    totalPages: totalPages, // 🔥 ADICIONAR totalPages
    currentPage: page,
    itemsPerPage: limit
  };
}

async function discoverBooks(genre, sortBy, page, limit) {
  try {
    const orderBy = sortBy === 'newest' ? 'newest' : 'relevance';

    let query = '';
    if (genre && genre !== '') {
      const cleanGenre = genre.replace(/[^\w\s]/gi, '').trim();
      query = `subject:"${cleanGenre}"`; // Aspas para busca exata
    } else {
      query = 'subject:fiction'; // Busca por ficção geral
    }

    const safeLimit = Math.min(limit, 40);
    const startIndex = (page - 1) * safeLimit;

    const response = await googleBooksClient.fetch('/volumes', {
      q: query,
      orderBy: orderBy,
      maxResults: safeLimit.toString(),
      startIndex: startIndex.toString(),
      langRestrict: 'pt',
      printType: 'books' // Garantir que só retorne livros
    });

    if (!response.items || response.items.length === 0) {
      const alternativeQuery = genre && genre !== '' ?
        `"${genre}"` : // Busca geral pelo termo do gênero
        'subject:fiction'; // Fallback padrão

      const alternativeResponse = await googleBooksClient.fetch('/volumes', {
        q: alternativeQuery,
        orderBy: orderBy,
        maxResults: safeLimit.toString(),
        startIndex: startIndex.toString(),
        langRestrict: 'pt',
        printType: 'books'
      });

      return formatBooksResponse(alternativeResponse, page, safeLimit);
    }

    return formatBooksResponse(response, page, safeLimit);

  } catch (error) {
    console.error('Google Books discovery error:', error);

    return {
      results: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
      itemsPerPage: limit,
      error: error.message
    };
  }
}

function formatBooksResponse(response, page, limit) {
  const results = response.items?.map(item => {
    const volumeInfo = item.volumeInfo || {};

    return {
      id: item.id,
      title: volumeInfo.title || 'Título não disponível',
      description: volumeInfo.description || 'Descrição não disponível',
      imageUrl: googleBooksClient.getImageURL(volumeInfo.imageLinks),
      releaseYear: volumeInfo.publishedDate ?
        new Date(volumeInfo.publishedDate).getFullYear() : undefined,
      releaseDate: volumeInfo.publishedDate,
      rating: volumeInfo.averageRating || 0,
      ratingsCount: volumeInfo.ratingsCount || 0,
      authors: volumeInfo.authors || ['Autor desconhecido'],
      pageCount: volumeInfo.pageCount,
      publisher: volumeInfo.publisher || 'Editora não informada',
      categories: volumeInfo.categories || []
    };
  }) || [];

  const totalItems = response.totalItems || 0;

  return {
    results: results,
    total: totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    itemsPerPage: limit
  };
}