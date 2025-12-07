// TO DO: adicionar Tratamento de rate limit

class JikanClient {
  constructor() {
    this.baseURL = 'https://api.jikan.moe/v4';
    this.genreCache = new Map(); // Cache para gêneros
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.lastRequestTime = 0;
    this.MIN_REQUEST_INTERVAL = 1000; // 1 segundo entre requests (rate limit do Jikan)
  }

  // Método estático para lista completa de gêneros (fallback)
  static getAllGenres() {
    return [
      { id: '1', name: 'Action' },
      { id: '2', name: 'Adventure' },
      { id: '4', name: 'Comedy' },
      { id: '7', name: 'Mystery' },
      { id: '8', name: 'Drama' },
      { id: '10', name: 'Fantasy' },
      { id: '14', name: 'Horror' },
      { id: '22', name: 'Romance' },
      { id: '24', name: 'Sci-Fi' },
      { id: '27', name: 'Shounen' },
      { id: '30', name: 'Sports' },
      { id: '36', name: 'Slice of Life' },
      { id: '37', name: 'Supernatural' },
      { id: '41', name: 'Suspense' },
      { id: '42', name: 'Seinen' },
      { id: '43', name: 'Josei' },
      { id: '25', name: 'Shoujo' },
      { id: '9', name: 'Ecchi' },
      { id: '46', name: 'Award Winning' },
      { id: '47', name: 'Gourmet' },
      { id: '49', name: 'Erotica' },
      { id: '50', name: 'Adult Cast' },
      { id: '51', name: 'Anthropomorphic' },
      { id: '52', name: 'CGDCT' },
      { id: '53', name: 'Childcare' },
      { id: '54', name: 'Combat Sports' },
      { id: '55', name: 'Crossdressing' },
      { id: '56', name: 'Delinquents' },
      { id: '57', name: 'Detective' },
      { id: '58', name: 'Educational' },
      { id: '59', name: 'Gag Humor' },
      { id: '60', name: 'Gore' },
      { id: '61', name: 'Harem' },
      { id: '62', name: 'High Stakes Game' },
      { id: '63', name: 'Historical' },
      { id: '64', name: 'Idols (Female)' },
      { id: '65', name: 'Idols (Male)' },
      { id: '66', name: 'Isekai' },
      { id: '67', name: 'Iyashikei' },
      { id: '68', name: 'Love Polygon' },
      { id: '69', name: 'Magical Sex Shift' },
      { id: '70', name: 'Mahou Shoujo' },
      { id: '71', name: 'Martial Arts' },
      { id: '72', name: 'Mecha' },
      { id: '73', name: 'Medical' },
      { id: '74', name: 'Military' },
      { id: '75', name: 'Music' },
      { id: '76', name: 'Mythology' },
      { id: '77', name: 'Organized Crime' },
      { id: '78', name: 'Otaku Culture' },
      { id: '79', name: 'Parody' },
      { id: '80', name: 'Performing Arts' },
      { id: '81', name: 'Pets' },
      { id: '82', name: 'Psychological' },
      { id: '83', name: 'Racing' },
      { id: '84', name: 'Reincarnation' },
      { id: '85', name: 'Reverse Harem' },
      { id: '86', name: 'Romantic Subtext' },
      { id: '87', name: 'Samurai' },
      { id: '88', name: 'School' },
      { id: '89', name: 'Showbiz' },
      { id: '90', name: 'Space' },
      { id: '91', name: 'Strategy Game' },
      { id: '92', name: 'Super Power' },
      { id: '93', name: 'Survival' },
      { id: '94', name: 'Team Sports' },
      { id: '95', name: 'Time Travel' },
      { id: '96', name: 'Vampire' },
      { id: '97', name: 'Video Game' },
      { id: '98', name: 'Visual Arts' },
      { id: '99', name: 'Workplace' },
      { id: '100', name: 'Josei' },
      { id: '101', name: 'Kids' },
      { id: '102', name: 'Seinen' },
      { id: '103', name: 'Shoujo' },
      { id: '104', name: 'Shounen' }
    ];
  }

  // Método para respeitar rate limit do Jikan
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
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

    console.log(`🔍 Jikan API Request: ${url.toString()}`);
    
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
      console.log(`📚 Returning ${type} genres from cache`);
      return this.genreCache.get(cacheKey);
    }
    
    try {
      console.log(`🔍 Fetching ${type} genres from Jikan API...`);
      const response = await this.fetch(`/genres/${type}`);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from Jikan');
      }
      
      const apiGenres = response.data.map(genre => ({
        id: genre.mal_id.toString(),
        name: genre.name
      }));
      
      console.log(`✅ Successfully fetched ${apiGenres.length} ${type} genres`);
      
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
        console.log(`🔄 Using cached ${type} genres due to API error`);
        return this.genreCache.get(cacheKey);
      }
      
      // Usar fallback
      console.log(`🔄 Using comprehensive fallback genres for ${type}`);
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

  // Helper para debug de diferenças entre gêneros
  async testGenreDifferences() {
    try {
      const animeGenres = await this.getGenres('anime');
      const mangaGenres = await this.getGenres('manga');
      
      console.log('📊 Anime genres count:', animeGenres.length);
      console.log('📊 Manga genres count:', mangaGenres.length);
      
      const animeIds = new Set(animeGenres.map(g => g.id));
      const mangaIds = new Set(mangaGenres.map(g => g.id));
      
      const onlyInAnime = animeGenres.filter(g => !mangaIds.has(g.id));
      const onlyInManga = mangaGenres.filter(g => !animeIds.has(g.id));
      
      if (onlyInAnime.length > 0) {
        console.log('❌ Genres only in anime:', onlyInAnime.map(g => `${g.id}: ${g.name}`));
      }
      if (onlyInManga.length > 0) {
        console.log('❌ Genres only in manga:', onlyInManga.map(g => `${g.id}: ${g.name}`));
      }
      
      if (onlyInAnime.length === 0 && onlyInManga.length === 0) {
        console.log('✅ Anime and manga genres are identical!');
      }
      
    } catch (error) {
      console.error('Error testing genre differences:', error);
    }
  }

  // FORMATADORES DE DADOS (mantidos)
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
      englishTitle: anime.title_english,
      japaneseTitle: anime.title_japanese,
      description: anime.synopsis,
      imageUrl: this.getImageURL(anime.images),
      startDate: anime.aired?.from,
      endDate: anime.aired?.to,
      episodes: anime.episodes,
      status: anime.status,
      mediaType: anime.type,
      rating: anime.score,
      apiRating: anime.score,
      apiVoteCount: anime.scored_by,
      rank: anime.rank,
      popularity: anime.popularity,
      genres: anime.genres?.map(genre => ({ 
        id: genre.mal_id?.toString() || '0', 
        name: genre.name 
      })) || [],
      studios: anime.studios?.map(studio => studio.name) || [],
      source: anime.source,
      season: anime.season,
      broadcast: anime.broadcast?.string,
      members: anime.members,
      year: anime.year
    };
  }

  formatMangaData(manga) {
    return {
      id: manga.mal_id,
      title: manga.title,
      englishTitle: manga.title_english,
      japaneseTitle: manga.title_japanese,
      description: manga.synopsis,
      imageUrl: this.getImageURL(manga.images),
      startDate: manga.published?.from,
      endDate: manga.published?.to,
      volumes: manga.volumes,
      chapters: manga.chapters,
      status: manga.status,
      mediaType: manga.type,
      rating: manga.score,
      apiRating: manga.score,
      apiVoteCount: manga.scored_by,
      rank: manga.rank,
      popularity: manga.popularity,
      genres: manga.genres?.map(genre => ({ 
        id: genre.mal_id?.toString() || '0', 
        name: genre.name 
      })) || [],
      authors: manga.authors?.map(author => author.name) || [],
      serialization: manga.serializations?.map(s => s.name) || [],
      members: manga.members
    };
  }

  // Limpar cache (útil para testes)
  clearCache() {
    this.genreCache.clear();
    console.log('🧹 Jikan client cache cleared');
  }
}

export const jikanClient = new JikanClient();