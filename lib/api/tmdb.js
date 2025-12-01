// /entertrack/lib/api/tmdb.js

class TMDBClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.themoviedb.org/3';
    this.imageBaseURL = 'https://image.tmdb.org/t/p';
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