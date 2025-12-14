// /entertrack/app/books/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent } from '@/components/ui';
import MediaGrid from '@/components/media/MediaGrid';
import MediaFilters from '@/components/media/MediaFilters';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';
import { Plus, RefreshCw } from 'lucide-react';
import InlineSearch from '@/components/search/InlineSearch';
import SearchResults from '@/components/search/SearchResults';
import { useGoogleBooksSearch } from '@/lib/hooks/use-google-books';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function BooksPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados do filtro
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');
  
  // Estados do formulário
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMedia, setEditingMedia] = React.useState(null);
  const [selectedBookData, setSelectedBookData] = React.useState(null);
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);
  
  // Estados da busca
  const [inlineSearchQuery, setInlineSearchQuery] = React.useState('');
  const { books: searchResults, loading: searchLoading, error: searchError } = useGoogleBooksSearch(inlineSearchQuery);
  
  // Usando o store atualizado
  const { 
    getMediaByType, 
    addMedia, 
    updateMedia, 
    deleteMedia,
    fetchMediaByType,
    loading: storeLoading,
    error: storeError,
    getStats,
    getFilteredMedia
  } = useMediaStore();

  // Carregar livros quando a página montar ou usuário mudar
  useEffect(() => {
    if (status === 'authenticated') {
      loadBooks();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const loadBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchMediaByType('book');
    } catch (error) {
      console.error('Error loading books:', error);
      setError(error.message || 'Erro ao carregar livros');
    } finally {
      setLoading(false);
    }
  };

  // Buscar livros da biblioteca
  const books = getMediaByType('book');
  
  // Filtrar livros
  const filteredBooks = getFilteredMedia({
    mediaType: 'book',
    status: statusFilter !== 'all' ? statusFilter : undefined,
    searchQuery: searchQuery
  });

  // Estatísticas
  const bookStats = {
    total: books.length,
    planned: books.filter(m => m.status === 'planned').length,
    inProgress: books.filter(m => m.status === 'in_progress').length,
    completed: books.filter(m => m.status === 'completed').length,
    dropped: books.filter(m => m.status === 'dropped').length,
  };

  // Handlers
  const handleAddBook = async (data) => {
    try {
      await addMedia(data);
      // Recarregar lista após adicionar
      await fetchMediaByType('book');
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  };

  const handleEditBook = async (data) => {
    try {
      if (editingMedia && editingMedia._id) {
        await updateMedia(editingMedia._id, data);
        setEditingMedia(null);
      }
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      if (confirm('Tem certeza que deseja excluir este livro?')) {
        await deleteMedia(id);
        await fetchMediaByType('book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Erro ao excluir livro: ' + error.message);
    }
  };

  const handleEditClick = (book) => {
    setEditingMedia(book);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMedia(null);
    setSelectedBookData(null);
    setManualCreateQuery(null);
  };

  const handleSelectBook = (bookData) => {
    setSelectedBookData(bookData);
    setManualCreateQuery(null);
    setIsFormOpen(true);
    setInlineSearchQuery('');
  };

  const handleManualCreate = () => {
    if (inlineSearchQuery.trim()) {
      setManualCreateQuery(inlineSearchQuery.trim());
      setSelectedBookData(null);
      setIsFormOpen(true);
      setInlineSearchQuery('');
    }
  };

  const handleInlineSearch = (query) => {
    setInlineSearchQuery(query);
  };

  const handleRefresh = () => {
    loadBooks();
  };

  // Se não estiver autenticado
  if (status === 'unauthenticated') {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto min-h-screen">
          <div className="text-center py-12 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Acesse sua conta para ver seus livros
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Faça login para acompanhar sua biblioteca pessoal de livros!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || status === 'loading') {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto min-h-screen">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="h-10 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-8"></div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
            
            {/* Grid skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="max-w-7xl mx-auto min-h-screen">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">Livros</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  loading={loading || storeLoading}
                  className={cn(
                    "opacity-50 hover:opacity-100 transition-opacity",
                    (loading || storeLoading) && "animate-spin"
                  )}
                  icon={RefreshCw}
                />
              </div>
              <p className="text-gray-300 mt-2">
                Acompanhe os livros que você leu, está lendo ou planeja ler.
              </p>
            </div>
            
            <div className="relative w-full sm:w-auto">
              <InlineSearch
                placeholder="Buscar livros no Google Books..."
                onSearch={handleInlineSearch}
                mediaType="book"
                className="w-full sm:w-96"
              >
                <SearchResults
                  results={searchResults}
                  loading={searchLoading}
                  error={searchError}
                  mediaType="book"
                  onSelect={handleSelectBook}
                  query={inlineSearchQuery}
                />
              </InlineSearch>
              {inlineSearchQuery && !searchLoading && searchResults.length === 0 && (
                <div className="absolute top-full mt-1 w-full">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                    <p className="text-gray-400 mb-3">
                      Não encontramos "{inlineSearchQuery}"
                    </p>
                    <Button
                      variant="outline"
                      icon={Plus}
                      onClick={handleManualCreate}
                      size="sm"
                      className="w-full"
                    >
                      Adicionar manualmente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{bookStats.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{bookStats.planned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Planejados</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{bookStats.inProgress}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Em Progresso</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{bookStats.completed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Concluídos</div>
              </CardContent>
            </Card>
            <Card variant="elevated" className="hover-lift">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{bookStats.dropped}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Abandonados</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <MediaFilters
            mediaType="book"
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            className="mb-6"
          />

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'livro encontrado' : 'livros encontrados'}
            </p>
            {bookStats.total > 0 && (
              <p className="text-sm text-gray-500">
                {Math.round((bookStats.completed / bookStats.total) * 100)}% concluído
              </p>
            )}
          </div>

          {/* Books Grid */}
          <MediaGrid
            media={filteredBooks}
            mediaType="book"
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteBook}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? "Nenhum livro encontrado com esses filtros"
                : "Nenhum livro adicionado ainda. Busque acima para começar!"
            }
            viewMode={viewMode}
          />
        </div>
      </div>

      <MediaFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        mediaType="book"
        initialData={editingMedia || undefined}
        externalData={selectedBookData}
        manualCreateQuery={manualCreateQuery}
        onSubmit={editingMedia ? handleEditBook : handleAddBook}
      />
    </>
  );
}