// TO DO: adicionar Tratamento de rate limit

export class JikanClient {
  constructor() {
    this.baseURL = 'https://api.jikan.moe/v4';
    this.genreCache = new Map(); // Cache para gêneros
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.lastRequestTime = 0;
    this.MIN_REQUEST_INTERVAL = 1000; // 1 segundo entre requests (rate limit do Jikan)
  }

  static getAllGenres() {
    return [
      { id: 1, name: 'Action' },
      { id: 2, name: 'Adventure' },
      { id: 3, name: 'Cars' },
      { id: 4, name: 'Comedy' },
      { id: 5, name: 'Avant Garde' },
      { id: 6, name: 'Demons' },
      { id: 7, name: 'Mystery' },
      { id: 8, name: 'Drama' },
      { id: 9, name: 'Ecchi' },
      { id: 10, name: 'Fantasy' },
      { id: 11, name: 'Game' },
      { id: 12, name: 'Hentai' },
      { id: 13, name: 'Historical' },
      { id: 14, name: 'Horror' },
      { id: 15, name: 'Kids' },
      { id: 16, name: 'Martial Arts' },
      { id: 17, name: 'Mecha' },
      { id: 18, name: 'Music' },
      { id: 19, name: 'Parody' },
      { id: 20, name: 'Samurai' },
      { id: 21, name: 'Romance' },
      { id: 22, name: 'School' },
      { id: 23, name: 'Sci-Fi' },
      { id: 24, name: 'Shoujo' },
      { id: 25, name: 'Shoujo Ai' },
      { id: 26, name: 'Shounen' },
      { id: 27, name: 'Shounen Ai' },
      { id: 28, name: 'Space' },
      { id: 29, name: 'Sports' },
      { id: 30, name: 'Super Power' },
      { id: 31, name: 'Vampire' },
      { id: 32, name: 'Yaoi' },
      { id: 33, name: 'Yuri' },
      { id: 34, name: 'Harem' },
      { id: 35, name: 'Slice of Life' },
      { id: 36, name: 'Supernatural' },
      { id: 37, name: 'Military' },
      { id: 38, name: 'Police' },
      { id: 39, name: 'Psychological' },
      { id: 40, name: 'Suspense' },
      { id: 41, name: 'Seinen' },
      { id: 42, name: 'Josei' },
      { id: 43, name: 'Award Winning' },
      { id: 44, name: 'Gourmet' },
      { id: 45, name: 'Work Life' },
      { id: 46, name: 'Erotica' }
    ];
  }

  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  async fetch(endpoint, params = {}) {
    // Respeitar rate limit
    await this.waitForRateLimit();

    const url = new URL(`${this.baseURL}${endpoint}`);

    // Só adiciona parâmetros válidos
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Converter arrays para string separada por vírgula
        if (Array.isArray(value)) {
          url.searchParams.append(key, value.join(','));
        } else {
          url.searchParams.append(key, value.toString());
        }
      }
    });

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`🔍 Jikan API Error for ${endpoint}:`, error.message);
      throw error;
    }
  }

  async searchAnime(query, page = 1, limit = 20) {
    return this.fetch('/anime', {
      q: query,
      page: page,
      limit: limit
    });
  }

  async getSeasonalAnime(year, season, page = 1, limit = 20, filters = {}) {
    try {
      const formattedSeason = season.toLowerCase();
      let url = `${this.baseURL}/seasons/${year}/${formattedSeason}?page=${page}&limit=${limit}`;

      const queryParams = [];

      // Adicionar filtro de nota mínima
      if (filters.minScore) {
        queryParams.push(`min_score=${parseFloat(filters.minScore)}`);
      }

      if (filters.maxScore) {
        queryParams.push(`max_score=${parseFloat(filters.maxScore)}`);
      }

      // Adicionar filtro de gênero
      if (filters.genres) {
        const genres = Array.isArray(filters.genres)
          ? filters.genres.join(',')
          : filters.genres.toString();
        queryParams.push(`genres=${genres}`);
      }

      // Adicionar ordenação
      if (filters.orderBy) {
        queryParams.push(`order_by=${filters.orderBy}`);
      }

      if (filters.sort) {
        queryParams.push(`sort=${filters.sort}`);
      }

      if (filters.sfw !== undefined) {
        queryParams.push(`sfw=${filters.sfw}`);
      }

      // Adicionar todos os parâmetros à URL
      if (queryParams.length > 0) {
        url += `&${queryParams.join('&')}`;
      }

      return this.fetch(`/seasons/${year}/${formattedSeason}`, {
        page,
        limit,
        ...(filters.minScore && { min_score: parseFloat(filters.minScore) }),
        ...(filters.maxScore && { max_score: parseFloat(filters.maxScore) }),
        ...(filters.genres && {
          genres: Array.isArray(filters.genres) ? filters.genres.join(',') : filters.genres
        }),
        ...(filters.orderBy && { order_by: filters.orderBy }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.sfw !== undefined && { sfw: filters.sfw })
      });
    } catch (error) {
      console.error('Error fetching seasonal anime:', error);
      throw error;
    }
  }

  async getAnimeRanking(rankingType = 'bypopularity', page = 1, limit = 20) {
    const rankingMap = {
      'popularity': 'bypopularity',
      'rating': 'favorite',
      'newest': 'airing'
    };

    const jikanRankingType = rankingMap[rankingType] || 'bypopularity';

    return this.fetch(`/top/anime`, {
      type: jikanRankingType,
      page: page,
      limit: limit
    });
  }

  async getAnimeByGenreSorted(genreId, sortBy = 'popularity', page = 1, limit = 20, minScore = null) {
    const orderMap = {
      'popularity': 'popularity',
      'rating': 'score',
      'newest': 'start_date'
    };

    const orderBy = orderMap[sortBy] || 'popularity';
    const sortOrder = sortBy === 'popularity' ? 'asc' : 'desc';

    const params = {
      page: page,
      limit: limit,
      order_by: orderBy,
      sort: sortOrder
    };

    if (genreId && genreId !== '') {
      params.genres = genreId;
    }

    // 🔥 ADICIONE FILTRO DE NOTA MÍNIMA
    if (minScore !== null && minScore !== '') {
      params.min_score = parseFloat(minScore);
    }

    return this.fetch('/anime', params);
  }

  async getAllAnimeSorted(sortBy = 'popularity', page = 1, limit = 20, minScore = null) {
    const orderMap = {
      'popularity': 'popularity',
      'rating': 'score',
      'newest': 'start_date'
    };

    const orderBy = orderMap[sortBy] || 'popularity';
    const sortOrder = sortBy === 'popularity' ? 'asc' : 'desc';

    const params = {
      page: page,
      limit: limit,
      order_by: orderBy,
      sort: sortOrder
    };

    // 🔥 ADICIONE FILTRO DE NOTA MÍNIMA
    if (minScore !== null && minScore !== '') {
      params.min_score = parseFloat(minScore);
    }

    return this.fetch('/anime', params);
  }

  // FUNÇÕES PARA MANGÁS
  async searchManga(query, page = 1, limit = 20) {
    return this.fetch('/manga', {
      q: query,
      page: page,
      limit: limit
    });
  }

  async getMangaRanking(rankingType = 'popularity', page = 1, limit = 20) {
    const rankingMap = {
      'popularity': 'bypopularity',
      'rating': 'favorite',
      'newest': 'publishing'
    };

    const jikanRankingType = rankingMap[rankingType] || 'bypopularity';

    return this.fetch(`/top/manga`, {
      type: jikanRankingType,
      page: page,
      limit: limit
    });
  }

  async getAllMangaSorted(sortBy = 'popularity', page = 1, limit = 20, minScore = null) {
    const orderMap = {
      'popularity': 'popularity',
      'rating': 'score',
      'newest': 'start_date'
    };

    const orderBy = orderMap[sortBy] || 'popularity';
    const sortOrder = sortBy === 'popularity' ? 'asc' : 'desc';

    const params = {
      page: page,
      limit: limit,
      order_by: orderBy,
      sort: sortOrder
    };

    if (minScore !== null && minScore !== '') {
      params.min_score = parseFloat(minScore);
    }

    return this.fetch('/manga', params);
  }

  async getMangaByGenreSorted(genreId, sortBy = 'popularity', page = 1, limit = 20, minScore = null) {
    const orderMap = {
      'popularity': 'popularity',
      'rating': 'score',
      'newest': 'start_date'
    };

    const orderBy = orderMap[sortBy] || 'popularity';
    const sortOrder = sortBy === 'popularity' ? 'asc' : 'desc';

    const params = {
      page: page,
      limit: limit,
      order_by: orderBy,
      sort: sortOrder
    };

    if (genreId && genreId !== '') {
      params.genres = genreId;
    }

    if (minScore !== null && minScore !== '') {
      params.min_score = parseFloat(minScore);
    }

    return this.fetch('/manga', params);
  }

  async getMangaPopular(page = 1, limit = 20) {
    return this.fetch('/top/manga', {
      type: 'bypopularity',
      page: page,
      limit: limit
    });
  }

  async getGenres(type = 'anime', forceRefresh = false) {
    const cacheKey = `${type}-genres`;

    if (!forceRefresh && this.genreCache.has(cacheKey)) {
      return this.genreCache.get(cacheKey);
    }

    try {
      const response = await this.fetch(`/genres/${type}`);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from Jikan');
      }

      const apiGenres = response.data.map(genre => ({
        id: genre.mal_id,
        name: genre.name
      }));


      // Remover duplicatas
      const uniqueGenres = [];
      const seenIds = new Set();

      apiGenres.forEach(genre => {
        if (!seenIds.has(genre.id)) {
          seenIds.add(genre.id);
          uniqueGenres.push(genre);
        } else {
          console.warn(`⚠️ Duplicate genre ID in API response: ${genre.id} - ${genre.name}`);
        }
      });

      // Ordenar por nome
      uniqueGenres.sort((a, b) => a.name.localeCompare(b.name));

      // Armazenar no cache
      this.genreCache.set(cacheKey, uniqueGenres);
      return uniqueGenres;

    } catch (error) {
      console.error(`❌ Error fetching ${type} genres from Jikan:`, error.message);

      // Tentar usar o cache mesmo que expirado
      if (this.genreCache.has(cacheKey)) {
        return this.genreCache.get(cacheKey);
      }

      // Usar fallback
      const fallbackGenres = JikanClient.getAllGenres();

      // Remover duplicatas do fallback também
      const uniqueFallback = [];
      const seenFallbackIds = new Set();

      fallbackGenres.forEach(genre => {
        if (!seenFallbackIds.has(genre.id)) {
          seenFallbackIds.add(genre.id);
          uniqueFallback.push(genre);
        }
      });

      uniqueFallback.sort((a, b) => a.name.localeCompare(b.name));

      // Armazenar fallback no cache
      this.genreCache.set(cacheKey, uniqueFallback);
      return uniqueFallback;
    }
  }

  getImageURL(imageData) {
    if (!imageData) return null;
    const jpg = imageData.jpg;
    if (!jpg) return null;
    return jpg.large_image_url || jpg.image_url;
  }

  formatAnimeData(anime) {
    return {
      sourceId: anime.mal_id?.toString(),
      title: anime.title,
      description: anime.synopsis || '*Sem descrição disponível*',
      coverImage: this.getImageURL(anime.images),
      releasePeriod: anime.aired?.from ? {
        year: new Date(anime.aired.from).getFullYear(),
        month: new Date(anime.aired.from).getMonth() + 1
      } : null,
      episodes: anime.episodes || null,
      category: anime.type || 'TV',

      averageRating: anime.score || null,
      ratingCount: anime.scored_by || null,

      popularity: anime.popularity || null,
      studios: anime.studios?.map(studio => studio.name) || [],
      members: anime.members || null,

      // Gêneros formatados
      genres: anime.genres?.map(g => ({
        id: Number(g.mal_id) || 0,
        name: g.name
      })) || [],
    };
  }

  formatMangaData(manga) {
    return {
      sourceId: manga.mal_id?.toString(),
      title: manga.title,
      description: manga.synopsis || '*Sem descrição disponível*',
      coverImage: this.getImageURL(manga.images),
      releasePeriod: manga.published?.from ? {
        year: new Date(manga.published.from).getFullYear(),
        month: new Date(manga.published.from).getMonth() + 1
      } : null,
      volumes: manga.volumes || null,
      chapters: manga.chapters || null,
      category: manga.type || 'Manga',

      averageRating: manga.score || null,
      ratingCount: manga.scored_by || null,

      popularity: manga.popularity || null,
      authors: manga.authors?.map(author => author.name) || [],
      members: manga.members || null,

      genres: manga.genres?.map(g => ({
        id: Number(g.mal_id) || 0,
        name: g.name
      })) || [],
    };
  }

  clearCache() {
    this.genreCache.clear();
  }
}

export const jikanClient = new JikanClient();