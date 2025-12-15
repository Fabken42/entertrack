// /app/api/external/myanimelist/route.js
import { NextResponse } from 'next/server';
import { jikanClient } from '@/lib/api/jikan';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const limit = searchParams.get('limit') || '10';
  const page = searchParams.get('page') || '1';
  const id = searchParams.get('id');

  let type = 'anime';

  if (action?.includes('manga')) {
    type = 'manga';
  } else if (action?.includes('anime')) {
    type = 'anime';
  }

  try {
    if (type === 'anime') {
      switch (action) {
        case 'search-anime':
          if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
          }
          const searchResult = await jikanClient.searchAnime(query, parseInt(page), parseInt(limit));
          
          // Formatar no mesmo estilo que a API de discover
          const animes = searchResult.data?.map(item => ({
            mal_id: item.mal_id,
            title: item.title,
            description: item.synopsis,
            imageUrl: jikanClient.getImageURL(item.images),
            year: item.year,
            releaseYear: item.year,
            score: item.score,
            rating: item.score,
            scored_by: item.scored_by,
            ratingsCount: item.scored_by, // Adicionar este campo para compatibilidade
            rank: item.rank,
            popularity: item.popularity,
            episodes: item.episodes || 0,
            status: item.status,
            type: item.type,
            mediaType: 'anime',
            members: item.members,
            genres: item.genres?.map(g => ({
              mal_id: g.mal_id,
              id: g.mal_id?.toString(),
              name: g.name
            })) || [],
            aired: item.aired,
            studios: item.studios?.map(s => s.name) || [],
            source: item.source,
            season: item.season,
            externalId: item.mal_id?.toString()
          })) || [];

          return NextResponse.json({
            results: animes,
            total: searchResult.pagination?.items?.total || animes.length,
            pagination: searchResult.pagination
          });

        // ... outros casos para anime (anime-details, popular-anime, top-anime)
        default:
          return NextResponse.json({ error: 'Invalid action for anime' }, { status: 400 });
      }
    }

    if (type === 'manga') {
      switch (action) {
        case 'search-manga':
          if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
          }
          const mangaSearchResult = await jikanClient.searchManga(query, parseInt(page), parseInt(limit));
          
          // Formatar no MESMO formato que processMangaResults na API de discover
          const mangas = mangaSearchResult.data?.map(item => ({
            mal_id: item.mal_id,
            id: item.mal_id,
            title: item.title,
            description: item.synopsis,
            synopsis: item.synopsis,
            imageUrl: jikanClient.getImageURL(item.images),
            year: item.published?.from ? new Date(item.published.from).getFullYear() : item.year,
            releaseYear: item.published?.from ? new Date(item.published.from).getFullYear() : item.year,
            score: item.score,
            rating: item.score,
            scored_by: item.scored_by,
            ratingsCount: item.scored_by, // 🔥 CAMPO CRÍTICO: adicionar ratingsCount
            rank: item.rank,
            popularity: item.popularity,
            volumes: item.volumes || 0,
            chapters: item.chapters || 0,
            status: item.status,
            type: item.type,
            mediaType: 'manga',
            members: item.members,
            genres: item.genres?.map(g => ({
              mal_id: g.mal_id,
              id: g.mal_id?.toString(),
              name: g.name
            })) || [],
            authors: item.authors?.map(author => author.name) || [],
            serializations: item.serializations?.map(s => ({
              name: s.name
            })) || [],
            published: item.published,
            externalId: item.mal_id?.toString()
          })) || [];

          return NextResponse.json({
            results: mangas,
            total: mangaSearchResult.pagination?.items?.total || mangas.length,
            pagination: mangaSearchResult.pagination
          });

        // ... outros casos para manga (manga-details, popular-manga, top-manga)
        default:
          return NextResponse.json({ error: 'Invalid action for manga' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
  } catch (error) {
    console.error('🔍 MAL API - General error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch data from MyAnimeList',
        details: error.message
      },
      { status: 500 }
    );
  }
}