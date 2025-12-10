import React from 'react';
import MediaCard from '@/components/media/media-card/MediaCard';
import { Film, Tv, BookOpen, GamepadIcon, Book, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const MediaGrid = ({ 
  media, 
  emptyMessage = "Nenhum item encontrado",
  onEditClick,
  mediaType = 'media'
}) => {
  if (media.length === 0) {
    return (
      <div className="text-center py-16 fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl mb-6">
          <Sparkles className="w-10 h-10 text-white/40" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-white/60 max-w-md mx-auto">
          Comece adicionando seus {mediaType}s favoritos para acompanhar seu progresso e descobrir novos conteúdos.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6",
      "animate-fade-in"
    )}>
      {media.map((item, index) => (
        <div 
          key={item.id} 
          className="animate-in fade-in-90 slide-in-from-bottom-10"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <MediaCard 
            item={item} 
            mediaType={item.mediaType + 's'} // Converte 'movie' para 'movies'
            onEditClick={onEditClick}
            isLibrary={true} // 🔥 Indica que é da biblioteca
          />
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;