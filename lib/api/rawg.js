// /entertrack/lib/api/rawg.js

export class RAWGClient {
  constructor() {
    this.apiKey = process.env.RAWG_API_KEY;
    this.baseURL = 'https://api.rawg.io/api';
  }

  static getAllGenres() {
    return [
      { id: 1, name: 'Action' },
      { id: 2, name: 'Adventure' },
      { id: 3, name: 'RPG' },
      { id: 4, name: 'Strategy' },
      { id: 5, name: 'Sports' },
      { id: 6, name: 'Racing' },
      { id: 7, name: 'Fighting' },
      { id: 8, name: 'Shooter' },
      { id: 9, name: 'Simulation' },
      { id: 10, name: 'Puzzle' },
      { id: 11, name: 'Horror' },
      { id: 12, name: 'Indie' },
      { id: 13, name: 'Arcade' },
      { id: 14, name: 'Platformer' }
    ];
  }

  async fetch(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    url.searchParams.append('key', this.apiKey);

    // Adicionar parâmetros adicionais
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchGames(query, page = 1, pageSize = 25) {
    return this.fetch('/games', {
      search: query,
      page: page.toString(),
      page_size: pageSize.toString(),
    });
  }

  // Detalhes do jogo
  async getGameDetails(gameId) {
    return this.fetch(`/games/${gameId}`);
  }

  // Jogos populares
  async getPopularGames(page = 1, pageSize = 25) {
    return this.fetch('/games', {
      ordering: '-added',
      page: page.toString(),
      page_size: pageSize.toString(),
    });
  }

  // Jogos mais bem avaliados
  async getTopRatedGames(page = 1, pageSize = 25) {
    return this.fetch('/games', {
      ordering: '-rating',
      page: page.toString(),
      page_size: pageSize.toString(),
    });
  }

  async getGenres() {
    try {
      const response = await this.fetch('/genres');
      if (response.results && Array.isArray(response.results)) {
        return response.results.map(genre => ({
          id: Number(genre.id),
          name: genre.name
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching RAWG genres:', error);
      return this.getAllGenres();
    }
  }

  // Obter plataformas
  async getPlatforms() {
    return this.fetch('/platforms');
  }

  // URLs de imagem
  getImageURL(path, size = 'crop/600/400') {
    if (!path) return null;
    return path.replace('/media/games/', `/media/${size}/games/`);
  }

  // Formatar dados do jogo para nosso formato
  formatGameData(game) {
    return {
      sourceId: game.id?.toString(),
      title: game.name,
      coverImage: this.getImageURL(game.background_image),
      releasePeriod: game.released ? {
        year: new Date(game.released).getFullYear(),
        month: new Date(game.released).getMonth() + 1
      } : undefined,
      averageRating: game.rating,
      ratingCount: game.ratings_count,
      metacritic: game.metacritic,
      playtime: game.playtime,
      platforms: game.platforms?.map(p => p.platform.name) || [],
      genres: game.genres?.map(genre => ({
        id: genre.id || 0,
        name: genre.name
      })) || []
    };
  }

  static getGenreById(id) {
    const genres = this.getAllGenres();
    const genre = genres.find(g => g.id === Number(id));
    return genre || { id: Number(id) || 0, name: 'Unknown' };
  }
}

// Instância global do cliente RAWG
export const rawgClient = new RAWGClient();