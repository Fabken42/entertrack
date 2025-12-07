// /app/api/external/myanimelist/route.js
import { NextResponse } from 'next/server';
import { jikanClient } from '@/lib/api/jikan';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const limit = searchParams.get('limit') || '20';
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
          const animes = searchResult.data.map(item => jikanClient.formatAnimeData(item));
          return NextResponse.json({
            results: animes,
            total: searchResult.pagination?.items?.total || animes.length
          });

        case 'anime-details':
          if (!id) {
            return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
          }
          const animeDetails = await jikanClient.getAnimeDetails(parseInt(id));
          const formattedDetails = jikanClient.formatAnimeData(animeDetails.data);
          return NextResponse.json(formattedDetails);

        case 'popular-anime':
          const popularResult = await jikanClient.getPopularAnime(parseInt(limit));
          const popularAnimes = popularResult.data.map(item => jikanClient.formatAnimeData(item.node));
          return NextResponse.json({
            results: popularAnimes,
            total: popularResult.paging?.total || popularAnimes.length
          });

        case 'top-anime':
          const topResult = await jikanClient.getTopAnime(parseInt(limit));
          const topAnimes = topResult.data.map(item => jikanClient.formatAnimeData(item.node));
          return NextResponse.json({
            results: topAnimes,
            total: topResult.paging?.total || topAnimes.length
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
          const mangas = mangaSearchResult.data.map(item => jikanClient.formatMangaData(item));
          return NextResponse.json({
            results: mangas,
            total: mangaSearchResult.pagination?.items?.total || mangas.length
          });

        case 'manga-details':
          if (!id) {
            return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
          }
          const mangaDetails = await jikanClient.getMangaDetails(parseInt(id));
          const formattedMangaDetails = jikanClient.formatMangaData(mangaDetails.data);
          return NextResponse.json(formattedMangaDetails);

        case 'popular-manga':
          const popularMangaResult = await jikanClient.getPopularManga(parseInt(limit));
          const popularMangas = popularMangaResult.data.map(item => jikanClient.formatMangaData(item.node));
          return NextResponse.json({
            results: popularMangas,
            total: popularMangaResult.paging?.total || popularMangas.length
          });

        case 'top-manga':
          const topMangaResult = await jikanClient.getTopManga(parseInt(limit));
          const topMangas = topMangaResult.data.map(item => jikanClient.formatMangaData(item.node));
          return NextResponse.json({
            results: topMangas,
            total: topMangaResult.paging?.total || topMangas.length
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