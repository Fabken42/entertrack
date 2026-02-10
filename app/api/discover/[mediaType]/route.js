// /entertrack/app/api/discover/[mediaType]/route.js
import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/api/tmdb';
import { jikanClient } from '@/lib/api/jikan';
import { rawgClient } from '@/lib/api/rawg';
import { FETCH_MEDIA_ITEMS_LIMIT } from '@/constants';

// Constante para limitar o número máximo de páginas
const MAX_PAGES = 500;

export async function GET(request, { params }) {
  try {
    const { mediaType } = await params;
    const { searchParams } = new URL(request.url);

    const genre = searchParams.get('genre');
    const sortBy = searchParams.get('sortBy') || 'popularity';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(FETCH_MEDIA_ITEMS_LIMIT);
    const query = searchParams.get('query') || '';

    const minRating = searchParams.get('minRating');
    const minVotes = searchParams.get('minVotes');
    const minScore = searchParams.get('minScore');
    const minMetacritic = searchParams.get('minMetacritic');

    const seasonYear = searchParams.get('seasonYear');
    const season = searchParams.get('season');
    const searchMode = searchParams.get('searchMode') || 'discover';

    let results;

    switch (mediaType) {
      case 'movie':
        // ✅ Passe minRating e minVotes
        results = await discoverMovies(genre, sortBy, page, limit, query, minRating * 2, minVotes);
        break;
      case 'series':
        // ✅ Passe minRating e minVotes
        results = await discoverSeries(genre, sortBy, page, limit, query, minRating * 2, minVotes);
        break;
      case 'anime':
        if (searchMode === 'season' && seasonYear && season) {
          // ✅ Passe minScore para seasonal também
          results = await discoverSeasonalAnimes(seasonYear, season, sortBy, page, limit, minScore * 2, genre);
        } else {
          // ✅ Já está passando minScore
          results = await discoverAnimes(genre, sortBy, page, limit, query, minScore * 2);
        }
        break;
      case 'game':
        // ✅ Passe minMetacritic
        results = await discoverGames(genre, sortBy, page, limit, query, minMetacritic);
        break;
      case 'manga':
        // ✅ Passe minScore (verifique se a função recebe este parâmetro)
        results = await discoverMangas(genre, sortBy, page, limit, query, minScore * 2);
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

async function discoverMovies(genre, sortBy, page, limit, query = '', minRating = null, minVotes = null) {
  const sortMapping = {
    popularity: 'popularity.desc',
    newest: 'primary_release_date.desc',
    rating: 'vote_average.desc',
    most_rated: 'vote_count.desc'
  };

  if (query && query.trim() !== '') {
    try {
      const response = await tmdbClient.searchMovies(query, page);

      const rawTotalResults = response.total_results || 0;
      const totalResults = Math.min(rawTotalResults, FETCH_MEDIA_ITEMS_LIMIT);
      const maxPages = Math.min(Math.ceil(totalResults / limit), MAX_PAGES);
      const safePage = Math.min(page, maxPages);

      if (page > maxPages) {
        const correctedResponse = await tmdbClient.searchMovies(query, maxPages);
        return {
          results: await Promise.all(correctedResponse.results.map(movie =>
            tmdbClient.formatMovieData(movie, true)
          )),
          total: totalResults,
          totalPages: maxPages,
          currentPage: maxPages,
          itemsPerPage: limit
        };
      }

      return {
        results: await Promise.all(response.results.map(movie =>
          tmdbClient.formatMovieData(movie, true)
        )),
        total: totalResults,
        totalPages: maxPages,
        currentPage: safePage,
        itemsPerPage: limit
      };
    } catch (error) {
      console.error('TMDB search error:', error);
    }
  }

  const params = {
    sort_by: sortMapping[sortBy] || 'popularity.desc',
    page: page.toString(),
    language: 'pt-BR'
  };

  // 🔥 ADICIONE FILTRO DE NOTA MÍNIMA
  if (minRating !== null && minRating !== '') {
    params['vote_average.gte'] = parseFloat(minRating);
  }

  // 🔥 ADICIONE FILTRO DE AVALIAÇÕES MÍNIMAS
  if (minVotes !== null && minVotes !== '') {
    params['vote_count.gte'] = parseInt(minVotes);
  } else {
    // Valor padrão baseado no tipo de ordenação
    params['vote_count.gte'] = sortBy === 'rating' ? '50' : '10';
  }

  if (genre && genre !== '') {
    params.with_genres = genre;
  }

  const response = await tmdbClient.fetch('/discover/movie', params);

  const rawTotalResults = response.total_results || 0;
  const totalResults = Math.min(rawTotalResults, 10000);
  const maxPages = Math.min(Math.ceil(totalResults / limit), MAX_PAGES);
  const safePage = Math.min(page, maxPages);

  if (page > maxPages) {
    params.page = maxPages.toString();
    const correctedResponse = await tmdbClient.fetch('/discover/movie', params);
    return {
      results: await Promise.all(correctedResponse.results.map(movie =>
        tmdbClient.formatMovieData(movie, true)
      )),
      total: totalResults,
      totalPages: maxPages,
      currentPage: maxPages,
      itemsPerPage: limit
    };
  }

  return {
    results: await Promise.all(response.results.map(movie =>
      tmdbClient.formatMovieData(movie, true)
    )),
    total: totalResults,
    totalPages: maxPages,
    currentPage: safePage,
    itemsPerPage: limit
  };
}

async function discoverSeries(genre, sortBy, page, limit, query = '', minRating = null, minVotes = null) {
  const sortMapping = {
    popularity: 'popularity.desc',
    newest: 'first_air_date.desc',
    rating: 'vote_average.desc',
    most_rated: 'vote_count.desc'
  };

  if (query && query.trim() !== '') {
    try {
      const response = await tmdbClient.searchTVShows(query, page);

      const rawTotalResults = response.total_results || 0;
      const totalResults = Math.min(rawTotalResults, FETCH_MEDIA_ITEMS_LIMIT);
      const maxPages = Math.min(Math.ceil(totalResults / limit), MAX_PAGES);
      const safePage = Math.min(page, maxPages);

      if (page > maxPages) {
        const correctedResponse = await tmdbClient.searchTVShows(query, maxPages);
        return {
          results: await Promise.all(correctedResponse.results.map(series =>
            tmdbClient.formatSeriesData(series)
          )),
          total: totalResults,
          totalPages: maxPages,
          currentPage: maxPages,
          itemsPerPage: limit
        };
      }

      return {
        results: await Promise.all(response.results.map(series =>
          tmdbClient.formatSeriesData(series)
        )),
        total: totalResults,
        totalPages: maxPages,
        currentPage: safePage,
        itemsPerPage: limit
      };
    } catch (error) {
      console.error('TMDB search error:', error);
    }
  }

  const params = {
    sort_by: sortMapping[sortBy] || 'popularity.desc',
    page: page.toString(),
    language: 'pt-BR'
  };

  // 🔥 ADICIONE FILTRO DE NOTA MÍNIMA
  if (minRating !== null && minRating !== '') {
    params['vote_average.gte'] = parseFloat(minRating);
  }

  // 🔥 ADICIONE FILTRO DE AVALIAÇÕES MÍNIMAS
  if (minVotes !== null && minVotes !== '') {
    params['vote_count.gte'] = parseInt(minVotes);
  } else {
    params['vote_count.gte'] = sortBy === 'rating' ? '50' : '10';
  }

  if (genre && genre !== '') {
    params.with_genres = genre;
  }

  const response = await tmdbClient.fetch('/discover/tv', params);

  const rawTotalResults = response.total_results || 0;
  const totalResults = Math.min(rawTotalResults, 10000);
  const maxPages = Math.min(Math.ceil(totalResults / limit), MAX_PAGES);
  const safePage = Math.min(page, maxPages);

  if (page > maxPages) {
    params.page = maxPages.toString();
    const correctedResponse = await tmdbClient.fetch('/discover/tv', params);
    return {
      results: await Promise.all(correctedResponse.results.map(series =>
        tmdbClient.formatSeriesData(series)
      )),
      total: totalResults,
      totalPages: maxPages,
      currentPage: maxPages,
      itemsPerPage: limit
    };
  }

  return {
    results: await Promise.all(response.results.map(series =>
      tmdbClient.formatSeriesData(series)
    )),
    total: totalResults,
    totalPages: maxPages,
    currentPage: safePage,
    itemsPerPage: limit
  };
}

async function discoverSeasonalAnimes(year, season, sortBy = 'popularity', page = 1, limit = 20, minScore = null, genre = null) {
  try {
    // Mapear sortBy para parâmetros do Jikan
    const orderMap = {
      'popularity': 'popularity',
      'rating': 'score',
      'newest': 'start_date'
    };

    const filters = {
      ...(minScore && { minScore: parseFloat(minScore) }),
      ...(genre && genre !== '' && { genres: genre }),
      orderBy: orderMap[sortBy] || 'popularity',
      sort: sortBy === 'popularity' ? 'asc' : 'desc'
    };

    const response = await jikanClient.getSeasonalAnime(year, season, page, limit, filters);

    if (!response.data) {
      throw new Error('No data in Jikan seasonal response');
    }

    return processAnimeResults(response.data, response.pagination, page, limit);

  } catch (error) {
    console.error('Jikan API error in discoverSeasonalAnimes:', error);
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

async function discoverAnimes(genre, sortBy, page, limit, query = '', minScore = null) {
  try {
    let response;

    if (query && query.trim() !== '') {
      response = await jikanClient.searchAnime(query, page, limit);
    } else if (!genre || genre === '') {
      // 🔥 PASSE O minScore PARA O MÉTODO
      response = await jikanClient.getAllAnimeSorted(sortBy, page, limit, minScore);
    } else {
      response = await jikanClient.getAnimeByGenreSorted(genre, sortBy, page, limit, minScore);
    }

    if (!response.data) {
      throw new Error('No data in Jikan response');
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
    .map(item => {
      const formatted = jikanClient.formatAnimeData(item);

      return {
        ...formatted,
      };
    })
    .filter(item => {
      if (seenIds.has(item.sourceId)) {
        console.warn(`⚠️ Duplicate anime ID: ${item.sourceId} - ${item.title}`);
        duplicateCount.count++;
        duplicateCount.ids.push(item.sourceId);
        return false;
      }
      seenIds.add(item.sourceId);
      return true;
    });

  if (duplicateCount.count > 0) {
    console.warn(`⚠️ Removed ${duplicateCount.count} duplicate anime(s):`, duplicateCount.ids);
  }

  return {
    results: filteredResults,
    total: pagination?.items?.total || filteredResults.length,
    totalPages: Math.min(pagination?.last_visible_page || 1, MAX_PAGES),
    currentPage: page,
    itemsPerPage: limit
  };
}

async function discoverMangas(genre, sortBy, page, limit, query = '', minScore = null) {
  try {
    let response;

    if (query && query.trim() !== '') {
      response = await jikanClient.searchManga(query, page, limit);
    } else if (!genre || genre === '') {
      // 🔥 PASSE O minScore PARA O MÉTODO
      response = await jikanClient.getAllMangaSorted(sortBy, page, limit, minScore);
    } else {
      response = await jikanClient.getMangaByGenreSorted(genre, sortBy, page, limit, minScore);
    }

    if (!response.data) {
      throw new Error('No data in Jikan manga response');
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

  // 🔥 USE A FUNÇÃO formatMangaData() do jikanClient
  const filteredResults = data
    .map(item => {
      const formatted = jikanClient.formatMangaData(item);

      // Adicione campos extras que podem não estar no formatMangaData()
      return {
        ...formatted
      };
    })
    .filter(item => {
      if (seenIds.has(item.sourceId)) {
        console.warn(`⚠️ Duplicate manga ID: ${item.sourceId} - ${item.title}`);
        duplicateCount.count++;
        duplicateCount.ids.push(item.sourceId);
        return false;
      }
      seenIds.add(item.sourceId);
      return true;
    });

  if (duplicateCount.count > 0) {
    console.warn(`⚠️ Removed ${duplicateCount.count} duplicate manga(s):`, duplicateCount.ids);
  }

  return {
    results: filteredResults,
    total: pagination?.items?.total || filteredResults.length,
    totalPages: Math.min(pagination?.last_visible_page || 1, MAX_PAGES),
    currentPage: page,
    itemsPerPage: limit
  };
}

async function discoverGames(genre, sortBy, page, limit, query = '', minMetacritic = null) {
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

  // 🔥 ADICIONE FILTRO METACRITIC
  if (minMetacritic !== null && minMetacritic !== '') {
    params.metacritic = `${parseInt(minMetacritic)},100`;
  }

  if (query && query.trim() !== '') {
    params.search = query;
  }

  const response = await rawgClient.fetch('/games', params);

  const totalPages = Math.min(Math.ceil(response.count / limit), MAX_PAGES);

  return {
    results: response.results.map(game => rawgClient.formatGameData(game)),
    total: response.count,
    totalPages: totalPages,
    currentPage: page,
    itemsPerPage: limit
  };
}