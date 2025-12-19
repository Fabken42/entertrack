import {
    Calendar, PlayCircle, CheckCircle, XCircle, Tv, Film, BookOpen, GamepadIcon, Sparkles
} from 'lucide-react';


// ============= FUNÇÕES DE FORMATO =============
export const formatRating = (rating, mediaType) => {
    if (!rating || rating === 0) return null;

    const numericRating = Number(rating);
    if (isNaN(numericRating)) return null;

    // Para animes e mangás, converte de base 10 para base 5
    if (mediaType === 'animes' || mediaType === 'mangas' || mediaType === 'movies' || mediaType === 'series') {
        return {
            display: (numericRating / 2).toFixed(1),
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

export const formatChaptersVolumes = (value, status) => {
    if (value === 0 && status !== 'finished') return '?';
    return value;
};

// ============= FUNÇÕES DE COR =============
export const getRatingColor = (rating, maxRating = 10, mediaType) => {
    if (!rating || rating === 0) return 'text-white/40';

    const adjustedRating = mediaType === 'animes' || mediaType === 'mangas'
        ? (rating / 2)
        : rating;

    const percentage = (adjustedRating / maxRating) * 100;
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
};


export const getMediaIcon = (mediaType) => {
    switch (mediaType) {
        case 'animes': return Tv;
        case 'movies': return Film;
        case 'series': return Tv;
        case 'mangas': return BookOpen;
        case 'books': return BookOpen;
        case 'games': return GamepadIcon;
        default: return Sparkles;
    }
};

export const getMediaColor = (mediaType) => {
    switch (mediaType) {
        case 'animes': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
        case 'movies': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case 'series': return 'bg-green-500/20 text-green-300 border-green-500/30';
        case 'mangas': return 'bg-red-500/20 text-red-300 border-red-500/30';
        case 'books': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case 'games': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
};

// ============= FUNÇÕES DE STATUS =============
export const getStatusLabel = (status) => {
    switch (status) {
        case 'planned': return 'Planejado';
        case 'in_progress': return 'Em Progresso';
        case 'completed': return 'Concluído';
        case 'dropped': return 'Abandonado';
        default: return status;
    }
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'planned': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case 'in_progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
        case 'dropped': return 'bg-red-500/20 text-red-300 border-red-500/30';
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
};

export const getStatusBorderColor = (status) => {
    switch (status) {
        case 'planned':
            return '!border-yellow-500/50 hover:border-yellow-500 border-2';
        case 'in_progress':
            return '!border-blue-500/50 hover:border-blue-500 border-2';
        case 'completed':
            return '!border-green-500/50 hover:border-green-500 border-2';
        case 'dropped':
            return '!border-red-500/50 hover:border-red-500 border-2';
        default:
            return '!border-white/10 hover:border-white/30 border-2';
    }
};

// ============= FUNÇÕES DE PROGRESSO =============
export const getProgressInfo = (item, mediaType, isLibrary) => {
    if (!isLibrary || !item.progress || !(item.status === 'in_progress' || item.status === 'dropped')) {
        return null;
    }

    const progress = item.progress;
    const total = mediaType === 'animes' ? item.episodes :
        mediaType === 'mangas' ? item.chapters || item.volumes : 0;

    if (total && progress.current !== undefined) {
        const percentage = Math.round((progress.current / total) * 100);
        return {
            current: progress.current,
            total: total,
            percentage: percentage,
            unit: progress.unit || 'episodes'
        };
    }

    return null;
};

export const getAnimeProgressInfo = (item) => {
    if (!item.progress || !(item.status === 'in_progress' || item.status === 'dropped')) {
        return null;
    }

    const progress = item.progress;
    const total = item.episodes || 0;

    if (total && progress.current !== undefined) {
        const percentage = total > 0 ? Math.round((progress.current / total) * 100) : 0;
        return {
            current: progress.current,
            total: total,
            percentage: percentage,
            unit: progress.unit || 'episodes'
        };
    }

    return null;
};

// ============= FUNÇÕES DE TRANSFORMAÇÃO =============
export const transformMediaData = (userMediaItem) => {
    const mediaCache = userMediaItem.mediaCacheId;
    const essentialData = mediaCache?.essentialData || {};

    return {
        _id: userMediaItem._id,
        title: essentialData.title || 'Sem título',
        description: essentialData.description || '',
        imageUrl: essentialData.coverImage || '',
        releaseYear: essentialData.releaseYear,
        rating: essentialData.averageRating || 0,
        ratingsCount: essentialData.ratingCount || 0,
        episodes: essentialData.episodes || 0,
        popularity: essentialData.popularity || 0,
        members: essentialData.members || 0,
        status: userMediaItem.status,
        userRating: userMediaItem.userRating,
        personalNotes: userMediaItem.personalNotes || '',
        progress: userMediaItem.progress,
        startedAt: userMediaItem.startedAt,
        completedAt: userMediaItem.completedAt,
        droppedAt: userMediaItem.droppedAt,
        createdAt: userMediaItem.createdAt,
        updatedAt: userMediaItem.updatedAt,
        studios: essentialData.studios || [],
        genres: essentialData.genres || [],
        authors: essentialData.authors || [],
        mediaCacheId: mediaCache?._id,
        sourceApi: mediaCache?.sourceApi,
        sourceId: mediaCache?.sourceId
    };
};

export const filterAndSortMedia = (mediaList, mediaType, selectedStatus, searchQuery, sortBy) => {
    let result = mediaList.filter(item => {
        if (item.mediaCacheId?.mediaType !== mediaType) return false;
        if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
        if (searchQuery) {
            const title = item.mediaCacheId?.essentialData?.title?.toLowerCase() || '';
            const search = searchQuery.toLowerCase();
            return title.includes(search);
        }
        return true;
    });

    // Transformar dados
    result = result.map(transformMediaData);

    // Sort results
    result.sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'title':
                return a.title.localeCompare(b.title);
            case 'rating':
                const ratingA = a.userRating || 0;
                const ratingB = b.userRating || 0;
                return ratingB - ratingA;
            case 'progress':
                const progressA = a.progress?.current || 0;
                const progressB = b.progress?.current || 0;
                return progressB - progressA;
            default:
                return 0;
        }
    });

    return result;
};

export const calculateMediaStats = (mediaList, mediaType) => {
    const filteredMedia = mediaList.filter(m => m.mediaCacheId?.mediaType === mediaType);

    return {
        total: filteredMedia.length,
        planned: filteredMedia.filter(m => m.status === 'planned').length,
        in_progress: filteredMedia.filter(m => m.status === 'in_progress').length,
        completed: filteredMedia.filter(m => m.status === 'completed').length,
        dropped: filteredMedia.filter(m => m.status === 'dropped').length
    };
};

// ============= FUNÇÕES DE ESTATÍSTICAS =============
export const getStatItems = (stats) => {
    return [
        {
            label: 'Total',
            value: stats.total,
            icon: Tv,
            color: 'from-gray-500/20 to-gray-600/20',
            textColor: 'text-gray-400',
            borderColor: 'border-gray-500/30'
        },
        {
            label: 'Planejados',
            value: stats.planned,
            icon: Calendar,
            color: 'from-yellow-500/20 to-yellow-600/20',
            textColor: 'text-yellow-400',
            borderColor: 'border-yellow-500/30'
        },
        {
            label: 'Em Progresso',
            value: stats.in_progress,
            icon: PlayCircle,
            color: 'from-blue-500/20 to-blue-600/20',
            textColor: 'text-blue-400',
            borderColor: 'border-blue-500/30'
        },
        {
            label: 'Concluídos',
            value: stats.completed,
            icon: CheckCircle,
            color: 'from-green-500/20 to-green-600/20',
            textColor: 'text-green-400',
            borderColor: 'border-green-500/30'
        },
        {
            label: 'Abandonados',
            value: stats.dropped,
            icon: XCircle,
            color: 'from-red-500/20 to-red-600/20',
            textColor: 'text-red-400',
            borderColor: 'border-red-500/30'
        }
    ];
};

export const getImageURL = (images) => {
    if (!images) return null;
    return images.jpg?.large_image_url ||
        images.jpg?.image_url ||
        images.jpg?.small_image_url ||
        images.webp?.large_image_url ||
        images.webp?.image_url ||
        images.webp?.small_image_url;
};

export const normalizeSearchResults = (results, mediaType) => {
    if (!results || !Array.isArray(results)) return [];

    if (mediaType === 'book') {
        return results.map(book => ({
            id: book.id,
            title: book.title,
            description: book.description,
            imageUrl: book.imageUrl,
            releaseYear: book.releaseYear || (book.publishedDate ? new Date(book.publishedDate).getFullYear() : undefined),
            genres: book.categories || [],
            apiRating: book.averageRating,
            apiVoteCount: book.ratingsCount,
            englishTitle: book.subtitle,
            metadata: {
                authors: book.authors || [],
                pageCount: book.pageCount,
                publisher: book.publisher,
                isbn: book.isbn
            }
        }));
    } else if (mediaType === 'game') {
        return results.map(game => ({
            id: game.id,
            title: game.name,
            description: game.description,
            imageUrl: game.imageUrl,
            releaseYear: game.released ? new Date(game.released).getFullYear() : undefined,
            genres: game.genres || [],
            apiRating: game.rating,
            apiVoteCount: game.ratingsCount,
            metadata: {
                platforms: game.platforms,
                metacritic: game.metacritic,
                playtime: game.playtime
            }
        }));
    } else if (mediaType === 'movie' || mediaType === 'series') {
        return results.map(item => ({
            id: item.id,
            title: mediaType === 'movie' ? item.title : item.name,
            description: item.overview,
            imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            releaseYear: mediaType === 'movie' ?
                (item.release_date ? new Date(item.release_date).getFullYear() : undefined) :
                (item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined),
            genres: item.genre_ids ? item.genre_ids.map(id => id.toString()) : [],
            apiRating: item.vote_average,
            apiVoteCount: item.vote_count,
            runtime: item.runtime || undefined,
            externalId: item.id.toString(),
            synopsis: item.overview,
            ...(mediaType === 'series' && {
                numberOfSeasons: item.number_of_seasons,
                numberOfEpisodes: item.number_of_episodes
            })
        }));
    } else if (mediaType === 'manga' || mediaType === 'anime') {
        return results.map(item => {
            const imageUrl = getImageURL(item.images) || item.imageUrl;

            // Calcular ano de lançamento
            let releaseYear = item.year || item.releaseYear;
            if (!releaseYear) {
                if (mediaType === 'anime' && item.aired?.from) {
                    releaseYear = new Date(item.aired.from).getFullYear();
                } else if (mediaType === 'manga' && item.published?.from) {
                    releaseYear = new Date(item.published.from).getFullYear();
                }
            }

            const baseItem = {
                externalId: item.id?.toString(),
                sorceApi: 'jikan',
                title: item.title,
                description: item.synopsis || item.description,
                imageUrl: imageUrl,
                releaseYear: releaseYear,
                status: item.status || 'Unknown',
                mediaType: item.type || mediaType,
                apiRating: item.score || item.rating || item.apiRating || 0,
                apiVoteCount: item.scored_by || item.ratingsCount || item.apiVoteCount || 0,
                popularity: item.popularity || 0,
                members: item.members || 0,
                genres: Array.isArray(item.genres) ? item.genres.map(g => ({
                    id: g.mal_id?.toString() || g.id?.toString() || '0',
                    name: g.name
                })) : []
            };

            if (mediaType === 'manga') {
                return {
                    ...baseItem,
                    volumes: item.volumes || 0,
                    chapters: item.chapters || 0,
                    authors: Array.isArray(item.authors)
                        ? item.authors.map(author => {
                            if (typeof author === 'string') return author;
                            return author.name || author;
                        })
                        : []
                };
            }

            if (mediaType === 'anime') {
                return {
                    ...baseItem,
                    episodes: item.episodes || 0,
                    studios: Array.isArray(item.studios)
                        ? item.studios.map(studio => {
                            if (typeof studio === 'string') return studio;
                            return studio.name || studio;
                        })
                        : []
                };
            }
            return baseItem;
        });
    }

    return results.map(item => ({
        ...item,
        apiRating: item.rating || item.score || item.apiRating,
        apiVoteCount: item.scored_by || item.ratingsCount || item.apiVoteCount || 0,
        releaseYear: item.releaseYear || item.year
    }));
};
