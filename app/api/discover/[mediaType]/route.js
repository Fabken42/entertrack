// /entertrack/app/api/discover/[mediaType]/route.js
import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/api/tmdb';
import { jikanClient } from '@/lib/api/jikan';
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
    const query = searchParams.get('query') || ''; // 🔥 NOVO: parâmetro de busca

    let results;

    switch (mediaType) {
      case 'movies':
        results = await discoverMovies(genre, sortBy, page, limit, query);
        break;
      case 'series':
        results = await discoverSeries(genre, sortBy, page, limit, query);
        break;
      case 'animes':
        results = await discoverAnimes(genre, sortBy, page, limit, query);
        break;
      case 'games':
        results = await discoverGames(genre, sortBy, page, limit, query);
        break;
      case 'books':
        results = await discoverBooks(genre, sortBy, page, limit, query);
        break;
      case 'mangas':
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

  // 🔥 NOVO: Se houver query, usar search em vez de discover
  if (query && query.trim() !== '') {
    try {
      const response = await tmdbClient.searchMovies(query, page);

      const rawTotalResults = response.total_results || 0;
      const totalResults = Math.min(rawTotalResults, 20);
      const maxPages = Math.min(Math.ceil(totalResults / limit), 500);
      const safePage = Math.min(page, maxPages);

      // Se a página solicitada for maior que o máximo
      if (page > maxPages) {
        const correctedResponse = await tmdbClient.searchMovies(query, maxPages);
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

  const response = await tmdbClient.fetch('/discover/movie', params);

  const rawTotalResults = response.total_results || 0;
  const totalResults = Math.min(rawTotalResults, 10000);
  const maxPages = Math.min(Math.ceil(totalResults / limit), 500);
  const safePage = Math.min(page, maxPages);

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
      const totalResults = Math.min(rawTotalResults, 20);
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
            imageUrl: tmdbClient.getImageURL(series.poster_path),
            releaseYear: series.first_air_date ? new Date(series.first_air_date).getFullYear() : undefined,
            releaseDate: series.first_air_date,
            rating: series.vote_average,
            ratingsCount: series.vote_count,
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
          ratingsCount: series.vote_count,
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
        imageUrl: tmdbClient.getImageURL(series.poster_path),
        releaseYear: series.first_air_date ? new Date(series.first_air_date).getFullYear() : undefined,
        releaseDate: series.first_air_date,
        rating: series.vote_average,
        ratingsCount: series.vote_count,
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
      ratingsCount: series.vote_count,
      genres: await mapGenreIdsToNames(series.genre_ids || [], 'tv')
    }))),
    total: totalResults,
    totalPages: maxPages,
    currentPage: safePage,
    itemsPerPage: limit
  };
}

async function discoverAnimes(genre, sortBy, page, limit, query = '') {
  console.log(`🔍 discoverAnimes called with:`, { genre, sortBy, page, limit, query });

  try {
    // Se houver query, usar search (independente de gênero)
    if (query && query.trim() !== '') {
      console.log(`🔍 Searching anime with query: ${query}`);
      const response = await jikanClient.searchAnime(query, page, limit);

      if (!response.data) {
        throw new Error('No data in Jikan search response');
      }

      return processAnimeResults(response.data, response.pagination, page, limit);
    }

    // SEM GÊNERO ESPECÍFICO (Todos os Gêneros)
    if (!genre || genre === '') {
      console.log(`🔍 No genre selected, using getAllAnimeSorted with sort: ${sortBy}`);

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
      description: item.synopsis || 'Sem descrição disponível',
      imageUrl: jikanClient.getImageURL(item.images),
      releaseYear: item.year,
      releaseDate: item.aired?.from,
      rating: item.score || 0,
      rank: item.rank || 0,
      popularity: item.popularity || 0,
      episodes: item.episodes,
      status: item.status || 'Unknown',
      mediaType: item.type || 'TV',
      members: item.members || 0,
      genres: item.genres?.map(g => ({
        id: g.mal_id?.toString() || '0',
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
  console.log(`🔍 discoverMangas called with:`, { genre, sortBy, page, limit, query });

  try {
    // Se houver query, usar search
    if (query && query.trim() !== '') {
      console.log(`🔍 Searching manga with query: ${query}`);
      const response = await jikanClient.searchManga(query, page, limit);

      if (!response.data) {
        throw new Error('No data in Jikan manga search response');
      }

      return processMangaResults(response.data, response.pagination, page, limit);
    }

    // SEM GÊNERO ESPECÍFICO (Todos os Gêneros)
    if (!genre || genre === '') {
      console.log(`🔍 No genre selected, using getAllMangaSorted with sort: ${sortBy}`);

      // Usar getAllMangaSorted que NÃO envia parâmetro genres
      const response = await jikanClient.getAllMangaSorted(sortBy, page, limit);

      if (!response.data) {
        throw new Error('No data in Jikan getAllMangaSorted response');
      }

      console.log(`🔍 getAllMangaSorted returned ${response.data.length} items`);

      return processMangaResults(response.data, response.pagination, page, limit);
    }

    // COM GÊNERO ESPECÍFICO
    console.log(`🔍 Searching manga by genre: ${genre} with sort: ${sortBy}`);
    const response = await jikanClient.getMangaByGenreSorted(genre, sortBy, page, limit);

    if (!response.data) {
      throw new Error('No data in Jikan manga genre response');
    }

    console.log(`🔍 getMangaByGenreSorted returned ${response.data.length} items`);

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
      description: item.synopsis || 'Sem descrição disponível',
      imageUrl: jikanClient.getImageURL(item.images),
      releaseYear: item.published?.from ? new Date(item.published.from).getFullYear() : item.year,
      releaseDate: item.published?.from,
      rating: item.score || 0,
      rank: item.rank || 0,
      popularity: item.popularity || 0,
      volumes: item.volumes,
      chapters: item.chapters,
      status: item.status || 'Unknown',
      mediaType: item.type || 'Manga',
      members: item.members || 0,
      genres: item.genres?.map(g => ({
        id: g.mal_id?.toString() || '0',
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
    page_size: limit.toString()
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
    totalPages: totalPages,
    currentPage: page,
    itemsPerPage: limit
  };
}

async function discoverBooks(genre, sortBy, page, limit, query = '') {
  try {
    const orderBy = sortBy === 'newest' ? 'newest' : 'relevance';

    // 🔥 NOVO: Se houver query, usar query de busca
    let searchQuery = '';
    if (query && query.trim() !== '') {
      searchQuery = query;
    } else if (genre && genre !== '') {
      const cleanGenre = genre.replace(/[^\w\s]/gi, '').trim();
      searchQuery = `subject:"${cleanGenre}"`;
    } else {
      searchQuery = 'subject:fiction';
    }

    const safeLimit = Math.min(limit, 40);
    const startIndex = (page - 1) * safeLimit;

    const response = await googleBooksClient.fetch('/volumes', {
      q: searchQuery,
      orderBy: orderBy,
      maxResults: safeLimit.toString(),
      startIndex: startIndex.toString(),
      langRestrict: 'pt',
      printType: 'books'
    });

    const formattedResponse = formatBooksResponse(response, page, safeLimit);

    if (query && query.trim() !== '') {
      return {
        ...formattedResponse,
        total: Math.min(formattedResponse.total, 20),
        totalPages: Math.ceil(Math.min(formattedResponse.total, 20) / limit)
      };
    }

    return formattedResponse;

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