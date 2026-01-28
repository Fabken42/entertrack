// /entertrack/lib/api/tmdb.js

export class TMDBClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.themoviedb.org/3';
    this.imageBaseURL = 'https://image.tmdb.org/t/p';
  }

  static getAllGenres() {
    return [
      { id: '28', name: 'Ação' },
      { id: '12', name: 'Aventura' },
      { id: '16', name: 'Animação' },
      { id: '35', name: 'Comédia' },
      { id: '80', name: 'Crime' },
      { id: '99', name: 'Documentário' },
      { id: '18', name: 'Drama' },
      { id: '10751', name: 'Família' },
      { id: '14', name: 'Fantasia' },
      { id: '878', name: 'Ficção Científica' },
      { id: '27', name: 'Terror' },
      { id: '9648', name: 'Mistério' },
      { id: '10749', name: 'Romance' },
      { id: '53', name: 'Suspense' },
      { id: '10752', name: 'Guerra' },
      { id: '37', name: 'Western' },
      { id: '10402', name: 'Musical' },
      { id: '36', name: 'História' },
      { id: '10770', name: 'Biografia' },
      { id: '10757', name: 'Esporte' },
      { id: '37', name: 'Faroeste' }
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

  // Detalhes do filme
  async getMovieDetails(movieId) {
    return this.fetch(`/movie/${movieId}`);
  }

  // Detalhes da série
  async getTVShowDetails(tvId) {
    return this.fetch(`/tv/${tvId}`);
  }

  // /entertrack/lib/api/tmdb.js - Adicione este método:

  // Detalhes da série com informações de temporadas e episódios
  async getTVShowSeasonsInfo(tvId) {
    const data = await this.fetch(`/tv/${tvId}`);
    console.log('getTvShowSeasonsInfo data:', data);

    // Cria array com episódios por temporada
    const episodesPerSeason = [];
    if (data.seasons && Array.isArray(data.seasons)) {
      // Ordena temporadas por número e filtra temporadas especiais (season_number: 0)
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

  // Buscar multi (filmes + séries)
  async searchMulti(query, page = 1) {
    return this.fetch('/search/multi', {
      query,
      page: page.toString(),
    });
  }

  // Obter gêneros por tipo
  async getGenres(type = 'movie') {
    const endpoint = type === 'movie' ? '/genre/movie/list' : '/genre/tv/list';
    return this.fetch(endpoint);
  }

  static formatGenres(genreIds, mediaType = 'movie') {
    const allGenres = this.getAllGenres();
    return genreIds.map(id => {
      const genre = allGenres.find(g => g.id === Number(id));
      return genre || { id: Number(id), name: 'Unknown' };
    });
  }

  // URLs de imagem
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

// Instância global do cliente TMDB
export const tmdbClient = new TMDBClient(process.env.TMDB_API_KEY || '2bf7315694a7f7d461bbf7bfb18391dc');