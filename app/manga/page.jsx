// app/mangas/page.jsx
'use client';

import { BookOpen } from 'lucide-react';
import { useMyAnimeListSearch } from '@/lib/hooks/use-myanimelist';
import { useMediaStore } from '@/store/media-store';
import MediaPageLayout from '@/components/layout/MediaPageLayout';

export default function MangasPage() {
  const { updateMedia, addMedia } = useMediaStore();

  const handleEditSubmit = async (data) => {
    try {
      // Verificar se temos o ID do UserMedia no objeto data
      if (data.userMediaId) {
        const updatePayload = {
          status: data.status,
          mediaType: 'manga',
          userRating: data.userRating || null,
          personalNotes: data.personalNotes || '',
          progress: data.progress ? {
            volumes: data.progress.volumes || 0,
            chapters: data.progress.chapters || 0,
            lastUpdated: new Date()
          } : undefined,
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

  const handleAddManga = async (data) => {
    try {
      await addMedia(data);
      return { success: true };
    } catch (error) {
      console.error('Error adding manga:', error);
      return { success: false, error: error.message };
    }
  };

  const editModalInitialData = (editingItem) => ({
    // Adicionar userMediaId explicitamente
    userMediaId: editingItem._id,
    genres: editingItem.mediaCacheId?.essentialData?.genres,
    volumes: editingItem.mediaCacheId?.essentialData?.volumes,
    chapters: editingItem.mediaCacheId?.essentialData?.chapters,
    authors: editingItem.mediaCacheId?.essentialData?.authors,
    sourceId: editingItem.mediaCacheId?.sourceId,
    title: editingItem.mediaCacheId?.essentialData?.title,
    description: editingItem.mediaCacheId?.essentialData?.description,
    category: editingItem.mediaCacheId?.essentialData?.category,
    coverImage: editingItem.mediaCacheId?.essentialData?.coverImage,
    releasePeriod: editingItem.mediaCacheId?.essentialData?.releasePeriod,
    userRating: editingItem.userRating || null,
    personalNotes: editingItem.personalNotes || '',
    status: editingItem.status,
    progress: {
      currentChapter: editingItem.progress?.chapters || 0,
      currentVolume: editingItem.progress?.volumes || 0,
    }
  });

  return (
    <MediaPageLayout
      mediaType="manga"
      Icon={BookOpen}
      gradientFrom="from-blue-500/20"
      gradientTo="to-cyan-500/20"
      iconColor="text-blue-400"
      placeholderText="Buscar mangás no MyAnimeList..."
      pageTitle={
        <>
          Meus <span className="text-gradient-primary">Mangás</span>
        </>
      }
      pageDescription="Gerencie sua lista de mangás, acompanhe progresso e avaliações"
      searchHook={useMyAnimeListSearch}
      emptyStateIcon="📚"
      editModalInitialData={editModalInitialData}
      handleEditSubmit={handleEditSubmit}
      handleAddMedia={handleAddManga}
    />
  );
}