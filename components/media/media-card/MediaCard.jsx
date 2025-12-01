import React from 'react';
import Card from './Card';
import { CardContent } from './Card';
import Button from '../../ui/button/Button';
import { Star, Users, TrendingUp, Edit } from 'lucide-react';

export default function MediaCard({
  item,
  mediaType,
  viewMode,
  onAddToLibrary,
  onEditClick,
  isLibrary = false // Novo prop para identificar se é da biblioteca
}) {
  const formatNumber = (num) => {
    if (!num || num === 0) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPopularity = (popularity) => {
    if (!popularity || popularity === 0) return 'N/A';
    return `#${popularity.toLocaleString('pt-BR')}`;
  };

  const formatRating = (rating) => {
    if (!rating || rating === 0) return null;

    // Converte rating para número (caso venha como string da API)
    const numericRating = Number(rating);
    if (isNaN(numericRating)) return null;

    // Para animes e mangás, converte de base 10 para base 5
    if (mediaType === 'animes' || mediaType === 'mangas' || mediaType === 'movies' || mediaType === 'series') {
      return {
        display: (numericRating / 2).toFixed(1), // Converte 10 → 5
        max: 5,
        original: numericRating.toFixed(1)
      };
    }

    return {
      display: numericRating.toFixed(1),
      max: 5,
      original: numericRating.toFixed(1)
    };
  };

  const getRatingColor = (rating, maxRating = 10) => {
    if (!rating || rating === 0) return 'text-gray-500';

    // Ajusta a porcentagem baseado no rating máximo
    const adjustedRating = mediaType === 'animes' || mediaType === 'mangas'
      ? (rating / 2) // Já convertido para base 5
      : rating;

    const percentage = (adjustedRating / maxRating) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // Função auxiliar para verificar se deve mostrar contagem
  const shouldShowCount = (count) => {
    return count && count > 0;
  };

  // Função para formatar capítulos/volumes (mostrar '?' para valores 0 em obras não finalizadas)
  const formatChaptersVolumes = (value, status) => {
    if (value === 0 && status !== 'finished') return '?';
    return value;
  };

  // Funções para biblioteca (se isLibrary = true)
  const getStatusColor = (status) => {
    switch (status) {
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'planned': return 'Planejado';
      case 'in_progress': return 'Em Progresso';
      case 'completed': return 'Concluído';
      case 'dropped': return 'Abandonado';
      default: return status;
    }
  };

  const handleCardClick = () => {
    if (!isLibrary && onAddToLibrary) {
      onAddToLibrary(item);
    }
  };

  if (viewMode === 'list') {
    const ratingInfo = formatRating(item.rating);

    return (
      <div
        className="flex items-start gap-4 p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/5 transition-colors bg-card cursor-pointer active:scale-[0.98]"
        onClick={handleCardClick} // 🔥 ADICIONE ESTA LINHA
      >
        <img
          src={item.imageUrl || '/images/icons/placeholder-image.png'}
          alt={item.title}
          className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
          onError={(e) => {
            e.target.src = '/images/icons/placeholder-image.png';
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg mb-1">{item.title}</h3>

          {/* ... (restante do conteúdo do list view permanece igual) */}

          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* 🔥 REMOVA O BOTÃO "ADICIONAR" E MANTENHA APENAS O BOTÃO EDITAR PARA BIBLIOTECA */}
        {isLibrary && onEditClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // 🔥 IMPEDE QUE O CLIQUE PROPAGUE PARA O CARD
              onEditClick(item);
            }}
            icon={Edit}
          >
            Editar
          </Button>
        )}
      </div>
    );
  }

  // View Mode Grid
  const ratingInfo = formatRating(item.rating);

  return (
    <Card
      variant="elevated"
      className="hover:shadow-lg transition-all duration-200 h-full flex flex-col group bg-card border-border cursor-pointer active:scale-[0.98] hover:border-primary/30"
      onClick={handleCardClick} 
    >
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Imagem */}
        <div className="relative mb-4">
          <img
            src={item.imageUrl || '/images/icons/placeholder-image.png'}
            alt={item.title}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = '/images/icons/placeholder-image.png';
            }}
          />

          {/* Badge de avaliação */}
          {ratingInfo && (
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-card/90 border border-border ${getRatingColor(item.rating, ratingInfo.max)}`}>
              ⭐ {ratingInfo.display}/{ratingInfo.max}
            </div>
          )}

          {/* Status da biblioteca */}
          {isLibrary && item.status && (
            <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
              {getStatusLabel(item.status)}
            </div>
          )}

          {/* Botão Editar para biblioteca */}
          {isLibrary && onEditClick && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // 🔥 IMPEDE QUE O CLIQUE PROPAGUE PARA O CARD
                onEditClick(item);
              }}
              className="absolute bottom-2 right-2 p-1 bg-card/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-card border border-border transition-all"
              title="Editar"
            >
              <Edit className="w-4 h-4 text-foreground" />
            </button>
          )}
        </div>

        {/* Título */}
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 transition-colors">
          {item.title}
        </h3>

        {/* Informações básicas */}
        <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
          {item.releaseYear && (
            <span>{item.releaseYear}</span>
          )}
          {/* Informações específicas por tipo */}
          {mediaType === 'animes' && item.episodes && (
            <span>• {item.episodes} eps</span>
          )}
          {mediaType === 'mangas' && item.volumes && (
            <span>• {formatChaptersVolumes(item.volumes, item.status)} vol</span>
          )}
          {mediaType === 'mangas' && item.chapters && (
            <span>• {formatChaptersVolumes(item.chapters, item.status)} cap</span>
          )}
          {mediaType === 'books' && item.pageCount && (
            <span>• {item.pageCount} pág</span>
          )}
        </div>

        {/* Autores para mangás */}
        {mediaType === 'mangas' && item.authors && item.authors.length > 0 && item.authors.some(author => author) && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground line-clamp-1">
              por <span className="font-medium text-foreground">
                {item.authors.filter(author => author && author.trim() !== '').join(', ')}
              </span>
            </p>
          </div>
        )}

        {/* Estatísticas detalhadas */}
        <div className="space-y-2 mb-4 flex-1">
          {/* Número de membros */}
          {shouldShowCount(item.members) && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Membros:</span>
              <span className="font-medium text-foreground">{formatNumber(item.members)}</span>
            </div>
          )}
          {shouldShowCount(item.ratingsCount) && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Avaliações:</span>
              <span className="font-medium text-foreground">{formatNumber(item.ratingsCount)}</span>
            </div>
          )}
          {shouldShowCount(item.popularity) && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Ranking:</span>
              <span className="font-medium text-foreground">{formatPopularity(item.popularity)}</span>
            </div>
          )}
          {item.metacritic && item.metacritic > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Metacritic:</span>
              <span className="font-medium text-green-400">{item.metacritic}</span>
            </div>
          )}
        </div>

        {/* Descrição */}
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
            {item.description}
          </p>
        )}

        {/* 🔥 REMOVA A SEÇÃO INTEIRA DO BOTÃO DE AÇÃO PARA DISCOVER */}
        {/* Apenas mostra informações de rating no footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {ratingInfo && shouldShowCount(item.ratingsCount) && (
              <span>
                {ratingInfo.display} ⭐ ({formatNumber(item.ratingsCount)})
              </span>
            )}
          </div>

          {/* 🔥 MANTENHA APENAS O BOTÃO EDITAR PARA BIBLIOTECA */}
          {isLibrary && onEditClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // 🔥 IMPEDE QUE O CLIQUE PROPAGUE PARA O CARD
                onEditClick(item);
              }}
            >
              Editar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}