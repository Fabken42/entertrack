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

          const animes = searchResult.data?.map(item => ({
            id: item.mal_id,
            title: item.title,
            description: item.synopsis,
            imageUrl: jikanClient.getImageURL(item.images),
            releaseYear: item.aired?.from ? new Date(item.aired.from).getFullYear() : null,
            category: item.type,
            episodes: item.episodes,
            status: item.status,
            mediaType: item.type,
            apiRating: item.score || 0,
            apiVoteCount: item.scored_by || 0,
            popularity: item.popularity || 0,
            studios: item.studios?.map(studio => studio.name) || [],
            members: item.members || 0,
            genres: item.genres?.map(g => ({
              id: g.mal_id?.toString() || '0',
              name: g.name
            })) || []
          }))

          return NextResponse.json({
            results: animes,
            total: searchResult.pagination?.items?.total || animes.length,
            pagination: searchResult.pagination
          });

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

          const mangas = mangaSearchResult.data?.map(item => ({
            id: item.mal_id,
            title: item.title,
            description: item.synopsis,
            imageUrl: jikanClient.getImageURL(item.images),
            releaseYear: item.published?.from ? new Date(item.published.from).getFullYear() : null,
            volumes: item.volumes || 0,
            chapters: item.chapters || 0,
            status: item.status,
            category: item.type,
            apiRating: item.score || 0,
            apiVoteCount: item.scored_by || 0,
            popularity: item.popularity || 0,
            authors: item.authors?.map(author => author.name) || [],
            members: item.members || 0,
            genres: item.genres?.map(g => ({
              id: g.mal_id?.toString() || '0',
              name: g.name
            })) || [],
          }))

          return NextResponse.json({
            results: mangas,
            total: mangaSearchResult.pagination?.items?.total || mangas.length,
            pagination: mangaSearchResult.pagination
          });

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