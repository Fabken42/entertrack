import {
    Calendar, PlayCircle, CheckCircle, XCircle, Tv, Film, BookOpen, GamepadIcon, Sparkles, Tv2,
    Library,
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

// Função para formatar releasePeriod (mês e ano)
export function formatReleasePeriod(releasePeriod) {
    if (!releasePeriod || !releasePeriod.year) {
        return null;
    }

    const { year, month } = releasePeriod;
    if (month) {
        const monthNames = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        return `${monthNames[month - 1]}, ${year}`;
    }
    return year.toString();
}

export function extractReleaseYear(item) {
    if (item.releasePeriod && item.releasePeriod.year) {
        return item.releasePeriod.year;
    }
    return item.releaseYear || null;
}

export function extractReleasePeriod(item) {
    if (item.releasePeriod) {
        return item.releasePeriod;
    }
    return null;
}

// ============= FUNÇÕES DE COR =============
export const getRatingColor = (rating, mediaType) => {
    if (!rating || rating === 0) return 'text-white/40';

    const adjustedRating = mediaType !== 'game'
        ? (rating / 2)
        : rating;

    const percentage = (adjustedRating / 5) * 100;
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
};


export const getMediaIcon = (mediaType) => {
    switch (mediaType) {
        case 'anime': return Tv2;
        case 'movie': return Film;
        case 'series': return Tv;
        case 'manga': return BookOpen;
        case 'game': return GamepadIcon;
        default: return Sparkles;
    }
};

export const getMediaColor = (mediaType) => {
    switch (mediaType) {
        case 'anime': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'movie': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
        case 'series': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'manga': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'game': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

// ============= FUNÇÕES DE TRANSFORMAÇÃO =============
export const transformMediaData = (userMediaItem) => {
    const mediaCache = userMediaItem.mediaCacheId;
    const essentialData = mediaCache?.essentialData || {};

    return {
        _id: userMediaItem._id,
        title: essentialData.title || 'Sem título',
        description: essentialData.description,
        coverImage: essentialData.coverImage,
        releasePeriod: essentialData.releasePeriod,
        runtime: essentialData.runtime,
        averageRating: essentialData.averageRating,
        ratingCount: essentialData.ratingCount,
        episodes: essentialData.episodes,
        seasons: essentialData.seasons,
        chapters: essentialData.chapters,
        volumes: essentialData.volumes,
        pageCount: essentialData.pageCount,
        platforms: essentialData.platforms,
        popularity: essentialData.popularity,
        members: essentialData.members,
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

// ============= FUNÇÕES DE PROGRESSO =============
export const getProgressInfo = (item, mediaType, isLibrary) => {
    if (!isLibrary || !item.progress || item.status !== 'in_progress') {
        return null;
    }

    const progress = item.progress || {};
    const userStatus = item.status;

    // Helper function to create the base progress object
    const createProgressObject = (current, total, unit, extraProps = {}) => {
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        return {
            current,
            total,
            percentage: Math.min(percentage, 100),
            unit,
            display: `${current}/${total || '?'} ${unit}`,
            isEmpty: current === 0,
            status: userStatus,
            isJustStarted: current === 0 && userStatus === 'in_progress',
            ...extraProps
        };
    };

    // Helper function to add volume info to display string
    const addVolumeInfo = (progressObj, volumes, totalVolumes) => {
        if (volumes !== undefined && totalVolumes !== undefined) {
            return {
                ...progressObj,
                volumes,
                totalVolumes,
                display: `${progressObj.display} (${volumes || '?'}/${totalVolumes || '?'} vols)`
            };
        }
        return progressObj;
    };

    // Para animes
    if (mediaType === 'anime') {
        const currentEpisodes = progress.episodes || 0;
        const totalEpisodes = item.episodes || 0;

        if (totalEpisodes > 0 || currentEpisodes > 0) {
            return createProgressObject(currentEpisodes, totalEpisodes, 'episódios');
        }
    }

    // Para mangás
    if (mediaType === 'manga') {
        const currentChapters = progress.chapters || 0;
        const totalChapters = item.chapters || 0;
        const currentVolumes = progress.volumes || 0;
        const totalVolumes = item.volumes || 0;

        // Preferência por capítulos se disponível
        if (totalChapters > 0 || currentChapters > 0) {
            let progressObj = createProgressObject(currentChapters, totalChapters, 'capítulos', {
                volumes: currentVolumes,
                totalVolumes: totalVolumes
            });

            // Adiciona info de volumes ao display se disponível
            if (currentVolumes !== undefined && totalVolumes !== undefined) {
                progressObj = addVolumeInfo(progressObj, currentVolumes, totalVolumes);
            }

            return progressObj;
        }
        // Se não tiver capítulos, usa volumes
        else if (totalVolumes > 0 || currentVolumes > 0) {
            return createProgressObject(currentVolumes, totalVolumes, 'volumes');
        }
    }

    if (mediaType === 'series') {
        const currentEpisodes = progress.episodes || 0;
        const currentSeasons = progress.seasons || 0;
        const totalEpisodes = item.episodes || 0;
        const totalSeasons = item.seasons || 0;
        const episodesPerSeason = item.episodesPerSeason || [];

        // Se não temos dados de episódios por temporada, usar lógica simples
        if (episodesPerSeason.length === 0) {
            return createProgressObject(currentEpisodes, totalEpisodes, 'episódios', {
                seasons: currentSeasons,
                totalSeasons: totalSeasons
            });
        }

        // Encontrar a temporada atual e episódio atual nela
        let seasonIndex = Math.max(0, (currentSeasons || 1) - 1);
        let episodeInSeason = currentEpisodes || 0;

        // Se temos mais temporadas que as definidas, ajustar
        if (seasonIndex >= episodesPerSeason.length) {
            seasonIndex = episodesPerSeason.length - 1;
            episodeInSeason = episodesPerSeason[seasonIndex] || 0;
        }

        // Calcular episódios assistidos totais
        let watchedEpisodes = 0;
        for (let i = 0; i < seasonIndex; i++) {
            watchedEpisodes += episodesPerSeason[i] || 0;
        }
        watchedEpisodes += episodeInSeason;

        // Calcular porcentagem
        const percentage = totalEpisodes > 0
            ? Math.round((watchedEpisodes / totalEpisodes) * 100)
            : 0;

        // Episódios na temporada atual
        const episodesInCurrentSeason = episodesPerSeason[seasonIndex] || 0;

        return {
            current: episodeInSeason,
            total: episodesInCurrentSeason,
            percentage: Math.min(percentage, 100),
            unit: 'episódios',
            display: `Ep. ${episodeInSeason}/${episodesInCurrentSeason || '?'} (Temp. ${seasonIndex + 1}/${totalSeasons || '?'})`,
            seasons: seasonIndex + 1,
            totalSeasons: totalSeasons,
            seasonIndex: seasonIndex,
            episodesInCurrentSeason: episodesInCurrentSeason,
            episodesPerSeason: episodesPerSeason,
            rawWatchedEpisodes: watchedEpisodes,
            rawTotalEpisodes: totalEpisodes,
            isEmpty: watchedEpisodes === 0,
            status: userStatus,
            isJustStarted: watchedEpisodes === 0 && userStatus === 'in_progress'
        };
    }

    // Para filmes
    if (mediaType === 'movie') {
        const currentMinutes = progress.minutes || 0;
        const totalMinutes = item.runtime || 0;

        if (totalMinutes > 0 || currentMinutes > 0) {
            return createProgressObject(currentMinutes, totalMinutes, 'minutos');
        }
    }

    if (mediaType === 'game') {
        const currentHours = progress.hours || 0;
        if (item.progress?.tasks?.length > 0) {
            const tasks = item.progress.tasks;
            const completedTasks = tasks.filter(task => task.completed === true).length;
            const totalTasks = tasks.length;
            const tasksPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return {
                current: tasksPercentage,
                total: 100,
                percentage: Math.min(tasksPercentage, 100),
                unit: '%',
                display: `${completedTasks}/${totalTasks} objetivos`,
                tasksCompleted: completedTasks,
                totalTasks: totalTasks,
                hours: currentHours,
                minutes: progress.minutes || 0,
                isEmpty: completedTasks === 0,
                status: userStatus,
                isJustStarted: completedTasks === 0 && userStatus === 'in_progress'
            };
        }

    }

    return null;
};

// ============= FUNÇÕES DE TRANSFORMAÇÃO =============
export const filterAndSortMedia = (mediaList, mediaType, selectedStatus, searchQuery, sortBy) => {
    console.log('mediaList:', mediaList);
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
            transformed.progress.current = item.progress?.minutes || 0;
            transformed.progress.total = item.mediaCacheId?.essentialData?.runtime || 0;
            transformed.progress.unit = 'min';
        } else if (mediaType === 'anime' || mediaType === 'series') {
            transformed.progress.current = item.progress?.episodes || 0;
            transformed.progress.total = item.mediaCacheId?.essentialData?.episodes || 0;
            transformed.progress.unit = 'eps';
        } else if (mediaType === 'manga') {
            transformed.progress.current = item.progress?.chapters || 0;
            transformed.progress.total = item.mediaCacheId?.essentialData?.chapters || 0;
            transformed.progress.unit = 'cap';
        } else if (mediaType === 'game') {
            // Calcular baseado em objetivos primeiro
            if (item.progress?.tasks?.length > 0) {
                const tasks = item.progress.tasks;
                const completedTasks = tasks.filter(task => task.completed === true).length;
                const totalTasks = tasks.length;
                if (totalTasks > 0) {
                    transformed.progress.current = (completedTasks / totalTasks) * 100;
                    transformed.progress.total = 100;
                    transformed.progress.unit = '%';
                }
            } else {
                // Fallback para porcentagem manual ou tempo
                const percentage = item.progress?.percentage || 0;
                if (percentage > 0) {
                    transformed.progress.current = percentage;
                    transformed.progress.total = 100;
                    transformed.progress.unit = '%';
                } else {
                    const current = item.progress?.current || item.progress?.minutes || 0;
                    const total = item.playtime || 0;
                    transformed.progress.current = current;
                    transformed.progress.total = total;
                    transformed.progress.unit = 'min';
                }
            }
        }

        // Adiciona dados essenciais para fácil acesso no MediaCard
        const essential = item.mediaCacheId?.essentialData || {};
        transformed.title = essential.title;
        transformed.description = essential.description;
        transformed.episodesPerSeason = essential.episodesPerSeason;
        transformed.coverImage = essential.coverImage;
        transformed.releasePeriod = essential.releasePeriod; // Alterado para releasePeriod
        transformed.runtime = essential.runtime;
        transformed.genres = essential.genres;
        transformed.averageRating = essential.averageRating;
        transformed.ratingCount = essential.ratingCount;
        transformed.popularity = essential.popularity;

        // Status do item na biblioteca do usuário
        transformed.status = item.status;
        transformed.userRating = item.userRating;
        transformed.personalNotes = item.personalNotes;

        return transformed;
    });

    // Ordenação - ATUALIZADA
    result.sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                // Priorizar por releasePeriod (mais recente primeiro)
                // Se ambos têm releasePeriod
                if (a.releasePeriod && b.releasePeriod) {
                    // Comparar por ano primeiro
                    if (b.releasePeriod.year !== a.releasePeriod.year) {
                        return b.releasePeriod.year - a.releasePeriod.year;
                    }
                    // Se mesmo ano, comparar por mês
                    return (b.releasePeriod.month || 0) - (a.releasePeriod.month || 0);
                }

                // Se apenas um tem releasePeriod
                if (a.releasePeriod && !b.releasePeriod) return -1;
                if (!a.releasePeriod && b.releasePeriod) return 1;

                // Fallback: data de criação/atualização (mais recente primeiro)
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
                    } else if (mediaType === 'game') {
                        // Para jogos: usar progress.current que já foi calculado
                        return item.progress?.current || 0;
                    }
                    return 0;
                };

                const percentageA = calculatePercentage(a);
                const percentageB = calculatePercentage(b);

                // Ordena do MAIOR progresso para o MENOR
                return percentageB - percentageA;

            case 'release':
                // Ordenação por ano de lançamento (mais antigo primeiro)
                const yearA = extractReleaseYear(a) || 0;
                const yearB = extractReleaseYear(b) || 0;
                return yearB - yearA; // Maior ano primeiro

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
            icon: Library,
            color: 'from-slate-500/20 to-slate-600/20',
            activeColor: 'from-slate-500/30 to-slate-600/30',
            textColor: 'text-slate-300',
            activeTextColor: 'text-slate-200',
            borderColor: 'border-slate-500/30'
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

    if (mediaType === 'game') {
        return results.map(game => {
            return {
                sourceId: game.sourceId?.toString(),
                title: game.title,
                coverImage: game.coverImage,
                platforms: Array.isArray(game.platforms)
                    ? game.platforms.filter(p => p && typeof p === 'string')
                    : [],
                releasePeriod: game.releasePeriod,
                genres: Array.isArray(game.genres)
                    ? game.genres.map(g => ({
                        id: g.id,
                        name: g.name
                    }))
                    : [],
                playtime: game.playtime,
                averageRating: game.averageRating,
                ratingCount: game.ratingCount,
            };
        });
    } else if (mediaType === 'movie' || mediaType === 'series') {
        return results.map(item => {
            const dateString = mediaType === 'movie' ? item.release_date : item.first_air_date;
            const releasePeriod = dateString ? {
                year: new Date(dateString).getFullYear(),
                month: new Date(dateString).getMonth() + 1
            } : undefined;

            const genres = Array.isArray(item.genres) && item.genres.length > 0
                ? item.genres.map(g => ({
                    id: g.id,
                    name: g.name
                }))
                : [];

            return {
                sourceId: item.id.toString(),
                title: mediaType === 'movie' ? item.title : item.name,
                description: item.overview,
                coverImage: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                releasePeriod: releasePeriod,
                genres: genres,
                averageRating: item.vote_average, // TMDB sempre tem, mas pode ser 0
                ratingCount: item.vote_count, // TMDB sempre tem, pode ser 0
                runtime: item.runtime || undefined, // usar undefined em vez de 0
            };
        });
    } else if (mediaType === 'manga' || mediaType === 'anime') {
        return results.map(item => {
            const coverImage = getImageURL(item.images) || item.coverImage;

            // Prioridade: usar releasePeriod existente
            let releasePeriod = item.releasePeriod; // primeiro tenta usar o existente

            if (!releasePeriod) {
                // Só tenta extrair se não existir releasePeriod
                if (mediaType === 'anime' && item.aired?.from) {
                    const date = new Date(item.aired.from);
                    releasePeriod = {
                        year: date.getFullYear(),
                        month: date.getMonth() + 1
                    };
                } else if (mediaType === 'manga' && item.published?.from) {
                    const date = new Date(item.published.from);
                    releasePeriod = {
                        year: date.getFullYear(),
                        month: date.getMonth() + 1
                    };
                }
            }

            const baseItem = {
                sourceId: item.id.toString(),
                sorceApi: 'jikan',
                title: item.title,
                category: item.category,
                description: item.description,
                coverImage: coverImage,
                releasePeriod: releasePeriod, // agora mantém o original se existir
                averageRating: item.averageRating || undefined,
                ratingCount: item.ratingCount || undefined,
                popularity: item.popularity || undefined,
                members: item.members || undefined,
                genres: Array.isArray(item.genres)
                    ? item.genres.map(g => ({
                        id: g.mal_id || 0,
                        name: g.name
                    }))
                    : []
            };

            if (mediaType === 'manga') {
                return {
                    ...baseItem,
                    volumes: item.volumes || undefined,
                    chapters: item.chapters || undefined,
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
                    episodes: item.episodes || undefined,
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
};