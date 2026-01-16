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
        const currentEpisodes = progressDetails.episodes || 0;
        const totalEpisodes = item.episodes || 0;

        if (totalEpisodes > 0 || currentEpisodes > 0) {
            return createProgressObject(currentEpisodes, totalEpisodes, 'episódios');
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
        const currentEpisodes = progressDetails.episodes || 0;
        const currentSeasons = progressDetails.seasons || 0;
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
        const currentMinutes = progressDetails.minutes || 0;
        const totalMinutes = item.runtime || 0;

        if (totalMinutes > 0 || currentMinutes > 0) {
            return createProgressObject(currentMinutes, totalMinutes, 'minutos');
        }
    }

    // Na função getProgressInfo, dentro do bloco para 'game':
    if (mediaType === 'game') {
        const currentPercentage = progressDetails.percentage || 0;
        const currentPlaytime = progressDetails.minutes || 0;
        const totalPlaytime = item.playtime || 0;

        // ✅ MUDANÇA AQUI: Verificar se há tasks primeiro
        if (item.progress?.tasks?.length > 0) {
            const tasks = item.progress.tasks;
            const completedTasks = tasks.filter(task => task.completed === true).length;
            const totalTasks = tasks.length;
            const tasksPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            if (currentPercentage > 0) {
                return createProgressObject(currentPercentage, 100, '%', {
                    tasksCompleted: completedTasks,
                    totalTasks: totalTasks
                });
            } else if (totalTasks > 0) {
                return createProgressObject(tasksPercentage, 100, '%', {
                    tasksCompleted: completedTasks,
                    totalTasks: totalTasks,
                    display: `Objetivos Concluídos: ${completedTasks}/${totalTasks}`,
                    hours: Math.floor(progressDetails.hours || 0),
                    minutes: progressDetails.minutes || 0
                });
            } else if (totalPlaytime > 0 || currentPlaytime > 0) {
                return createProgressObject(currentPlaytime, totalPlaytime, 'minutos', {
                    hours: Math.floor(currentPlaytime / 60)
                });
            }
        } else {
            if (currentPercentage > 0) {
                return createProgressObject(currentPercentage, 100, '%');
            } else if (totalPlaytime > 0 || currentPlaytime > 0) {
                return createProgressObject(currentPlaytime, totalPlaytime, 'minutos', {
                    hours: Math.floor(currentPlaytime / 60)
                });
            } else {
                // ✅ Se não houver tasks, nem porcentagem, nem playtime, retorna null
                return null;
            }
        }
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
        ratingCount: essentialData.ratingCount,
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
        } else if (mediaType === 'game') {
            // Calcular baseado em objetivos primeiro
            if (item.progress?.tasks?.length > 0) {
                const tasks = item.progress.tasks;
                const completedTasks = tasks.filter(task => task.completed === true).length;
                const totalTasks = tasks.length;
                if (totalTasks > 0) {
                    // ⚠️ CORRIGIDO: Atribuir ao transformed.progress, não retornar número
                    transformed.progress.current = (completedTasks / totalTasks) * 100;
                    transformed.progress.total = 100;
                    transformed.progress.unit = '%';
                }
            } else {
                // Fallback para porcentagem manual ou tempo
                const percentage = item.progress?.details?.percentage || 0;
                if (percentage > 0) {
                    // ⚠️ CORRIGIDO: Atribuir ao transformed.progress, não retornar número
                    transformed.progress.current = percentage;
                    transformed.progress.total = 100;
                    transformed.progress.unit = '%';
                } else {
                    const current = item.progress?.current || item.progress?.details?.minutes || 0;
                    const total = item.playtime || 0;
                    // ⚠️ CORRIGIDO: Atribuir ao transformed.progress, não retornar número
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
        transformed.imageUrl = essential.coverImage;
        transformed.releaseYear = essential.releaseYear;
        transformed.runtime = essential.runtime;
        transformed.genres = essential.genres;
        transformed.averageRating = essential.averageRating;
        transformed.ratingCount = essential.ratingCount;
        transformed.popularity = essential.popularity;

        // Status do item na biblioteca do usuário
        transformed.status = item.status;
        transformed.userRating = item.userRating;
        transformed.personalNotes = item.personalNotes;

        return transformed; // ⬅️ Agora sempre retorna o objeto transformed
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
    if (mediaType === 'game') {
        return results.map(game => ({
            sourceId: game.id?.toString(),
            title: game.name,
            description: game.description,
            imageUrl: game.imageUrl,
            platforms: game.platforms ? game.platforms.map(p => p.name) : [],
            releaseYear: game.released ? new Date(game.released).getFullYear() : undefined,
            genres: game.genres || [],
            apiRating: game.rating,
            apiVoteCount: game.ratingCount,
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
                apiVoteCount: item.scored_by || item.ratingCount || item.apiVoteCount || 0,
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
        apiVoteCount: item.scored_by || item.ratingCount || item.apiVoteCount || 0,
        releaseYear: item.releaseYear || item.year
    }));
};
