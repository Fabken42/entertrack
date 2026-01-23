// /entertrack/app/api/discover/[mediaType]/route.js
import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/api/tmdb';
import { jikanClient } from '@/lib/api/jikan';
import { rawgClient } from '@/lib/api/rawg';
import { FETCH_MEDIA_ITEMS_LIMIT } from '@/constants';

export async function GET(request, { params }) {
  try {
    const { mediaType } = await params;
    const { searchParams } = new URL(request.url);

    const genre = searchParams.get('genre');
    const sortBy = searchParams.get('sortBy') || 'popularity';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(FETCH_MEDIA_ITEMS_LIMIT);
    const query = searchParams.get('query') || '';

    let results;

    switch (mediaType) {
      case 'movie':
        results = await discoverMovies(genre, sortBy, page, limit, query);
        break;
      case 'series':
        results = await discoverSeries(genre, sortBy, page, limit, query);
        break;
      case 'anime':
        results = await discoverAnimes(genre, sortBy, page, limit, query);
        break;
      case 'game':
        results = await discoverGames(genre, sortBy, page, limit, query);
        break;
      case 'manga':
        results = await discoverMangas(genre, sortBy, page, limit, query);
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

async function discoverMovies(genre, sortBy, page, limit, query = '') {
  const sortMapping = {
    popularity: 'popularity.desc',
    newest: 'primary_release_date.desc',
    rating: 'vote_average.desc',
    most_rated: 'vote_count.desc'
  };

  // Função auxiliar para buscar detalhes completos do filme incluindo runtime
  async function getMovieDetails(movie) {
    try {
      // Busca detalhes completos do filme
      const movieDetails = await tmdbClient.fetch(`/movie/${movie.id}`, {
        language: 'pt-BR'
      });

      return {
        id: movie.id,
        title: movie.title,
        description: movie.overview,
        coverImage: tmdbClient.getImageURL(movie.poster_path),
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
        rating: movie.vote_average,
        ratingCount: movie.vote_count,
        runtime: movieDetails.runtime || 0, // Adiciona o runtime aqui
        genres: await mapGenreIdsToNames(movie.genre_ids || [], 'movie')
      };
    } catch (error) {
      console.error(`Erro ao buscar detalhes do filme ${movie.id}:`, error);
      // Retorna os dados básicos se falhar
      return {
        id: movie.id,
        title: movie.title,
        description: movie.overview,
        coverImage: tmdbClient.getImageURL(movie.poster_path),
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
        rating: movie.vote_average,
        ratingCount: movie.vote_count,
        runtime: 0, // Runtime padrão em caso de erro
        genres: await mapGenreIdsToNames(movie.genre_ids || [], 'movie')
      };
    }
  }

  if (query && query.trim() !== '') {
    try {
      const response = await tmdbClient.searchMovies(query, page);

      const rawTotalResults = response.total_results || 0;
      const totalResults = Math.min(rawTotalResults, FETCH_MEDIA_ITEMS_LIMIT);
      const maxPages = Math.min(Math.ceil(totalResults / limit), 500);
      const safePage = Math.min(page, maxPages);

      // Se a página solicitada for maior que o máximo
      if (page > maxPages) {
        const correctedResponse = await tmdbClient.searchMovies(query, maxPages);
        return {
          results: await Promise.all(correctedResponse.results.map(getMovieDetails)),
          total: totalResults,
          totalPages: maxPages,
          currentPage: maxPages,
          itemsPerPage: limit
        };
      }

      return {
        results: await Promise.all(response.results.map(getMovieDetails)),
        total: totalResults,
        totalPages: maxPages,
        currentPage: safePage,
        itemsPerPage: limit
      };
    } catch (error) {
      console.error('TMDB search error:', error);
    }
  }

  // 🔥 CÓDIGO ORIGINAL PARA DISCOVER (sem query)
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

  const rawTotalResults = response.total_results || 0;
  const totalResults = Math.min(rawTotalResults, 10000);
  const maxPages = Math.min(Math.ceil(totalResults / limit), 500);
  const safePage = Math.min(page, maxPages);

  if (page > maxPages) {
    params.page = maxPages.toString();
    const correctedResponse = await tmdbClient.fetch('/discover/movie', params);
    return {
      results: await Promise.all(correctedResponse.results.map(getMovieDetails)),
      total: totalResults,
      totalPages: maxPages,
      currentPage: maxPages,
      itemsPerPage: limit
    };
  }

  return {
    results: await Promise.all(response.results.map(getMovieDetails)),
    total: totalResults,
    totalPages: maxPages,
    currentPage: safePage,
    itemsPerPage: limit
  };
}

async function discoverSeries(genre, sortBy, page, limit, query = '') {
  const sortMapping = {
    popularity: 'popularity.desc',
    newest: 'first_air_date.desc',
    rating: 'vote_average.desc',
    most_rated: 'vote_count.desc'
  };

  // 🔥 NOVO: Se houver query, usar search em vez de discover
  if (query && query.trim() !== '') {
    try {
      const response = await tmdbClient.searchTVShows(query, page);

      const rawTotalResults = response.total_results || 0;
      const totalResults = Math.min(rawTotalResults, FETCH_MEDIA_ITEMS_LIMIT);
      const maxPages = Math.min(Math.ceil(totalResults / limit), 500);
      const safePage = Math.min(page, maxPages);

      // Se a página solicitada for maior que o máximo
      if (page > maxPages) {
        const correctedResponse = await tmdbClient.searchTVShows(query, maxPages);
        return {
          results: await Promise.all(correctedResponse.results.map(async (series) => ({
            id: series.id,
            title: series.name,
            description: series.overview,
            coverImage: tmdbClient.getImageURL(series.poster_path),
            releaseYear: series.first_air_date ? new Date(series.first_air_date).getFullYear() : undefined,
            rating: series.vote_average,
            ratingCount: series.vote_count,
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
          coverImage: tmdbClient.getImageURL(series.poster_path),
          releaseYear: series.first_air_date ? new Date(series.first_air_date).getFullYear() : undefined,
          rating: series.vote_average,
          ratingCount: series.vote_count,
          genres: await mapGenreIdsToNames(series.genre_ids || [], 'tv')
        }))),
        total: totalResults,
        totalPages: maxPages,
        currentPage: safePage,
        itemsPerPage: limit
      };
    } catch (error) {
      console.error('TMDB search error:', error);
      // Fallback para discover se a busca falhar
    }
  }

  // 🔥 CÓDIGO ORIGINAL PARA DISCOVER (sem query)
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

  const rawTotalResults = response.total_results || 0;
  const totalResults = Math.min(rawTotalResults, 10000);
  const maxPages = Math.min(Math.ceil(totalResults / limit), 500);
  const safePage = Math.min(page, maxPages);

  if (page > maxPages) {
    params.page = maxPages.toString();
    const correctedResponse = await tmdbClient.fetch('/discover/tv', params);
    return {
      results: await Promise.all(correctedResponse.results.map(async (series) => ({
        id: series.id,
        title: series.name,
        description: series.overview,
        coverImage: tmdbClient.getImageURL(series.poster_path),
        releaseYear: series.first_air_date ? new Date(series.first_air_date).getFullYear() : undefined,
        rating: series.vote_average,
        ratingCount: series.vote_count,
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
      coverImage: tmdbClient.getImageURL(series.poster_path),
      releaseYear: series.first_air_date ? new Date(series.first_air_date).getFullYear() : undefined,
      rating: series.vote_average,
      ratingCount: series.vote_count,
      genres: await mapGenreIdsToNames(series.genre_ids || [], 'tv')
    }))),
    total: totalResults,
    totalPages: maxPages,
    currentPage: safePage,
    itemsPerPage: limit
  };
}

async function discoverAnimes(genre, sortBy, page, limit, query = '') {
  try {
    if (query && query.trim() !== '') {
      const response = await jikanClient.searchAnime(query, page, limit);

      if (!response.data) {
        throw new Error('No data in Jikan search response');
      }

      return processAnimeResults(response.data, response.pagination, page, limit);
    }

    if (!genre || genre === '') {
      // Usar getAllAnimeSorted que NÃO envia parâmetro genres
      const response = await jikanClient.getAllAnimeSorted(sortBy, page, limit);

      if (!response.data) {
        throw new Error('No data in Jikan getAllAnimeSorted response');
      }

      return processAnimeResults(response.data, response.pagination, page, limit);
    }

    // COM GÊNERO ESPECÍFICO
    const response = await jikanClient.getAnimeByGenreSorted(genre, sortBy, page, limit);

    if (!response.data) {
      throw new Error('No data in Jikan genre response');
    }
    return processAnimeResults(response.data, response.pagination, page, limit);

  } catch (error) {
    console.error('Jikan API error in discoverAnimes:', error);
    console.error('Error stack:', error.stack);

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

function processAnimeResults(data, pagination, page, limit) {
  const seenIds = new Set();
  const duplicateCount = { count: 0, ids: [] };

  const filteredResults = data
    .map(item => ({
      id: item.mal_id,
      title: item.title,
      description: item.synopsis || '*Sem descrição disponível*',
      coverImage: jikanClient.getImageURL(item.images),
      releaseYear: new Date(item.aired.from).getFullYear() || null,
      rating: item.score || null,
      ratingCount: item.scored_by || null,
      apiRating: item.score || null,
      apiVoteCount: item.scored_by || null,
      popularity: item.popularity || null,
      studios: item.studios?.map(studio => studio.name) || [],
      episodes: item.episodes || null,
      status: item.status || 'Unknown',
      category: item.type || 'TV',
      members: item.members || null,
      genres: item.genres?.map(g => ({
        id: g.mal_id?.toString(),
        name: g.name
      })) || []
    }))
    .filter(item => {
      if (seenIds.has(item.id)) {
        console.warn(`⚠️ Duplicate anime ID: ${item.id} - ${item.title}`);
        duplicateCount.count++;
        duplicateCount.ids.push(item.id);
        return false;
      }
      seenIds.add(item.id);
      return true;
    });

  if (duplicateCount.count > 0) {
    console.warn(`⚠️ Removed ${duplicateCount.count} duplicate anime(s):`, duplicateCount.ids);
  }

  return {
    results: filteredResults,
    total: pagination?.items?.total || filteredResults.length,
    totalPages: pagination?.last_visible_page || 1,
    currentPage: page,
    itemsPerPage: limit
  };
}

async function discoverMangas(genre, sortBy, page, limit, query = '') {
  try {
    // Se houver query, usar search
    if (query && query.trim() !== '') {
      const response = await jikanClient.searchManga(query, page, limit);

      if (!response.data) {
        throw new Error('No data in Jikan manga search response');
      }

      return processMangaResults(response.data, response.pagination, page, limit);
    }

    if (!genre || genre === '') {
      const response = await jikanClient.getAllMangaSorted(sortBy, page, limit);

      if (!response.data) {
        throw new Error('No data in Jikan getAllMangaSorted response');
      }

      return processMangaResults(response.data, response.pagination, page, limit);
    }
    const response = await jikanClient.getMangaByGenreSorted(genre, sortBy, page, limit);

    if (!response.data) {
      throw new Error('No data in Jikan manga genre response');
    }

    return processMangaResults(response.data, response.pagination, page, limit);

  } catch (error) {
    console.error('Jikan API error in discoverMangas:', error);
    console.error('Error stack:', error.stack);

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

function processMangaResults(data, pagination, page, limit) {
  const seenIds = new Set();
  const duplicateCount = { count: 0, ids: [] };

  const filteredResults = data
    .map(item => ({
      id: item.mal_id,
      title: item.title,
      description: item.synopsis || '*Sem descrição disponível*',
      coverImage: jikanClient.getImageURL(item.images),
      releaseYear: item.published?.from ? new Date(item.published.from).getFullYear() : item.year,
      rating: item.score || null,
      ratingCount: item.scored_by || null,
      apiRating: item.score || null,
      apiVoteCount: item.scored_by || null,
      popularity: item.popularity || null,
      volumes: item.volumes || null,
      chapters: item.chapters || null,
      status: item.status || 'Unknown',
      category: item.type || 'Manga',
      members: item.members || null,
      genres: item.genres?.map(g => ({
        id: g.mal_id?.toString(),
        name: g.name
      })) || [],
      authors: item.authors?.map(author => author.name) || []
    }))
    .filter(item => {
      if (seenIds.has(item.id)) {
        console.warn(`⚠️ Duplicate manga ID: ${item.id} - ${item.title}`);
        duplicateCount.count++;
        duplicateCount.ids.push(item.id);
        return false;
      }
      seenIds.add(item.id);
      return true;
    });

  if (duplicateCount.count > 0) {
    console.warn(`⚠️ Removed ${duplicateCount.count} duplicate manga(s):`, duplicateCount.ids);
  }

  return {
    results: filteredResults,
    total: pagination?.items?.total || filteredResults.length,
    totalPages: pagination?.last_visible_page || 1,
    currentPage: page,
    itemsPerPage: limit
  };
}

async function discoverGames(genre, sortBy, page, limit, query = '') {
  const sortMapping = {
    popularity: '-added',
    newest: '-released',
    rating: '-rating'
  };

  const params = {
    ordering: sortMapping[sortBy] || '-added',
    page: page.toString(),
    page_size: limit.toString(),
  };

  if (genre && genre !== '') {
    params.genres = genre;
  }

  // 🔥 NOVO: Se houver query, usar search
  if (query && query.trim() !== '') {
    params.search = query;
  }

  const response = await rawgClient.fetch('/games', params);

  const totalPages = Math.ceil(response.count / limit);

  return {
    results: response.results.map(game => ({
      id: game.id,
      title: game.name,
      coverImage: rawgClient.getImageURL(game.background_image),
      releaseYear: game.released ? new Date(game.released).getFullYear() : undefined,
      rating: game.rating,
      ratingCount: game.ratings_count,
      metacritic: game.metacritic,
      platforms: game.platforms?.map(p => p.platform.name) || [],
      genres: game.genres?.map(g => g.name) || []
    })),
    total: response.count,
    totalPages: totalPages,
    currentPage: page,
    itemsPerPage: limit
  };
}