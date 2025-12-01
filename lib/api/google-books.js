// /entertrack/lib/api/google-books.js

class GoogleBooksClient {
  constructor() {
    this.baseURL = 'https://www.googleapis.com/books/v1';
  }

  async fetch(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);

    // Adicionar parâmetros
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Buscar livros
  async searchBooks(query, maxResults = 20, startIndex = 0) {
    return this.fetch('/volumes', {
      q: query,
      maxResults: maxResults.toString(),
      startIndex: startIndex.toString(),
      langRestrict: 'pt', // Restringir para português quando possível
    });
  }

  // Detalhes do livro
  async getBookDetails(bookId) {
    return this.fetch(`/volumes/${bookId}`);
  }

  // Livros por categoria
  async getBooksByCategory(category, maxResults = 20) {
    return this.fetch('/volumes', {
      q: `subject:${category}`,
      maxResults: maxResults.toString(),
    });
  }

  // Livros mais populares
  async getPopularBooks(maxResults = 20) {
    return this.fetch('/volumes', {
      q: 'subject:bestseller',
      maxResults: maxResults.toString(),
      orderBy: 'relevance',
    });
  }

  // URLs de imagem
  getImageURL(imageLinks, size = 'thumbnail') {
    if (!imageLinks) return null;

    // Prioridade de tamanhos: thumbnail -> small -> medium -> large
    const sizes = ['thumbnail', 'small', 'medium', 'large'];
    for (const sizeOption of sizes) {
      if (imageLinks[sizeOption]) {
        return imageLinks[sizeOption].replace('http://', 'https://');
      }
    }

    return imageLinks.thumbnail || null;
  }

  // Formatar dados do livro para nosso formato
  formatBookData(book) {
    const volumeInfo = book.volumeInfo;
    const isbn = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
      volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier;

    return {
      id: book.id,
      title: volumeInfo.title,
      subtitle: volumeInfo.subtitle,
      authors: volumeInfo.authors || [],
      description: volumeInfo.description,
      imageUrl: this.getImageURL(volumeInfo.imageLinks),
      publishedDate: volumeInfo.publishedDate,
      pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories || [],
      publisher: volumeInfo.publisher,
      isbn: isbn,
      language: volumeInfo.language,
      averageRating: volumeInfo.averageRating,
      ratingsCount: volumeInfo.ratingsCount,
      previewLink: volumeInfo.previewLink,
      infoLink: volumeInfo.infoLink
    };
  }

  // Extrair ano de publicação
  extractYear(publishedDate) {
    if (!publishedDate) return undefined;
    const year = new Date(publishedDate).getFullYear();
    return isNaN(year) ? undefined : year;
  }

  async getGenres() {
    // Categorias populares do Google Books
    const genres = [
      { id: 'fiction', name: 'Ficção' },
      { id: 'fantasy', name: 'Fantasia' },
      { id: 'romance', name: 'Romance' },
      { id: 'mystery', name: 'Mistério' },
      { id: 'science', name: 'Ciência' },
      { id: 'history', name: 'História' },
      { id: 'biography', name: 'Biografia' },
      { id: 'business', name: 'Negócios' },
      { id: 'young-adult', name: 'Young Adult' },
      { id: 'children', name: 'Infantil' },
      { id: 'thriller', name: 'Suspense' },
      { id: 'horror', name: 'Terror' },
      { id: 'science-fiction', name: 'Ficção Científica' },
      { id: 'self-help', name: 'Autoajuda' }
    ];

    return genres;
  }
}

// Instância global do cliente Google Books
export const googleBooksClient = new GoogleBooksClient();