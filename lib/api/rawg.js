// /entertrack/lib/api/rawg.js

class RAWGClient {
  constructor() {
    this.apiKey = process.env.RAWG_API_KEY;
    this.baseURL = 'https://api.rawg.io/api';
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

  // Buscar jogos
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

  // Obter gêneros
  async getGenres() {
    return this.fetch('/genres');
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
      id: game.id,
      name: game.name,
      description: game.description_raw || game.description,
      imageUrl: this.getImageURL(game.background_image),
      released: game.released,
      rating: game.rating,
      ratingTop: game.rating_top,
      ratingsCount: game.ratings_count,
      metacritic: game.metacritic,
      playtime: game.playtime,
      platforms: game.platforms?.map(p => p.platform.name) || [],
      genres: game.genres?.map(genre => genre.name) || [],
      tags: game.tags?.map(tag => tag.name) || [],
      developers: game.developers?.map(dev => dev.name) || [],
      publishers: game.publishers?.map(pub => pub.name) || [],
      esrbRating: game.esrb_rating?.name,
      website: game.website,
      updated: game.updated
    };
  }
}

// Instância global do cliente RAWG
export const rawgClient = new RAWGClient();