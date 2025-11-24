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
  onSubmit,
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
      case 'manga': // ✅ ADICIONADO
        return <MangaForm {...formProps} />;
      case 'book':
        return <BookForm {...formProps} />;
      case 'game':
        return <GameForm {...formProps} />;
      default:
        return (
          <div className="p-6">
            <p className="text-center text-gray-600 py-8">
              Formulário para {mediaType} não disponível
            </p>
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
      manga: 'Mangá', // ✅ ADICIONADO
      book: 'Livro',
      game: 'Game',
    };
    return `${action} ${typeNames[mediaType] || mediaType}`;
  };

 return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={getTitle()}
    size="lg"
  >
    <div className="p-6 max-h-[80vh] overflow-y-auto bg-gray-800">
      {getFormComponent()}
    </div>
  </Modal>
);
};

export default MediaFormModal;