import {
    Calendar, PlayCircle, CheckCircle, XCircle, Tv, Film, BookOpen, GamepadIcon, Sparkles
} from 'lucide-react';


// ============= FUNÇÕES DE FORMATO =============
export const formatRating = (rating, mediaType) => {
    if (!rating || rating === 0) return null;

    const numericRating = Number(rating);
    if (isNaN(numericRating)) return null;

    // Para animes e mangás, converte de base 10 para base 5
    if (mediaType === 'anime' || mediaType === 'manga' || mediaType === 'movie' || mediaType === 'series') {
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

    const adjustedRating = mediaType === 'anime' || mediaType === 'manga'
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
        case 'anime': return Tv;
        case 'movie': return Film;
        case 'series': return Tv;
        case 'manga': return BookOpen;
        case 'book': return BookOpen;
        case 'game': return GamepadIcon;
        default: return Sparkles;
    }
};

export const getMediaColor = (mediaType) => {
    switch (mediaType) {
        case 'anime': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
        case 'movie': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case 'series': return 'bg-green-500/20 text-green-300 border-green-500/30';
        case 'manga': return 'bg-red-500/20 text-red-300 border-red-500/30';
        case 'book': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case 'game': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
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

    const progressDetails = item.progress.details || {};
    const userStatus = item.status;

    // Para animes
    if (mediaType === 'anime') {
        const currentEpisodes = progressDetails.episodes || 0;
        const totalEpisodes = item.episodes || 0;

        // Mostrar mesmo se currentEpisodes for 0 (para in_progress no início)
        if (totalEpisodes > 0 || currentEpisodes > 0) {
            const percentage = totalEpisodes > 0
                ? Math.round((currentEpisodes / totalEpisodes) * 100)
                : 0;
            return {
                current: currentEpisodes,
                total: totalEpisodes,
                percentage: Math.min(percentage, 100), // Cap at 100%
                unit: 'episódios',
                isEmpty: currentEpisodes === 0,
                status: userStatus,
                isJustStarted: currentEpisodes === 0 && userStatus === 'in_progress'
            };
        }
    }

    // Para mangás
    if (mediaType === 'manga') {
        const currentChapters = progressDetails.chapters || 0;
        const totalChapters = item.chapters || 0;
        const currentVolumes = progressDetails.volumes || 0;
        const totalVolumes = item.volumes || 0;

        // Preferência por capítulos se disponível
        if (totalChapters > 0 || currentChapters > 0) {
            const percentage = totalChapters > 0
                ? Math.round((currentChapters / totalChapters) * 100)
                : 0;
            return {
                current: currentChapters,
                total: totalChapters,
                volumes: currentVolumes,
                totalVolumes: totalVolumes,
                percentage: Math.min(percentage, 100),
                unit: 'capítulos',
                isEmpty: currentChapters === 0,
                status: userStatus,
                isJustStarted: currentChapters === 0 && userStatus === 'in_progress'
            };
        }
        // Se não tiver capítulos, usa volumes
        else if (totalVolumes > 0 || currentVolumes > 0) {
            const percentage = totalVolumes > 0
                ? Math.round((currentVolumes / totalVolumes) * 100)
                : 0;
            return {
                current: currentVolumes,
                total: totalVolumes,
                percentage: Math.min(percentage, 100),
                unit: 'volumes',
                isEmpty: currentVolumes === 0,
                status: userStatus,
                isJustStarted: currentVolumes === 0 && userStatus === 'in_progress'
            };
        }
    }

    // Para séries
    if (mediaType === 'series') {
        const currentSeasons = progressDetails.seasons || 0;
        const totalSeasons = item.seasons || 0;
        const currentEpisodes = progressDetails.episodesInSeason || 0;
        const totalEpisodes = item.episodes || 0;

        // Se temos informações de temporadas
        if (totalSeasons > 0 || currentSeasons > 0) {
            const percentage = totalSeasons > 0
                ? Math.round((currentSeasons / totalSeasons) * 100)
                : 0;
            return {
                current: currentSeasons,
                total: totalSeasons,
                currentEpisodes: currentEpisodes,
                totalEpisodes: totalEpisodes,
                percentage: Math.min(percentage, 100),
                unit: 'temporadas',
                secondaryUnit: 'episódios',
                isEmpty: currentSeasons === 0,
                status: userStatus,
                isJustStarted: currentSeasons === 0 && userStatus === 'in_progress'
            };
        }
        // Se não tem temporadas, usa episódios
        else if (totalEpisodes > 0 || currentEpisodes > 0) {
            const percentage = totalEpisodes > 0
                ? Math.round((currentEpisodes / totalEpisodes) * 100)
                : 0;
            return {
                current: currentEpisodes,
                total: totalEpisodes,
                percentage: Math.min(percentage, 100),
                unit: 'episódios',
                isEmpty: currentEpisodes === 0,
                status: userStatus,
                isJustStarted: currentEpisodes === 0 && userStatus === 'in_progress'
            };
        }
    }

    // Para livros
    if (mediaType === 'book') {
        const currentPages = progressDetails.pages || 0;
        const totalPages = item.pageCount || 0;

        if (totalPages > 0 || currentPages > 0) {
            const percentage = totalPages > 0
                ? Math.round((currentPages / totalPages) * 100)
                : 0;
            return {
                current: currentPages,
                total: totalPages,
                percentage: Math.min(percentage, 100),
                unit: 'páginas',
                isEmpty: currentPages === 0,
                status: userStatus,
                isJustStarted: currentPages === 0 && userStatus === 'in_progress'
            };
        }
    }

    // Para filmes
    if (mediaType === 'movie') {
        const currentMinutes = progressDetails.minutes || 0;
        const totalMinutes = item.runtime || 0;

        if (totalMinutes > 0 || currentMinutes > 0) {
            const percentage = totalMinutes > 0
                ? Math.round((currentMinutes / totalMinutes) * 100)
                : 0;
            return {
                current: currentMinutes,
                total: totalMinutes,
                percentage: Math.min(percentage, 100),
                unit: 'minutos',
                isEmpty: currentMinutes === 0,
                status: userStatus,
                isJustStarted: currentMinutes === 0 && userStatus === 'in_progress'
            };
        }
    }

    // Para jogos
    if (mediaType === 'game') {
        const currentPercentage = progressDetails.percentage || 0;
        const currentPlaytime = progressDetails.minutes || 0; // Usando minutes para playtime
        const totalPlaytime = item.playtime || 0; // Supondo que existe este campo

        // Preferência por porcentagem se disponível
        if (currentPercentage >= 0) {
            return {
                current: currentPercentage,
                total: 100,
                percentage: Math.min(currentPercentage, 100),
                unit: '%',
                isEmpty: currentPercentage === 0,
                status: userStatus,
                isJustStarted: currentPercentage === 0 && userStatus === 'in_progress'
            };
        }
        // Se não, usa tempo de jogo
        else if (totalPlaytime > 0 || currentPlaytime > 0) {
            const percentage = totalPlaytime > 0
                ? Math.round((currentPlaytime / totalPlaytime) * 100)
                : 0;
            return {
                current: currentPlaytime,
                total: totalPlaytime,
                percentage: Math.min(percentage, 100),
                unit: 'minutos',
                isEmpty: currentPlaytime === 0,
                status: userStatus,
                isJustStarted: currentPlaytime === 0 && userStatus === 'in_progress'
            };
        }
    }

    // Fallback genérico
    const genericPercentage = progressDetails.percentage || 0;
    if (genericPercentage >= 0) {
        return {
            current: genericPercentage,
            total: 100,
            percentage: Math.min(genericPercentage, 100),
            unit: '%',
            isEmpty: genericPercentage === 0,
            status: userStatus,
            isJustStarted: genericPercentage === 0 && userStatus === 'in_progress'
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
        description: essentialData.description,
        imageUrl: essentialData.coverImage,
        releaseYear: essentialData.releaseYear,
        runtime: essentialData.runtime,
        rating: essentialData.averageRating,
        ratingsCount: essentialData.ratingCount,
        episodes: essentialData.episodes,
        seasons: essentialData.seasons,
        chapters: essentialData.chapters,
        volumes: essentialData.volumes,
        pageCount: essentialData.pageCount,
        platforms: essentialData.platforms,
        popularity: essentialData.popularity,
        members: essentialData.members,
        status: userMediaItem.status,
        userRating: userMediaItem.userRating,
        personalNotes: userMediaItem.personalNotes,
        progress: userMediaItem.progress,
        startedAt: userMediaItem.startedAt,
        completedAt: userMediaItem.completedAt,
        droppedAt: userMediaItem.droppedAt,
        createdAt: userMediaItem.createdAt,
        updatedAt: userMediaItem.updatedAt,
        genres: essentialData.genres,
        authors: essentialData.authors,
        studios: essentialData.studios,
        mediaCacheId: mediaCache?._id,
        sourceApi: mediaCache?.sourceApi,
        sourceId: mediaCache?.sourceId
    };
};

export const filterAndSortMedia = (mediaList, mediaType, selectedStatus, searchQuery, sortBy) => {
    /*
    imprime por exemplo: 
    media list 0:  
Object { progress: {…}, _id: "695685f28bcbd9a8bbcd912b", userId: "69566eba8bcbd9a8bbcd8f67", mediaCacheId: {…}, status: "in_progress", userRating: null, personalNotes: "", tags: [], startedAt: "2026-01-01T14:34:26.504Z", createdAt: "2026-01-01T14:34:26.507Z", … }
​
__v: 0
​
_id: "695685f28bcbd9a8bbcd912b"
​
createdAt: "2026-01-01T14:34:26.507Z"
​
mediaCacheId: Object { _id: "695685f28bcbd9a8bbcd9121", sourceApi: "tmdb", sourceId: "79744", … }
 ​
__v: 0
 ​
_id: "695685f28bcbd9a8bbcd9121"
 ​
cacheControl: Object { lastFetched: "2026-01-01T14:34:26.406Z", nextFetch: "2026-01-02T14:34:26.406Z", ttl: 86400, … }
 ​
createdAt: "2026-01-01T14:34:26.412Z"
 ​
essentialData: Object { title: "O Novato", description: "John Nolan, um homem de 40 anos, deixa para trás sua vida confortável em uma cidade pequena para viver seu sonho de ser um agente policial no Departamento de Polícia de Los Angeles. Como o novato mais velho, ele enfrenta a descrença de seus colegas.", coverImage: "https://image.tmdb.org/t/p/w500/yCPGrd6fzbftuaH97OUS6tUdE4B.jpg", … }
  ​
authors: Array []
  ​
averageRating: 8.512
  ​
chapters: null
  ​
coverImage: "https://image.tmdb.org/t/p/w500/yCPGrd6fzbftuaH97OUS6tUdE4B.jpg"
  ​
description: "John Nolan, um homem de 40 anos, deixa para trás sua vida confortável em uma cidade pequena para viver seu sonho de ser um agente policial no Departamento de Polícia de Los Angeles. Como o novato mais velho, ele enfrenta a descrença de seus colegas."
  ​
episodes: 144
  ​
episodesPerSeason: Array(8) [ 20, 20, 14, … ]
   ​
0: 20
   ​
1: 20
   ​
2: 14
   ​
3: 22
   ​
4: 22
   ​
5: 10
   ​
6: 18
   ​
7: 18
   ​
length: 8
   ​
<prototype>: Array []
  ​
genres: Array(3) [ {…}, {…}, {…} ]
  ​
members: null
  ​
pageCount: null
  ​
platforms: Array []
  ​
popularity: null
  ​
ratingCount: 2826
  ​
releaseYear: 2018
  ​
runtime: null
  ​
seasons: 8
  ​
status: "finished"
  ​
studios: Array []
  ​
title: "O Novato"
  ​
volumes: null
  ​
<prototype>: Object { … }
 ​
mediaType: "series"
 ​
sourceApi: "tmdb"
 ​
sourceId: "79744"
 ​
updatedAt: "2026-01-01T14:34:26.530Z"
 ​
usageStats: Object { userCount: 1, lastAccessed: "2026-01-01T14:34:26.406Z", accessCount: 1 }
 ​
version: "1.0"
 ​
<prototype>: Object { … }
​
personalNotes: ""
​
progress: Object { lastUpdated: "2026-01-01T14:38:34.908Z", current: 9, total: 144, … }
​
startedAt: "2026-01-01T14:34:26.504Z"
​
status: "in_progress"
​
tags: Array []
​
updatedAt: "2026-01-01T14:38:34.908Z"
​
userId: "69566eba8bcbd9a8bbcd8f67"
​
userRating: null
​
<prototype>: Object { … }
 ​
__defineGetter__: function __defineGetter__()
 ​
__defineSetter__: function __defineSetter__()
 ​
__lookupGetter__: function __lookupGetter__()
 ​
__lookupSetter__: function __lookupSetter__()
 ​
__proto__: 
 ​
constructor: function Object()
 ​
hasOwnProperty: function hasOwnProperty()
 ​
isPrototypeOf: function isPrototypeOf()
 ​
propertyIsEnumerable: function propertyIsEnumerable()
 ​
toLocaleString: function toLocaleString()
 ​
toString: function toString()
 ​
valueOf: function valueOf()
 ​
<get __proto__()>: function __proto__()
 ​
<set __proto__()>: function __proto__()
    */
    console.log('media list 0: ', mediaList[0])
    // Filtragem
    let result = mediaList.filter(item => {
        // Verifica tipo de mídia
        if (item.mediaCacheId?.mediaType !== mediaType) return false;

        // Filtra por status
        if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;

        // Filtra por busca
        if (searchQuery) {
            const title = item.mediaCacheId?.essentialData?.title?.toLowerCase() || '';
            const search = searchQuery.toLowerCase();
            return title.includes(search);
        }

        return true;
    });

    result = result.map(item => {
        const transformed = transformMediaData(item);

        if (!transformed.progress) transformed.progress = {};

        if (mediaType === 'movie') {
            transformed.progress.current = item.progress?.details?.minutes || 0;
            transformed.progress.total = item.mediaCacheId?.essentialData?.runtime || 0;
            transformed.progress.unit = 'min';
        } else if (mediaType === 'anime' || mediaType === 'series') {
            transformed.progress.current = item.progress?.details?.episodes || 0;
            transformed.progress.total = item.mediaCacheId?.essentialData?.episodes || 0;
            transformed.progress.unit = 'eps';
        } else if (mediaType === 'manga') {
            transformed.progress.current = item.progress?.details?.chapters || 0;
            transformed.progress.total = item.mediaCacheId?.essentialData?.chapters || 0;
            transformed.progress.unit = 'cap';
        } else if (mediaType === 'book') {
            transformed.progress.current = item.progress?.details?.pages || 0;
            transformed.progress.total = item.mediaCacheId?.essentialData?.pageCount || 0;
            transformed.progress.unit = 'pg';
        }

        // Adiciona dados essenciais para fácil acesso no MediaCard
        const essential = item.mediaCacheId?.essentialData || {};
        transformed.title = essential.title || transformed.title;
        transformed.description = essential.description || transformed.description;
        transformed.imageUrl = essential.coverImage || transformed.imageUrl;
        transformed.releaseYear = essential.releaseYear || transformed.releaseYear;
        transformed.runtime = essential.runtime || transformed.runtime;
        transformed.genres = essential.genres || transformed.genres;
        transformed.averageRating = essential.averageRating || transformed.rating;
        transformed.ratingCount = essential.ratingCount || transformed.ratingsCount;
        transformed.popularity = essential.popularity || transformed.popularity;

        // Status do item na biblioteca do usuário
        transformed.status = item.status || transformed.status;
        transformed.userRating = item.userRating || transformed.userRating;
        transformed.personalNotes = item.personalNotes || transformed.personalNotes;

        return transformed;
    });

    // Ordenação - ATUALIZADA PARA FILMES
    result.sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt);

            case 'title':
                return (a.title || '').localeCompare(b.title || '');

            case 'rating':
                // Prioriza avaliação do usuário, depois avaliação geral
                const ratingA = a.userRating || a.averageRating || 0;
                const ratingB = b.userRating || b.averageRating || 0;
                return ratingB - ratingA;

            case 'progress':
                // CALCULA PORCENTAGEM DE PROGRESSO CONSIDERANDO TODOS OS TIPOS
                const calculatePercentage = (item) => {
                    if (mediaType === 'movie') {
                        // Para filmes: progresso baseado em minutos
                        const current = item.progress?.current || 0;
                        const total = item.progress?.total || item.runtime || 0;
                        if (!total || total === 0) return 0;
                        return (current / total) * 100;
                    } else if (mediaType === 'anime' || mediaType === 'series') {
                        // Para séries: episódios
                        const current = item.progress?.current || 0;
                        const total = item.progress?.total || item.episodes || 0;
                        if (!total || total === 0) return 0;
                        return (current / total) * 100;
                    } else if (mediaType === 'manga') {
                        // Para mangás: capítulos
                        const current = item.progress?.current || 0;
                        const total = item.progress?.total || item.chapters || 0;
                        if (!total || total === 0) return 0;
                        return (current / total) * 100;
                    } else if (mediaType === 'book') {
                        // Para livros: páginas
                        const current = item.progress?.current || 0;
                        const total = item.progress?.total || item.pageCount || 0;
                        if (!total || total === 0) return 0;
                        return (current / total) * 100;
                    }
                    return 0;
                };

                const percentageA = calculatePercentage(a);
                const percentageB = calculatePercentage(b);

                // Ordena do MAIOR progresso para o MENOR
                return percentageB - percentageA;

            case 'release':
                // Ordena por ano de lançamento (mais recente primeiro)
                const yearA = a.releaseYear || 0;
                const yearB = b.releaseYear || 0;
                return yearB - yearA;

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
            valueKey: 'all',
            icon: BookOpen,
            color: 'from-gray-500/20 to-gray-600/20',
            activeColor: 'from-blue-500/30 to-cyan-500/30',
            textColor: 'text-gray-400',
            activeTextColor: 'text-blue-400',
            borderColor: 'border-gray-500/30'
        },
        {
            label: 'Planejados',
            value: stats.planned,
            valueKey: 'planned',
            icon: Calendar,
            color: 'from-yellow-500/20 to-yellow-600/20',
            activeColor: 'from-blue-500/30 to-cyan-500/30',
            textColor: 'text-yellow-400',
            activeTextColor: 'text-blue-400',
            borderColor: 'border-yellow-500/30'
        },
        {
            label: 'Em Progresso',
            value: stats.in_progress,
            valueKey: 'in_progress',
            icon: PlayCircle,
            color: 'from-blue-500/20 to-blue-600/20',
            activeColor: 'from-blue-500/30 to-cyan-500/30',
            textColor: 'text-blue-400',
            activeTextColor: 'text-blue-400',
            borderColor: 'border-blue-500/30'
        },
        {
            label: 'Concluídos',
            value: stats.completed,
            valueKey: 'completed',
            icon: CheckCircle,
            color: 'from-green-500/20 to-green-600/20',
            activeColor: 'from-blue-500/30 to-cyan-500/30',
            textColor: 'text-green-400',
            activeTextColor: 'text-blue-400',
            borderColor: 'border-green-500/30'
        },
        {
            label: 'Abandonados',
            value: stats.dropped,
            valueKey: 'dropped',
            icon: XCircle,
            color: 'from-red-500/20 to-red-600/20',
            activeColor: 'from-blue-500/30 to-cyan-500/30',
            textColor: 'text-red-400',
            activeTextColor: 'text-blue-400',
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
            sourceId: book.id?.toString(),
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
            sourceId: game.id?.toString(),
            title: game.name,
            description: game.description,
            imageUrl: game.imageUrl,
            platforms: game.platforms ? game.platforms.map(p => p.name) : [],
            releaseYear: game.released ? new Date(game.released).getFullYear() : undefined,
            genres: game.genres || [],
            apiRating: game.rating,
            apiVoteCount: game.ratingsCount,
            metacriticScore: game.metacritic,
        }));
    } else if (mediaType === 'movie' || mediaType === 'series') {
        return results.map(item => ({
            sourceId: item.id?.toString(),
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
            synopsis: item.overview,
            ...(mediaType === 'series' && {
                numberOfSeasons: item.number_of_seasons,
                numberOfEpisodes: item.number_of_episodes
            })
        }));
    } else if (mediaType === 'manga' || mediaType === 'anime') {
        return results.map(item => {
            const imageUrl = getImageURL(item.images) || item.imageUrl;

            let releaseYear = item.year || item.releaseYear;
            if (!releaseYear) {
                if (mediaType === 'anime' && item.aired?.from) {
                    releaseYear = new Date(item.aired.from).getFullYear();
                } else if (mediaType === 'manga' && item.published?.from) {
                    releaseYear = new Date(item.published.from).getFullYear();
                }
            }

            const baseItem = {
                sourceId: item.id?.toString(),
                sorceApi: 'jikan',
                title: item.title,
                category: item.category,
                description: item.synopsis || item.description,
                imageUrl: imageUrl,
                releaseYear: releaseYear,
                status: item.status || 'Unknown',
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
