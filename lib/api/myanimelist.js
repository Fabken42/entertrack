class MyAnimeListClient {
  constructor() {
    this.clientId = process.env.MYANIMELIST_CLIENT_ID;
    this.baseURL = 'https://api.myanimelist.net/v2';
  }

  async fetch(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);

    // Adicionar parâmetros
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'X-MAL-CLIENT-ID': this.clientId,
      },
    });

    if (!response.ok) {
      throw new Error(`MyAnimeList API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // FUNÇÕES PARA ANIMES
  async searchAnime(query, limit = 20, offset = 0) {
    return this.fetch('/anime', {
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: 'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics'
    });
  }

  async getAnimeByGenre(genreId, page = 1, limit = 50) {
    try {
      console.log(`Fetching anime for genre ID: ${genreId}, page: ${page}, limit: ${limit}`);

      // Para gêneros, usamos a busca com query do nome do gênero
      const genreName = this.getGenreNameById(genreId);
      if (!genreName) {
        throw new Error(`Genre ID ${genreId} not found`);
      }

      const response = await this.fetch('/anime', {
        q: genreName,
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
        fields: 'id,title,main_picture,mean,rank,popularity,num_episodes,start_date,synopsis,genres,status,media_type,num_list_users'
      });

      console.log(`Genre search results: ${response.data?.length || 0} items`);

      return {
        data: response.data,
        paging: response.paging
      };
    } catch (error) {
      console.error('Error in getAnimeByGenre:', error);
      throw error;
    }
  }

  async getAnimeRanking(rankingType, limit = 50, offset = 0) {
    return this.fetch('/anime/ranking', {
      ranking_type: rankingType,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: 'id,title,main_picture,mean,rank,popularity,num_episodes,start_date,synopsis,genres,status,media_type,num_list_users'
    });
  }

  async getPopularAnime(limit = 50, offset = 0) {
    return this.getAnimeRanking('bypopularity', limit, offset);
  }

  async getTopAnime(limit = 50, offset = 0) {
    return this.getAnimeRanking('all', limit, offset);
  }

  async getNewestAnime(limit = 50, offset = 0) {
    return this.getAnimeRanking('airing', limit, offset);
  }

  async getAnimeDetails(animeId) {
    return this.fetch(`/anime/${animeId}`, {
      fields: 'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics'
    });
  }

  // NOVAS FUNÇÕES PARA MANGÁS
  async searchManga(query, limit = 20, offset = 0) {
    return this.fetch('/manga', {
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: 'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_volumes,num_chapters,authors{first_name,last_name},serialization{name}'
    });
  }

  async getMangaByGenre(genreId, page = 1, limit = 50) {
    try {
      console.log(`Fetching manga for genre ID: ${genreId}, page: ${page}, limit: ${limit}`);

      const genreName = this.getGenreNameById(genreId);
      if (!genreName) {
        throw new Error(`Genre ID ${genreId} not found`);
      }

      // CORRIJA: Use search com query do gênero
      const response = await this.fetch('/manga', {
        q: genreName,
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
        fields: 'id,title,main_picture,mean,rank,popularity,num_volumes,num_chapters,start_date,synopsis,genres,status,media_type,num_list_users,authors{first_name,last_name}'
      });

      console.log(`Manga genre search results: ${response.data?.length || 0} items`);

      return {
        data: response.data,
        paging: response.paging
      };
    } catch (error) {
      console.error('Error in getMangaByGenre:', error);
      throw error;
    }
  }

  async getMangaRanking(rankingType, limit = 50, offset = 0) {
    return this.fetch('/manga/ranking', {
      ranking_type: rankingType,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: 'id,title,main_picture,mean,rank,popularity,num_volumes,num_chapters,start_date,synopsis,genres,status,media_type,num_list_users,authors{first_name,last_name}'
    });
  }

  async getPopularManga(limit = 50, offset = 0) {
    return this.getMangaRanking('bypopularity', limit, offset);
  }

  async getTopManga(limit = 50, offset = 0) {
    return this.getMangaRanking('all', limit, offset);
  }

  async getNewestManga(limit = 50, offset = 0) {
    return this.getMangaRanking('bypopularity', limit, offset); // MAL não tem ranking "newest" para mangás
  }

  async getMangaDetails(mangaId) {
    return this.fetch(`/manga/${mangaId}`, {
      fields: 'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_volumes,num_chapters,authors{first_name,last_name},serialization{name}'
    });
  }

  // FUNÇÕES AUXILIARES
  getGenreNameById(genreId) {
    const genres = {
      '1': 'Action',
      '2': 'Adventure',
      '4': 'Comedy',
      '7': 'Mystery',
      '8': 'Drama',
      '10': 'Fantasy',
      '14': 'Horror',
      '22': 'Romance',
      '24': 'Sci-Fi',
      '36': 'Slice of Life',
      '30': 'Sports',
      '37': 'Supernatural',
      '41': 'Suspense',
      '25': 'Shoujo',
      '27': 'Shounen',
      '42': 'Seinen',
      '43': 'Josei',
      '9': 'Ecchi'
    };
    return genres[genreId] || null;
  }

  getImageURL(picture, size = 'large') {
    if (!picture) return null;
    return picture[size] || picture.medium || picture.large;
  }

  // FORMATADORES DE DADOS
  formatAnimeData(anime) {
    return {
      id: anime.id,
      title: anime.title,
      englishTitle: anime.alternative_titles?.en,
      japaneseTitle: anime.alternative_titles?.ja,
      description: anime.synopsis,
      imageUrl: this.getImageURL(anime.main_picture),
      startDate: anime.start_date,
      endDate: anime.end_date,
      episodes: anime.num_episodes,
      status: anime.status,
      mediaType: anime.media_type,

      // Mantém compatibilidade
      rating: anime.mean,
      scoreCount: anime.num_scoring_users,

      // 🔥 Correção: padroniza para o BaseMediaForm
      apiRating: anime.mean,                 // (0–10)
      apiVoteCount: anime.num_scoring_users, // votos da API

      rank: anime.rank,
      popularity: anime.popularity,
      genres: anime.genres?.map(genre => genre.name) || [],
      studios: anime.studios?.map(studio => studio.name) || [],
      source: anime.source,
      season: anime.start_season,
      broadcast: anime.broadcast,
      members: anime.num_list_users
    };
  }


  formatMangaData(manga) {
    const authors = manga.authors?.map(author =>
      `${author.first_name} ${author.last_name}`.trim()
    ) || [];

    return {
      id: manga.id,
      title: manga.title,
      englishTitle: manga.alternative_titles?.en,
      japaneseTitle: manga.alternative_titles?.ja,
      description: manga.synopsis,
      imageUrl: this.getImageURL(manga.main_picture),
      startDate: manga.start_date,
      endDate: manga.end_date,
      volumes: manga.num_volumes,
      chapters: manga.num_chapters,
      status: manga.status,
      mediaType: manga.media_type,

      // Mantém compatibilidade
      rating: manga.mean,
      scoreCount: manga.num_scoring_users,

      // 🔥 NOVO — necessário para aparecer no formulário
      apiRating: manga.mean,                 // nota MAL (0–10)
      apiVoteCount: manga.num_scoring_users, // votos MAL

      rank: manga.rank,
      popularity: manga.popularity,
      genres: manga.genres?.map(genre => genre.name) || [],
      authors: authors,
      serialization: manga.serialization?.map(s => s.name) || [],
      members: manga.num_list_users
    };
  }

}

export const malClient = new MyAnimeListClient();