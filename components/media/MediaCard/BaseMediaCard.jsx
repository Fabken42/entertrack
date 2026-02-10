import Card from '../../ui/card/Card';
import { CardContent } from '../../ui/card/Card';
import { Star, Users, TrendingUp, Calendar, Trash2, MessageSquare, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/general-utils';
import { formatNumber, formatPopularity, shouldShowCount, formatRuntime } from '@/lib/utils/general-utils';
import {
    formatRating,
    getRatingColor,
    getMediaIcon,
    getMediaColor,
    getStatusBorderColor,
    getProgressInfo,
    getStatusColor,
    getStatusLabel,
    formatReleasePeriod
} from '@/lib/utils/media-utils';

export default function BaseMediaCard({
    item,
    mediaType,
    viewMode,
    onAddToLibrary,
    onDeleteClick,
    onEditClick,
    onIncreaseProgress,
    isLibrary = false,
    renderSpecificContent,
    renderStatsSection,
    renderProgressSection,
    increaseButtonLabel = 'Concluir',
    shouldShowIncreaseButton = false,
}) {
    const progressInfo = getProgressInfo(item, mediaType, isLibrary);

    const handleCardClick = (e) => {
        if (e.target.closest('button') || e.target.closest('[data-action-button]')) {
            return;
        }

        if (isLibrary && onEditClick) {
            onEditClick(item);
        } else if (!isLibrary && onAddToLibrary) {
            onAddToLibrary(item);
        }
    };

    const MediaIcon = getMediaIcon(mediaType);
    const mediaColor = getMediaColor(mediaType);
    const ratingInfo = formatRating(item.averageRating, mediaType);
    const shouldShowRatingBadge = !isLibrary && ratingInfo;
    const statusBorderColor = getStatusBorderColor(item.status);

    const shouldShowUserRating = isLibrary &&
        item.userRating &&
        (item.status === 'completed' || item.status === 'dropped');

    const showPersonalNotes = isLibrary &&
        (item.status === 'completed' || item.status === 'dropped') &&
        item.personalNotes &&
        item.personalNotes.trim() !== '';

    const shouldShowStats = !isLibrary;

    const shouldShowAnimeMangaStats = !isLibrary && (mediaType === 'anime' || mediaType === 'manga');

    const getFormattedReleaseDate = () => {
        if (item.getFormattedReleaseDate && typeof item.getFormattedReleaseDate === 'function') {
            return item.getFormattedReleaseDate();
        }

        if (item.releasePeriod) {
            return formatReleasePeriod(item.releasePeriod);
        }

        return null;
    };

    const renderBasicInfo = () => {
        const releaseDate = getFormattedReleaseDate();

        return (
            <div className="flex items-center gap-2 mb-3 text-sm text-white/60">
                {releaseDate && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{releaseDate}</span>
                    </div>
                )}
                {mediaType === 'movie' && item.runtime && item.runtime > 0 && (
                    <>
                        {releaseDate && <span>•</span>}
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatRuntime(item.runtime)}</span>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const renderDeleteButton = () => (
        isLibrary && onDeleteClick && (
            <button
                data-action-button="true"
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(item._id);
                }}
                className="p-2 bg-gray-800/60 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-500/20 border border-white/20 hover:scale-110 transition-all duration-300 z-10 flex-shrink-0"
                title="Remover da lista"
            >
                <Trash2 className="w-4 h-4 text-red-400" />
            </button>
        )
    );

    const renderIncreaseButton = () => (
        shouldShowIncreaseButton && onIncreaseProgress && (
            <button
                data-action-button="true"
                onClick={(e) => {
                    e.stopPropagation();
                    onIncreaseProgress(item._id);
                }}
                className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5",
                    "bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-300 hover:text-pink-200 border border-pink-500/30 hover:border-pink-500/50",
                    "hover:scale-105 active:scale-95"
                )}
            >
                <Check className="w-3.5 h-3.5" />
                {increaseButtonLabel}
            </button>
        )
    );

    const renderGenres = () => {
        if (!item.genres || !Array.isArray(item.genres) || item.genres.length === 0) {
            return null;
        }

        const displayGenres = item.genres.slice(0, 3);

        return (
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                {displayGenres.map((genre, index) => (
                    <span
                        key={genre.id || index}
                        className="px-2 py-1.5 bg-white/10 rounded-full text-xs text-white/80 font-medium truncate max-w-[120px]"
                        title={genre.name}
                    >
                        {genre.name}
                    </span>
                ))}
            </div>
        );
    };

    if (viewMode === 'list') {
        return (
            <div
                className={cn(
                    "glass flex items-start gap-4 p-5 rounded-xl transition-all duration-300 cursor-pointer group fade-in relative",
                    statusBorderColor,
                    "border-2 hover:border-white/30"
                )}
                onClick={handleCardClick}
            >
                {/* Coluna da imagem */}
                <div className="relative flex-shrink-0">
                    <div className="relative w-20 h-28 overflow-hidden rounded-lg">
                        <img
                            src={item.coverImage || '/images/icons/placeholder-image.png'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => e.target.src = '/images/icons/placeholder-image.png'}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Badge do tipo de mídia */}
                    <div className={cn(
                        "absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/20",
                        "shadow-sm",
                        mediaColor
                    )}>
                        <div className="flex items-center gap-1">
                            <MediaIcon className="w-3 h-3" />
                        </div>
                    </div>

                    {/* Botão de deletar (somente biblioteca) */}
                    {isLibrary && onDeleteClick && (
                        <button
                            data-action-button="true"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(item._id);
                            }}
                            className="absolute -bottom-2 -right-2 p-2 bg-gray-900/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-500/30 border border-white/20 hover:scale-110 hover:border-red-400/50 transition-all duration-300 z-10"
                            title="Remover da lista"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                    )}
                </div>

                {/* Coluna do conteúdo */}
                <div className="flex-1 min-w-0 space-y-3">
                    {/* Cabeçalho com título e rating */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-lg truncate">
                                {item.title}
                            </h3>
                            {renderBasicInfo()}
                        </div>
                        {shouldShowRatingBadge && (
                            <div className={cn(
                                "px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10 shrink-0",
                                "bg-gray-900/60 shadow-sm",
                                getRatingColor(item.averageRating, mediaType)
                            )}>
                                <div className="flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span className="font-bold">{ratingInfo.display}/5</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Seção de status e progresso */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {isLibrary && item.status && (
                            <div className={cn(
                                "inline-flex px-3 py-1.5 rounded-full text-xs font-medium border shrink-0",
                                "shadow-sm",
                                getStatusColor(item.status)
                            )}>
                                {getStatusLabel(item.status)}
                            </div>
                        )}

                        {/* Barra de progresso */}
                        {isLibrary && progressInfo && renderProgressSection ? (
                            renderProgressSection()
                        ) : (
                            isLibrary && progressInfo && (
                                <div className="flex-1 min-w-[200px] max-w-xs">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-white/70 font-medium">Progresso</span>
                                        <span className="text-white font-semibold">
                                            {progressInfo.display}
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner relative">
                                        <div
                                            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-700 rounded-full"
                                            style={{ width: `${progressInfo.percentage}%` }}
                                        />
                                        <div className="absolute inset-0 rounded-full border border-white/5"></div>
                                    </div>
                                    <div className="text-xs text-white/60 text-right mt-1">
                                        {progressInfo.percentage}% completo
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Conteúdo específico (AGORA ABAIXO DA BARRA DE PROGRESSO) */}
                    {renderSpecificContent && (
                        <div className="pt-2">
                            {renderSpecificContent()}
                        </div>
                    )}

                    {/* Botão de aumentar progresso */}
                    {shouldShowIncreaseButton && (
                        <div className="flex gap-2 items-center pt-1">
                            {renderIncreaseButton()}
                        </div>
                    )}

                    {/* Avaliação do usuário */}
                    {shouldShowUserRating && (
                        <div className="flex items-center gap-3 pt-2">
                            <span className="text-xs text-white/60 font-medium">Sua avaliação:</span>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "w-4 h-4 transition-transform",
                                            i < item.userRating
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-white/20"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-bold text-white ml-1">
                                {item.userRating}/5
                            </span>
                        </div>
                    )}

                    {/* Notas pessoais */}
                    {showPersonalNotes && (
                        <div className="pt-3">
                            <div className="flex items-center gap-2 mb-2 text-xs text-white/60">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span className="font-medium">Seu comentário:</span>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                                <p className="text-sm text-white/80 line-clamp-3 transition-all duration-300 leading-relaxed whitespace-pre-line">
                                    {item.personalNotes}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* MODIFICAÇÃO: Seção de estatísticas - agora controlada por shouldShowStats */}
                    {renderStatsSection ? renderStatsSection() : (
                        shouldShowStats && (
                            <div className="space-y-2.5 pt-3 border-t border-white/10">
                                {/* MODIFICAÇÃO: Condicional para membros */}
                                {shouldShowAnimeMangaStats && shouldShowCount(item.members) && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/60 flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="font-medium">Membros</span>
                                        </span>
                                        <span className="font-bold text-white">{formatNumber(item.members)}</span>
                                    </div>
                                )}

                                {/* Avaliações sempre visíveis fora da biblioteca */}
                                {shouldShowCount(item.ratingCount) && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/60 flex items-center gap-2">
                                            <Star className="w-3.5 h-3.5" />
                                            <span className="font-medium">Avaliações</span>
                                        </span>
                                        <span className="font-bold text-white">{formatNumber(item.ratingCount)}</span>
                                    </div>
                                )}

                                {/* MODIFICAÇÃO: Condicional para ranking (anime e mangá) */}
                                {shouldShowAnimeMangaStats && shouldShowCount(item.popularity) && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/60 flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            <span className="font-medium">Ranking</span>
                                        </span>
                                        <span className="font-bold text-white">{formatPopularity(item.popularity)}</span>
                                    </div>
                                )}
                            </div>
                        )
                    )}

                    {/* Descrição (somente fora da biblioteca) */}
                    {!isLibrary && item.description && (
                        <div className="pt-3 border-t border-white/10">
                            <p className="text-sm text-white/60 line-clamp-3 transition-all leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    )}
                    {/* Footer com gêneros e tipo de mídia (modo lista) - sempre visível */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        {/* Gêneros */}
                        {renderGenres()}

                        {/* Badge do tipo de mídia */}
                        <div className={cn(
                            "px-2.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20 shadow-sm shrink-0",
                            mediaColor
                        )}>
                            <div className="flex items-center gap-1.5">
                                <MediaIcon className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card
            variant="glass"
            className={cn(
                "h-full flex flex-col group cursor-pointer fade-in relative overflow-hidden",
                statusBorderColor,
                "hover:border-white/30"
            )}
            onClick={handleCardClick}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardContent className="p-4 flex-1 flex flex-col relative z-10">
                {/* Container da imagem */}
                <div className="relative mb-4 rounded-xl overflow-hidden shadow-sm">
                    <div className="relative w-full h-48 overflow-hidden">
                        <img
                            src={item.coverImage || '/images/icons/placeholder-image.png'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => e.target.src = '/images/icons/placeholder-image.png'}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>
                    </div>

                    {/* Overlays superiores */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                        {isLibrary && item.status && (
                            <div className={cn(
                                "px-2.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border shadow-sm",
                                getStatusColor(item.status)
                            )}>
                                {getStatusLabel(item.status)}
                            </div>
                        )}

                        {shouldShowRatingBadge && (
                            <div className={cn(
                                "px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/20 shadow-sm",
                                "bg-gray-900/70",
                                getRatingColor(item.averageRating, mediaType)
                            )}>
                                <div className="flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span className="font-bold">{ratingInfo.display}/5</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botão de aumento de progresso */}
                    <div className="absolute bottom-2 right-2 z-20">
                        {renderIncreaseButton()}
                    </div>
                </div>

                {/* Cabeçalho com título e botão deletar */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white line-clamp-2 flex-1 text-lg">
                        {item.title}
                    </h3>
                    {renderDeleteButton()}
                </div>

                {/* Informações básicas */}
                {renderBasicInfo()}

                {/* Seção de progresso */}
                {isLibrary && progressInfo && renderProgressSection ? (
                    renderProgressSection()
                ) : (
                    isLibrary && progressInfo && (
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-white/70 font-medium">Progresso</span>
                                <span className="text-white font-bold">
                                    {progressInfo.display}
                                </span>
                            </div>
                            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner relative">
                                <div
                                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-700 rounded-full"
                                    style={{ width: `${progressInfo.percentage}%` }}
                                />
                                <div className="absolute inset-0 rounded-full border border-white/5"></div>
                            </div>
                            <div className="text-xs text-white/60 text-right mt-1">
                                {progressInfo.percentage}% completo
                            </div>
                        </div>
                    )
                )}

                {/* Avaliação do usuário */}
                {shouldShowUserRating && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-white/60 font-medium">Sua avaliação:</span>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "w-4 h-4 transition-transform",
                                            i < item.userRating
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-white/20"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-bold text-white ml-1">
                                {item.userRating}/5
                            </span>
                        </div>
                    </div>
                )}

                {/* Notas pessoais */}
                {showPersonalNotes && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2 text-xs text-white/60">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="font-medium">Seu comentário:</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                            <p className="text-xs text-white/80 line-clamp-3 transition-all duration-300 leading-relaxed whitespace-pre-line">
                                {item.personalNotes}
                            </p>
                        </div>
                    </div>
                )}

                {/* Conteúdo específico (mantido na mesma posição para consistência com modo lista) */}
                {renderSpecificContent && (
                    <div className="mb-4">
                        {renderSpecificContent()}
                    </div>
                )}

                {/* MODIFICAÇÃO: Estatísticas - agora controladas por shouldShowStats */}
                <div className="space-y-2.5 mb-4 flex-1">
                    {renderStatsSection ? renderStatsSection() : (
                        shouldShowStats && (
                            <>
                                {/* MODIFICAÇÃO: Condicional para membros (anime e mangá) */}
                                {shouldShowAnimeMangaStats && shouldShowCount(item.members) && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/60 flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="font-medium">Membros</span>
                                        </span>
                                        <span className="font-bold text-white">{formatNumber(item.members)}</span>
                                    </div>
                                )}

                                {/* Avaliações sempre visíveis fora da biblioteca */}
                                {shouldShowCount(item.ratingCount) && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/60 flex items-center gap-2">
                                            <Star className="w-3.5 h-3.5" />
                                            <span className="font-medium">Avaliações</span>
                                        </span>
                                        <span className="font-bold text-white">{formatNumber(item.ratingCount)}</span>
                                    </div>
                                )}

                                {/* MODIFICAÇÃO: Condicional para ranking (anime e mangá) */}
                                {shouldShowAnimeMangaStats && shouldShowCount(item.popularity) && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/60 flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            <span className="font-medium">Ranking</span>
                                        </span>
                                        <span className="font-bold text-white">{formatPopularity(item.popularity)}</span>
                                    </div>
                                )}
                            </>
                        )
                    )}
                </div>

                {/* Descrição (fora da biblioteca) */}
                {!isLibrary && item.description && (
                    <div className="mb-4">
                        <p className="text-sm text-white/60 line-clamp-3 transition-all leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                )}

                {/* Footer com gêneros e tipo de mídia - sempre visível */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
                    {/* Gêneros */}
                    {renderGenres()}

                    <div className={cn(
                        "px-2.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20 shadow-sm shrink-0",
                        mediaColor
                    )}>
                        <div className="flex items-center gap-1.5">
                            <MediaIcon className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}