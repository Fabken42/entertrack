// app/series/page.jsx
'use client';

import { Tv } from 'lucide-react';
import { useTMDBSearch } from '@/lib/hooks/use-tmdb';
import { useMediaStore } from '@/store/media-store';
import MediaPageLayout from '@/components/layout/MediaPageLayout';

export default function SeriesPage() {
  const { updateMedia, addMedia } = useMediaStore();

  const handleEditSubmit = async (data) => {
    try {
      // Verificar se temos o ID do UserMedia no objeto data
      if (data.userMediaId) {
        const updatePayload = {
          status: data.status,
          mediaType: 'series',
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

  const handleAddSeries = async (data) => {
    try {
      await addMedia(data);
      return { success: true };
    } catch (error) {
      console.error('Error adding series:', error);
      return { success: false, error: error.message };
    }
  };

  const editModalInitialData = (editingItem) => ({
    // Adicionar userMediaId explicitamente
    userMediaId: editingItem._id,
    genres: editingItem.mediaCacheId?.essentialData?.genres,
    sourceId: editingItem.mediaCacheId?.sourceId,
    title: editingItem.mediaCacheId?.essentialData?.title,
    description: editingItem.mediaCacheId?.essentialData?.description,
    seasons: editingItem.mediaCacheId?.essentialData?.seasons,
    episodes: editingItem.mediaCacheId?.essentialData?.episodes,
    episodesPerSeason: editingItem.mediaCacheId?.essentialData?.episodesPerSeason,
    category: editingItem.mediaCacheId?.essentialData?.category,
    coverImage: editingItem.mediaCacheId?.essentialData?.coverImage,
    releasePeriod: editingItem.mediaCacheId?.essentialData?.releasePeriod,
    userRating: editingItem.userRating || null,
    personalNotes: editingItem.personalNotes || '',
    status: editingItem.status,
    progress: {
      seasons: editingItem.progress?.seasons || 1,
      episodes: editingItem.progress?.episodes || 0,
    }
  });

  return (
    <MediaPageLayout
      mediaType="series"
      Icon={Tv}
      gradientFrom="from-purple-500/20"
      gradientTo="to-pink-500/20"
      iconColor="text-purple-400"
      placeholderText="Buscar séries no TMDB..."
      pageTitle={
        <>
          Minhas <span className="text-gradient-primary">Séries</span>
        </>
      }
      pageDescription="Gerencie sua lista de séries, acompanhe temporadas e episódios"
      searchHook={useTMDBSearch}
      emptyStateIcon="📺"
      editModalInitialData={editModalInitialData}
      handleEditSubmit={handleEditSubmit}
      handleAddMedia={handleAddSeries}
    />
  );
}