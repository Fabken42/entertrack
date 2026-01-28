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
      { id: '1', name: 'Action' },
      { id: '2', name: 'Adventure' },
      { id: '3', name: 'Cars' },
      { id: '4', name: 'Comedy' },
      { id: '5', name: 'Avant Garde' },
      { id: '6', name: 'Demons' },
      { id: '7', name: 'Mystery' },
      { id: '8', name: 'Drama' },
      { id: '9', name: 'Ecchi' },
      { id: '10', name: 'Fantasy' },
      { id: '11', name: 'Game' },
      { id: '12', name: 'Hentai' },
      { id: '13', name: 'Historical' },
      { id: '14', name: 'Horror' },
      { id: '15', name: 'Kids' },
      { id: '16', name: 'Martial Arts' },
      { id: '17', name: 'Mecha' },
      { id: '18', name: 'Music' },
      { id: '19', name: 'Parody' },
      { id: '20', name: 'Samurai' },
      { id: '21', name: 'Romance' },
      { id: '22', name: 'School' },
      { id: '23', name: 'Sci-Fi' },
      { id: '24', name: 'Shoujo' },
      { id: '25', name: 'Shoujo Ai' },
      { id: '26', name: 'Shounen' },
      { id: '27', name: 'Shounen Ai' },
      { id: '28', name: 'Space' },
      { id: '29', name: 'Sports' },
      { id: '30', name: 'Super Power' },
      { id: '31', name: 'Vampire' },
      { id: '32', name: 'Yaoi' },
      { id: '33', name: 'Yuri' },
      { id: '34', name: 'Harem' },
      { id: '35', name: 'Slice of Life' },
      { id: '36', name: 'Supernatural' },
      { id: '37', name: 'Military' },
      { id: '38', name: 'Police' },
      { id: '39', name: 'Psychological' },
      { id: '40', name: 'Suspense' },
      { id: '41', name: 'Seinen' },
      { id: '42', name: 'Josei' },
      { id: '43', name: 'Award Winning' },
      { id: '44', name: 'Gourmet' },
      { id: '45', name: 'Work Life' },
      { id: '46', name: 'Erotica' }
    ];
  }

  // Método para respeitar rate limit do Jikan
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
        url.searchParams.append(key, value.toString());
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

  // FUNÇÕES PARA ANIMES
  async searchAnime(query, page = 1, limit = 20) {
    return this.fetch('/anime', {
      q: query,
      page: page,
      limit: limit
    });
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

  async getAnimeByGenreSorted(genreId, sortBy, page = 1, limit = 20) {
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

    return this.fetch('/anime', params);
  }

  async getAllAnimeSorted(sortBy = 'popularity', page = 1, limit = 20) {
    const orderMap = {
      'popularity': 'popularity',
      'rating': 'score',
      'newest': 'start_date'
    };

    const orderBy = orderMap[sortBy] || 'popularity';
    const sortOrder = sortBy === 'popularity' ? 'asc' : 'desc';

    return this.fetch('/anime', {
      page: page,
      limit: limit,
      order_by: orderBy,
      sort: sortOrder
    });
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

  async getMangaByGenreSorted(genreId, sortBy = 'popularity', page = 1, limit = 20) {
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

    return this.fetch('/manga', params);
  }

  async getAllMangaSorted(sortBy = 'popularity', page = 1, limit = 20) {
    const orderMap = {
      'popularity': 'popularity',
      'rating': 'score',
      'newest': 'start_date'
    };

    const orderBy = orderMap[sortBy] || 'popularity';
    const sortOrder = sortBy === 'popularity' ? 'asc' : 'desc';

    return this.fetch('/manga', {
      page: page,
      limit: limit,
      order_by: orderBy,
      sort: sortOrder
    });
  }

  // NOVO: Função específica para mangás populares
  async getMangaPopular(page = 1, limit = 20) {
    return this.fetch('/top/manga', {
      type: 'bypopularity',
      page: page,
      limit: limit
    });
  }

  // FUNÇÃO DE GÊNEROS MELHORADA
  async getGenres(type = 'anime', forceRefresh = false) {
    const cacheKey = `${type}-genres`;

    // Retornar do cache se disponível
    if (!forceRefresh && this.genreCache.has(cacheKey)) {
      return this.genreCache.get(cacheKey);
    }

    try {
      const response = await this.fetch(`/genres/${type}`);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from Jikan');
      }

      const apiGenres = response.data.map(genre => ({
        id: genre.mal_id.toString(),
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
      id: anime.mal_id,
      title: anime.title,
      description: anime.synopsis,
      coverImage: this.getImageURL(anime.images),
      releasePeriod: anime.aired?.from ? {
        year: new Date(anime.aired.from).getFullYear(),
        month: new Date(anime.aired.from).getMonth() + 1
      } : null,
      episodes: anime.episodes,
      status: anime.status,
      category: anime.type,
      apiRating: anime.score || 0,
      apiVoteCount: anime.scored_by || 0,
      popularity: anime.popularity || 0,
      studios: anime.studios?.map(studio => studio.name) || [],
      members: anime.members || 0,
      genres: anime.genres?.map(genre => ({
        id: Number(genre.mal_id) || 0,
        name: genre.name
      })) || []
    };
  }

  formatMangaData(manga) {
    return {
      id: manga.mal_id,
      title: manga.title,
      description: manga.synopsis,
      coverImage: this.getImageURL(manga.images),
      releasePeriod: manga.published?.from ? {
        year: new Date(manga.published.from).getFullYear(),
        month: new Date(manga.published.from).getMonth() + 1
      } : null,
      volumes: manga.volumes || 0,
      chapters: manga.chapters || 0,
      status: manga.status,
      category: manga.type,
      apiRating: manga.score || 0,
      apiVoteCount: manga.scored_by || 0,
      popularity: manga.popularity || 0,
      authors: manga.authors?.map(author => author.name) || [],
      members: manga.members || 0,
      genres: manga.genres?.map(genre => ({
        id: Number(genre.mal_id) || 0,
        name: genre.name
      })) || []
    };
  }

  // Limpar cache (útil para testes)
  clearCache() {
    this.genreCache.clear();
  }
}

export const jikanClient = new JikanClient();