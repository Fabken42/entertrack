// /entertrack/components/search/GoogleBooksSearch.jsx

'use client';

import React, { useState } from 'react';
import { useGoogleBooksSearch } from '@/lib/hooks/use-google-books';
import { Modal, Button, Input } from '@/components/ui';
import { Search, X, Book, Star, Plus, User, Hash } from 'lucide-react';
import { googleBooksClient } from '@/lib/api/google-books';

const GoogleBooksSearch = ({ 
  isOpen, 
  onClose, 
  onSelectBook,
  onManualCreate 
}) => {
  const [query, setQuery] = useState('');
  const { books, loading, error } = useGoogleBooksSearch(query);

  const handleSelectBook = (book) => {
    const mediaData = {
      externalId: book.id,
      title: book.title,
      description: book.description,
      imageUrl: book.imageUrl,
      releaseYear: googleBooksClient.extractYear(book.publishedDate),
      genres: book.categories || [],
      mediaType: 'book',
      apiRating: book.averageRating,
      apiVoteCount: book.ratingsCount,
      // Campos específicos para livros
      metadata: {
        authors: book.authors,
        subtitle: book.subtitle,
        pageCount: book.pageCount,
        publisher: book.publisher,
        isbn: book.isbn,
        language: book.language,
        previewLink: book.previewLink
      }
    };
    
    onSelectBook(mediaData);
    onClose();
  };

  const handleManualCreate = () => {
    if (query.trim()) {
      onManualCreate(query);
      onClose();
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  const formatRating = (rating) => {
    if (!rating) return 'N/A';
    return rating.toFixed(1);
  };

  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Autor desconhecido';
    return authors.slice(0, 2).join(', ');
  };

  const formatPageCount = (pageCount) => {
    if (!pageCount) return 'N/A';
    return `${pageCount} páginas`;
  };

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Buscar Livros"
    size="xl"
  >
    <div className="p-6 bg-gray-800">
      {/* Barra de busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Buscar livros por título, autor ou ISBN..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Resultados */}
      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Buscando livros...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && query && (
          <>
            {/* Livros encontrados */}
            {books.length > 0 && (
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                  <Book className="w-5 h-5" />
                  Livros encontrados ({books.length})
                </h3>
                <div className="space-y-3">
                  {books.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => handleSelectBook(book)}
                      className="w-full flex items-start gap-4 p-4 rounded-lg border border-gray-600 hover:border-blue-500 hover:bg-gray-700 transition-colors text-left"
                    >
                      {book.imageUrl ? (
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                          <Book className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-lg">{book.title}</h4>
                            {book.subtitle && (
                              <p className="text-sm text-gray-400">{book.subtitle}</p>
                            )}
                          </div>
                          {book.averageRating > 0 && (
                            <div className="flex items-center gap-1 bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full text-sm font-medium">
                              <Star className="w-4 h-4 fill-current" />
                              <span>{formatRating(book.averageRating)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-2">
                          {book.authors && book.authors.length > 0 && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {formatAuthors(book.authors)}
                            </span>
                          )}
                          {book.publishedDate && (
                            <span>
                              {googleBooksClient.extractYear(book.publishedDate)}
                            </span>
                          )}
                          {book.pageCount && (
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {formatPageCount(book.pageCount)}
                            </span>
                          )}
                        </div>
                        
                        {book.categories && book.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {book.categories.slice(0, 3).map((category, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded-full"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {book.description && (
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {book.description.replace(/<[^>]*>/g, '')}
                          </p>
                        )}
                        
                        {/* Informações da API */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {book.averageRating > 0 && (
                            <span>
                              Nota Google: <strong className="text-gray-400">{book.averageRating.toFixed(1)}/5</strong>
                            </span>
                          )}
                          {book.ratingsCount > 0 && (
                            <span>
                              <strong className="text-gray-400">{book.ratingsCount.toLocaleString()}</strong> avaliações
                            </span>
                          )}
                          {book.publisher && (
                            <span>
                              <strong className="text-gray-400">{book.publisher}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Opção de criação manual */}
            <div className="border-t border-gray-600 pt-4">
              <div className="text-center">
                <p className="text-gray-400 mb-3">
                  {books.length === 0 
                    ? `Não encontramos "${query}" no Google Books.`
                    : `Não encontrou o livro que procura?`
                  }
                </p>
                <Button
                  variant="outline"
                  icon={Plus}
                  onClick={handleManualCreate}
                >
                  {books.length === 0 
                    ? `Adicionar "${query}" manualmente` 
                    : 'Criar livro manualmente'
                  }
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Instruções */}
        {!query && (
          <div className="text-center py-8 text-gray-400">
            Digite o título, autor ou ISBN de um livro para buscar no Google Books
          </div>
        )}
      </div>
    </div>
  </Modal>
);
};

export default GoogleBooksSearch;