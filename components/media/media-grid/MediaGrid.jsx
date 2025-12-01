import React from 'react';
import MediaCard from '@/components/media/media-card/MediaCard'; // 🔥 Agora usa o componente unificado

const MediaGrid = ({ 
  media, 
  emptyMessage = "Nenhum item encontrado",
  onEditClick 
}) => {
  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🎬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600">
          Adicione alguns itens para começar a acompanhar seus entretenimentos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {media.map((item) => (
        <MediaCard 
          key={item.id} 
          item={item} 
          mediaType={item.mediaType + 's'} // Converte 'movie' para 'movies'
          onEditClick={onEditClick}
          isLibrary={true} // 🔥 Indica que é da biblioteca
        />
      ))}
    </div>
  );
};

export default MediaGrid;