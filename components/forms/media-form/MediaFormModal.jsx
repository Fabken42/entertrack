'use client';

import React from 'react';
import { Modal } from '@/components/ui';
import MovieForm from './MovieForm';
import SeriesForm from './SeriesForm';
import AnimeForm from './AnimeForm';
import MangaForm from './MangaForm';
import BookForm from './BookForm';
import GameForm from './GameForm';

const MediaFormModal = ({
  isOpen,
  onClose,
  mediaType,
  initialData,
  externalData,
  manualCreateQuery,
  onSubmit
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFormComponent = () => {
    const formProps = {
      initialData,
      externalData,
      manualCreateQuery,
      onSubmit: handleSubmit,
      onCancel: onClose,
      loading,
    };

    switch (mediaType) {
      case 'movie':
        return <MovieForm {...formProps} />;
      case 'series':
        return <SeriesForm {...formProps} />;
      case 'anime':
        return <AnimeForm {...formProps} />;
      case 'manga': 
        return <MangaForm {...formProps} />;
      case 'book':
        return <BookForm {...formProps} />;
      case 'game':
        return <GameForm {...formProps} />;
      default:
        return (
          <div className="text-center py-12 space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-full">
              <span className="text-2xl">📁</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Formulário não disponível</h3>
              <p className="text-white/60">Para o tipo: {mediaType}</p>
            </div>
          </div>
        );
    }
  };

  const getTitle = () => {
    const action = initialData ? 'Editar' : 'Adicionar';
    const typeNames = {
      movie: 'Filme',
      series: 'Série',
      anime: 'Anime',
      manga: 'Mangá', 
      book: 'Livro',
      game: 'Jogo',
    };
    return `${action} ${typeNames[mediaType] || mediaType}`;
  };

  const getModalSize = () => {
    if (externalData || initialData) return 'xl';
    if (manualCreateQuery) return 'lg';
    return 'md';
  };

 return (
  <Modal
    isOpen={isOpen} 
    onClose={onClose}
    title={getTitle()}
    size={getModalSize()}
  >
    <div className="p-6 animate-fade-in">
      {getFormComponent()}
    </div>
  </Modal>
);
};

export default MediaFormModal;