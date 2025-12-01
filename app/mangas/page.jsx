'use client';

import React from 'react';
import { Layout } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';
import MediaGrid from '@/components/media/media-grid/MediaGrid';
import MediaFilters from '@/components/media/media-filters/MediaFilters';
import MediaFormModal from '@/components/forms/media-form/MediaFormModal';
import { useMediaStore } from '@/store/media-store';
import { Plus } from 'lucide-react';
import MyAnimeListSearch from '@/components/search/MyAnimeListSearch';

export default function MangasPage() {
  const { getMediaByType, addMedia, updateMedia } = useMediaStore();
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [manualCreateQuery, setManualCreateQuery] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMedia, setEditingMedia] = React.useState(null);
  const [isMangaSearchOpen, setIsMangaSearchOpen] = React.useState(false);
  const [selectedMangaData, setSelectedMangaData] = React.useState(null);
  const mangas = getMediaByType('manga');

  const filteredMangas = mangas.filter(manga => {
    const matchesStatus = statusFilter === 'all' || manga.status === statusFilter;
    const matchesSearch = manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (manga.genres && manga.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: mangas.length,
    planned: mangas.filter(m => m.status === 'planned').length,
    inProgress: mangas.filter(m => m.status === 'in_progress').length,
    completed: mangas.filter(m => m.status === 'completed').length,
    dropped: mangas.filter(m => m.status === 'dropped').length,
  };

  const handleAddManga = async (data) => {
    await addMedia({
      ...data,
      userId: 'user-1',
      mediaType: 'manga',
    });
  };

  const handleEditManga = async (data) => {
    if (editingMedia) {
      await updateMedia(editingMedia.id, data);
      setEditingMedia(null);
    }
  };

  const handleEditClick = (manga) => {
    setEditingMedia(manga);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMedia(null);
  };

  const handleSelectManga = (mangaData) => {
    setSelectedMangaData(mangaData);
    setManualCreateQuery(null);
    setIsFormOpen(true);
  };

  const handleManualCreate = (query) => {
    setManualCreateQuery(query);
    setSelectedMangaData(null);
    setIsFormOpen(true);
  };

  const handleBackToSearch = () => {
    setIsFormOpen(false);
    setSelectedMangaData(null);
    setIsMangaSearchOpen(true);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Mangás</h1>
              <p className="text-gray-300 mt-2">
                Acompanhe os mangás que você leu, está lendo ou planeja ler.
              </p>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsMangaSearchOpen(true)}
            >
              Buscar Mangá
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.planned}</div>
                <div className="text-sm text-gray-600">Planejados</div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                <div className="text-sm text-gray-600">Em Progresso</div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Concluídos</div>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.dropped}</div>
                <div className="text-sm text-gray-600">Abandonados</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <MediaFilters
            mediaType="manga"
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
            <p className="text-gray-600">
              {filteredMangas.length} {filteredMangas.length === 1 ? 'mangá encontrado' : 'mangás encontrados'}
            </p>
          </div>

          {/* Mangás Grid */}
          <MediaGrid
            media={filteredMangas}
            onEditClick={handleEditClick}
            emptyMessage={
              searchQuery || statusFilter !== 'all'
                ? "Nenhum mangá encontrado com esses filtros"
                : "Nenhum mangá adicionado ainda"
            }
          />
        </div>
      </div>

      <MyAnimeListSearch
        isOpen={isMangaSearchOpen}
        onClose={() => setIsMangaSearchOpen(false)}
        onSelectMedia={handleSelectManga}
        onManualCreate={handleManualCreate}
        mediaType="manga"
      />
      <MediaFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedMangaData(null);
          setManualCreateQuery(null);
        }}
        onBackToSearch={selectedMangaData ? handleBackToSearch : undefined} 
        mediaType="manga"
        initialData={editingMedia || undefined}
        externalData={selectedMangaData}
        manualCreateQuery={manualCreateQuery}
        onSubmit={editingMedia ? handleEditManga : handleAddManga}
      />
    </Layout>
  );
}