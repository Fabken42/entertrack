// app/games/page.jsx
'use client';

import { Gamepad } from 'lucide-react';
import { useRAWGSearch } from '@/lib/hooks/use-rawg-games';
import { useMediaStore } from '@/store/media-store';
import MediaPageLayout from '@/components/layout/MediaPageLayout';

export default function GamesPage() {
  const { updateMedia, addMedia } = useMediaStore();

  const handleEditSubmit = async (data) => {
    try {
      // Verificar se temos o ID do UserMedia no objeto data
      if (data.userMediaId) {
        const updatePayload = {
          status: data.status,
          mediaType: 'game',
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

  const handleAddGame = async (data) => {
    try {
      await addMedia(data);
      return { success: true };
    } catch (error) {
      console.error('Error adding game:', error);
      return { success: false, error: error.message };
    }
  };

  const editModalInitialData = (editingItem) => ({
    // Adicionar userMediaId explicitamente
    userMediaId: editingItem._id,
    genres: editingItem.mediaCacheId?.essentialData?.genres,
    title: editingItem.mediaCacheId?.essentialData?.title,
    description: editingItem.mediaCacheId?.essentialData?.description,
    coverImage: editingItem.mediaCacheId?.essentialData?.coverImage,
    releaseYear: editingItem.mediaCacheId?.essentialData?.releaseYear,
    userRating: editingItem.userRating || null,
    hours: editingItem.progress?.hours || 0,
    personalNotes: editingItem.personalNotes || '',
    status: editingItem.status,
    progress: editingItem.progress || {},
    apiRating: editingItem.mediaCacheId?.essentialData?.averageRating,
    apiVoteCount: editingItem.mediaCacheId?.essentialData?.ratingCount,
    metacritic: editingItem.mediaCacheId?.essentialData?.metacritic,
    platforms: editingItem.mediaCacheId?.essentialData?.platforms,
  });

  return (
    <MediaPageLayout
      mediaType="game"
      Icon={Gamepad}
      gradientFrom="from-orange-500/20"
      gradientTo="to-red-500/20"
      iconColor="text-orange-400"
      placeholderText="Buscar jogos no RAWG..."
      pageTitle={
        <>
          Meus <span className="text-gradient-primary">Jogos</span>
        </>
      }
      pageDescription="Gerencie sua lista de jogos, acompanhe progresso e avaliações"
      searchHook={useRAWGSearch}
      emptyStateIcon="🎮"
      editModalInitialData={editModalInitialData}
      handleEditSubmit={handleEditSubmit}
      handleAddMedia={handleAddGame}
    />
  );
}