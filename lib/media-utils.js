/**
 * Converte dados do formulário para o modelo MediaEntry
 */
export function formatMediaEntryFromForm(formData, userId, externalData = null) {
  const {
    title,
    description,
    releaseYear,
    genres,
    status,
    rating,
    comment,
    imageUrl,
    progress,
    mediaType,
    // Campos específicos do formulário
    currentTimeHours,
    currentTimeMinutes,
    currentTimeSeconds,
    currentEpisode,
    currentSeason,
    currentVolume,
    currentPage,
    currentChapter,
    hoursPlayed,
    completionPercentage,
    pendingTasks,
    // Dados específicos da API
    apiRating,
    apiVoteCount,
    episodes,
    volumes,
    chapters,
    popularity,
    members,
    rank,
    // Outros campos
    ...rest
  } = formData;

  // Calcular tempo total em minutos para filmes
  let totalMinutes = 0;
  if (currentTimeHours || currentTimeMinutes || currentTimeSeconds) {
    totalMinutes = (currentTimeHours || 0) * 60 + 
                   (currentTimeMinutes || 0) + 
                   Math.round((currentTimeSeconds || 0) / 60);
  }

  // Mapear dados do progresso
  const progressData = {
    // Filmes
    currentTime: totalMinutes || progress?.currentTime,
    totalTime: rest.runtime || progress?.totalTime,
    
    // Séries e Animes
    currentEpisode: currentEpisode || progress?.currentEpisode,
    currentSeason: currentSeason || progress?.currentSeason || 1,
    totalEpisodes: episodes || progress?.totalEpisodes,
    totalSeasons: rest.seasons || progress?.totalSeasons,
    
    // Mangás
    currentVolume: currentVolume || progress?.currentVolume,
    currentChapter: currentChapter || progress?.currentChapter,
    currentPage: currentPage || progress?.currentPage,
    totalVolumes: volumes || progress?.totalVolumes,
    totalChapters: chapters || progress?.totalChapters,
    totalPages: rest.pageCount || progress?.totalPages,
    
    // Livros
    totalPagesBook: rest.pageCount || progress?.totalPagesBook,
    
    // Jogos
    hoursPlayed: hoursPlayed || progress?.hoursPlayed,
    completionPercentage: completionPercentage || progress?.completionPercentage,
    pendingTasks: Array.isArray(pendingTasks) ? pendingTasks : 
                  (progress?.pendingTasks || []),
  };

  // Criar objeto de avaliação se houver
  const ratingData = rating ? {
    value: rating,
    score: mapRatingToScore(rating),
    comment: comment || '',
    createdAt: new Date(),
  } : undefined;

  // Dados específicos por tipo de mídia
  const specificData = {
    // Filmes
    runtime: rest.runtime || rest.duration,
    
    // Séries e Animes
    seasons: rest.seasons,
    episodes,
    nextEpisodeDate: rest.nextEpisodeDate,
    
    // Animes
    animeType: rest.animeType,
    studio: rest.studio,
    
    // Mangás
    volumes,
    chapters,
    mangaType: rest.mangaType,
    
    // Livros
    authors: Array.isArray(rest.authors) ? rest.authors : 
             (rest.authors ? [rest.authors] : []),
    publisher: rest.publisher,
    isbn: rest.isbn,
    pageCount: rest.pageCount,
    
    // Jogos
    platforms: Array.isArray(rest.platforms) ? rest.platforms : 
               (rest.platforms ? [rest.platforms] : []),
    developer: rest.developer,
    publisherGame: rest.publisherGame,
    averagePlaytime: rest.averagePlaytime,
  };

  // Timeline automática
  const timelineData = {
    addedAt: new Date(),
    ...(status === 'in_progress' && { startedAt: new Date() }),
    ...(status === 'completed' && { completedAt: new Date() }),
    ...(status === 'dropped' && { droppedAt: new Date() }),
  };

  // Dados da API externa
  const externalDataObj = externalData ? {
    source: mapMediaTypeToSource(mediaType),
    externalId: externalData.externalId || externalData.id.toString(),
    apiRating: apiRating || externalData.vote_average,
    apiVoteCount: apiVoteCount || externalData.vote_count,
    popularity: popularity || externalData.popularity,
    members: members || externalData.members,
    rank: rank || externalData.rank,
  } : {
    source: 'manual',
    externalId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  return {
    userId,
    mediaType,
    title,
    originalTitle: rest.originalTitle || title,
    description,
    imageUrl: imageUrl || externalData?.poster_path || externalData?.image_url,
    posterUrl: externalData?.poster_path || imageUrl,
    backdropUrl: externalData?.backdrop_path,
    releaseYear: releaseYear || new Date(rest.releaseDate).getFullYear(),
    releaseDate: rest.releaseDate ? new Date(rest.releaseDate) : undefined,
    genres: Array.isArray(genres) ? genres : [genres].filter(Boolean),
    tags: Array.isArray(rest.tags) ? rest.tags : [],
    status,
    progress: progressData,
    rating: ratingData,
    priority: rest.priority || 3,
    isFavorite: rest.isFavorite || false,
    isPrivate: rest.isPrivate || false,
    timeline: timelineData,
    externalData: externalDataObj,
    specificData,
    notes: rest.notes,
    review: rest.review,
  };
}

/**
 * Mapeia rating textual para score numérico
 */
function mapRatingToScore(rating) {
  const ratingMap = {
    terrible: 1,
    bad: 2,
    ok: 3,
    good: 4,
    great: 5,
    perfect: 6,
  };
  return ratingMap[rating] || 3;
}

/**
 * Mapeia tipo de mídia para fonte da API
 */
function mapMediaTypeToSource(mediaType) {
  const sourceMap = {
    movie: 'tmdb',
    series: 'tmdb',
    anime: 'jikan',
    manga: 'jikan',
    game: 'rawg',
    book: 'google_books',
  };
  return sourceMap[mediaType] || 'manual';
}

/**
 * Formata dados do MediaEntry para exibição
 */
export function formatMediaEntryForDisplay(entry) {
  if (!entry) return null;

  return {
    id: entry._id.toString(),
    userId: entry.userId.toString(),
    mediaType: entry.mediaType,
    title: entry.title,
    originalTitle: entry.originalTitle,
    description: entry.description,
    imageUrl: entry.imageUrl,
    posterUrl: entry.posterUrl,
    backdropUrl: entry.backdropUrl,
    releaseYear: entry.releaseYear,
    genres: entry.genres || [],
    tags: entry.tags || [],
    status: entry.status,
    
    // Progresso formatado
    progress: {
      percentage: entry.getProgressPercentage ? entry.getProgressPercentage() : 0,
      timeDisplay: entry.getTimeDisplay ? entry.getTimeDisplay() : null,
      episodeDisplay: entry.getEpisodeDisplay ? entry.getEpisodeDisplay() : null,
      raw: entry.progress,
    },
    
    // Avaliação
    rating: entry.rating ? {
      value: entry.rating.value,
      score: entry.rating.score,
      comment: entry.rating.comment,
      createdAt: entry.rating.createdAt,
    } : null,
    
    // Metadados
    priority: entry.priority,
    isFavorite: entry.isFavorite,
    isPrivate: entry.isPrivate,
    
    // Timeline
    timeline: entry.timeline || {},
    
    // Dados específicos
    specificData: entry.specificData || {},
    
    // Dados externos
    externalData: entry.externalData || {},
    
    // Informações de controle
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    lastUpdated: entry.lastUpdated,
  };
}