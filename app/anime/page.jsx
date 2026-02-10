// app/animes/page.jsx
'use client';

import { Tv2 } from 'lucide-react';
import { useMyAnimeListSearch } from '@/lib/hooks/use-myanimelist';
import { useMediaStore } from '@/store/media-store';
import MediaPageLayout from '@/components/layout/MediaPageLayout';

export default function AnimesPage() {
  const { updateMedia, addMedia } = useMediaStore();

  const handleEditSubmit = async (data) => {
    try {
      if (data.userMediaId) {
        const updatePayload = {
          status: data.status,
          mediaType: 'anime',
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

  const handleAddAnime = async (data) => {
    try {
      await addMedia(data);
      return { success: true };
    } catch (error) {
      console.error('Error adding anime:', error);
      return { success: false, error: error.message };
    }
  };

  const editModalInitialData = (editingItem) => ({
    userMediaId: editingItem._id,
    genres: editingItem.mediaCacheId?.essentialData?.genres,
    episodes: editingItem.mediaCacheId?.essentialData?.episodes,
    studios: editingItem.mediaCacheId?.essentialData?.studios,
    sourceId: editingItem.mediaCacheId?.sourceId,
    title: editingItem.mediaCacheId?.essentialData?.title,
    description: editingItem.mediaCacheId?.essentialData?.description,
    category: editingItem.mediaCacheId?.essentialData?.category,
    coverImage: editingItem.mediaCacheId?.essentialData?.coverImage,
    releasePeriod: editingItem.mediaCacheId?.essentialData?.releasePeriod,
    averageRating: editingItem.mediaCacheId?.essentialData?.averageRating,
    ratingCount: editingItem.mediaCacheId?.essentialData?.ratingCount,
    members: editingItem.mediaCacheId?.essentialData?.members,
    popularity: editingItem.mediaCacheId?.essentialData?.popularity,
    userRating: editingItem.userRating || null,
    personalNotes: editingItem.personalNotes || '',
    status: editingItem.status,
    progress: {
      currentEpisode: editingItem.progress?.episodes || 0,
    }
  });

  return (
    <MediaPageLayout
      mediaType="anime"
      Icon={Tv2}
      mediaBg='bg-red-500/20'
      iconColor="text-red-400"
      placeholderText="Buscar animes no MyAnimeList..."
      pageTitle={
        <>
          Meus <span className="text-gradient-primary">Animes</span>
        </>
      }
      pageDescription="Gerencie sua lista de animes, acompanhe progresso e avaliações"
      searchHook={useMyAnimeListSearch}
      emptyStateIcon="📺"
      editModalInitialData={editModalInitialData}
      handleEditSubmit={handleEditSubmit}
      handleAddMedia={handleAddAnime}
    />
  );
}