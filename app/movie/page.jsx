// app/movies/page.jsx
'use client';

import { Film } from 'lucide-react';
import { useTMDBSearch } from '@/lib/hooks/use-tmdb';
import { useMediaStore } from '@/store/media-store';
import MediaPageLayout from '@/components/layout/MediaPageLayout';

export default function MoviesPage() {
  const { updateMedia, addMedia } = useMediaStore();

  const handleEditSubmit = async (data) => {
    try {
      // Verificar se temos o ID do UserMedia no objeto data
      if (data.userMediaId) {
        const updatePayload = {
          status: data.status,
          mediaType: 'movie',
          userRating: data.userRating || null,
          personalNotes: data.personalNotes || '',
          progress: data.progress,
        };

        await updateMedia(data.userMediaId, updatePayload);
        return { success: true };
      } else {
        console.error('❌ ID do UserMedia não encontrado:', { data });
        return { success: false, error: 'ID não encontrado' };
      }
    } catch (error) {
      console.error('Error updating media:', error);
      return { success: false, error: error.message };
    }
  };

  const handleAddMovie = async (data) => {
    try {
      await addMedia(data);
      return { success: true };
    } catch (error) {
      console.error('Error adding movie:', error);
      return { success: false, error: error.message };
    }
  };

  const editModalInitialData = (editingItem) => ({
    // Adicionar userMediaId explicitamente
    userMediaId: editingItem._id,
    genres: editingItem.mediaCacheId?.essentialData?.genres,
    runtime: editingItem.mediaCacheId?.essentialData?.runtime,
    sourceId: editingItem.mediaCacheId?.sourceId,
    title: editingItem.mediaCacheId?.essentialData?.title,
    description: editingItem.mediaCacheId?.essentialData?.description,
    category: editingItem.mediaCacheId?.essentialData?.category,
    coverImage: editingItem.mediaCacheId?.essentialData?.coverImage,
    releaseYear: editingItem.mediaCacheId?.essentialData?.releaseYear,
    userRating: editingItem.userRating || null,
    personalNotes: editingItem.personalNotes || '',
    status: editingItem.status,
    progress: {
      currentMinutes: editingItem.progress?.minutes || 0,
    }
  });

  return (
    <MediaPageLayout
      mediaType="movie"
      Icon={Film}
      gradientFrom="from-blue-500/20"
      gradientTo="to-teal-500/20"
      iconColor="text-blue-400"
      placeholderText="Buscar filmes no TMDB..."
      pageTitle={
        <>
          Meus <span className="text-gradient-primary">Filmes</span>
        </>
      }
      pageDescription="Gerencie sua lista de filmes, acompanhe progresso e avaliações"
      searchHook={useTMDBSearch}
      emptyStateIcon="🎬"
      editModalInitialData={editModalInitialData}
      handleEditSubmit={handleEditSubmit}
      handleAddMedia={handleAddMovie}
    />
  );
}