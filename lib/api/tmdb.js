// /entertrack/lib/api/tmdb.js

export class TMDBClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.themoviedb.org/3';
    this.imageBaseURL = 'https://image.tmdb.org/t/p';
  }

  static getAllGenres() {
    return [
      { id: 28, name: 'Ação' },
      { id: 12, name: 'Aventura' },
      { id: 16, name: 'Animação' },
      { id: 35, name: 'Comédia' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentário' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Família' },
      { id: 14, name: 'Fantasia' },
      { id: 878, name: 'Ficção Científica' },
      { id: 27, name: 'Terror' },
      { id: 9648, name: 'Mistério' },
      { id: 10749, name: 'Romance' },
      { id: 53, name: 'Suspense' },
      { id: 10752, name: 'Guerra' },
      { id: 37, name: 'Western' },
      { id: 10402, name: 'Musical' },
      { id: 36, name: 'História' },
      { id: 10770, name: 'Biografia' },
      { id: 10757, name: 'Esporte' },
      { id: 37, name: 'Faroeste' }
    ];
  }

  async fetch(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);
    url.searchParams.append('language', 'pt-BR');

    // Adicionar parâmetros adicionais
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Buscar filmes
  async searchMovies(query, page = 1) {
    return this.fetch('/search/movie', {
      query,
      page: page.toString(),
    });
  }

  // Buscar séries
  async searchTVShows(query, page = 1) {
    return this.fetch('/search/tv', {
      query,
      page: page.toString(),
    });
  }

  async getMovieDetails(movieId) {
    return this.fetch(`/movie/${movieId}`);
  }

  async getTVShowDetails(tvId) {
    return this.fetch(`/tv/${tvId}`);
  }

  async getTVShowSeasonsInfo(tvId) {
    const data = await this.fetch(`/tv/${tvId}`);

    const episodesPerSeason = [];
    if (data.seasons && Array.isArray(data.seasons)) {
      const regularSeasons = data.seasons
        .filter(season => season.season_number > 0)
        .sort((a, b) => a.season_number - b.season_number);

      regularSeasons.forEach(season => {
        episodesPerSeason.push(season.episode_count || 0);
      });
    }

    return {
      id: data.id,
      seasons: data.number_of_seasons || 0,
      episodes: data.number_of_episodes || 0,
      episodesPerSeason: episodesPerSeason
    };
  }

  async searchMulti(query, page = 1) {
    return this.fetch('/search/multi', {
      query,
      page: page.toString(),
    });
  }

  async getGenres(type = 'movie') {
    const endpoint = type === 'movie' ? '/genre/movie/list' : '/genre/tv/list';
    return this.fetch(endpoint);
  }

  static formatGenres(genreIds) {
    const allGenres = this.getAllGenres();
    return genreIds.map(id => {
      const genre = allGenres.find(g => g.id === Number(id));
      return genre || { id: Number(id), name: 'Unknown' };
    });
  }

  async formatMovieData(movie, includeDetails = false) {
    let runtime = 0;

    if (includeDetails) {
      try {
        const movieDetails = await this.getMovieDetails(movie.id);
        runtime = movieDetails.runtime || 0;
      } catch (error) {
        console.error(`Erro ao buscar detalhes do filme ${movie.id}:`, error);
        runtime = 0;
      }
    }

    return {
      sourceId: movie.id?.toString(),
      title: movie.title,
      description: movie.overview,
      coverImage: this.getImageURL(movie.poster_path),
      releasePeriod: movie.release_date ? {
        year: new Date(movie.release_date).getFullYear(),
        month: new Date(movie.release_date).getMonth() + 1
      } : undefined,
      averageRating: movie.vote_average,
      ratingCount: movie.vote_count,
      runtime: runtime,
      genres: await this.mapGenreIdsToNames(movie.genre_ids || [], 'movie')
    };
  }

  // 🔥 NOVO: Formatar dados da série
  async formatSeriesData(series) {
    return {
      sourceId: series.id?.toString(),
      title: series.name,
      description: series.overview,
      coverImage: this.getImageURL(series.poster_path),
      releasePeriod: series.first_air_date ? {
        year: new Date(series.first_air_date).getFullYear(),
        month: new Date(series.first_air_date).getMonth() + 1
      } : undefined,
      averageRating: series.vote_average,
      ratingCount: series.vote_count,
      genres: await this.mapGenreIdsToNames(series.genre_ids || [], 'tv')
    };
  }

  async mapGenreIdsToNames(genreIds, type) {
    try {
      const genresData = await this.getGenres(type);
      return genreIds.map(id => {
        const genre = genresData.genres.find(g => g.id === Number(id));
        return genre ? { id: genre.id, name: genre.name } : { id: id, name: id.toString() };
      });
    } catch (error) {
      console.error('Erro ao buscar gêneros:', error);
      // Fallback para gêneros estáticos
      return TMDBClient.formatGenres(genreIds, type);
    }
  }

  getImageURL(path, size = 'w500') {
    if (!path) return null;
    return `${this.imageBaseURL}/${size}${path}`;
  }

  getPosterURL(path) {
    return this.getImageURL(path, 'w500');
  }

  getBackdropURL(path) {
    return this.getImageURL(path, 'w1280');
  }
}

export const tmdbClient = new TMDBClient(process.env.NEXT_PUBLIC_TMDB_API_KEY);