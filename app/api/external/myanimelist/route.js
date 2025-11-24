// /app/api/external/myanimelist/route.js
import { NextResponse } from 'next/server';
import { malClient } from '@/lib/api/myanimelist';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const limit = searchParams.get('limit') || '20';
  const offset = searchParams.get('offset') || '0';
  const id = searchParams.get('id');
  
  // CORREÇÃO: Determinar o tipo baseado na action, não usar padrão 'anime'
  let type = 'anime'; // padrão
  
  if (action?.includes('manga')) {
    type = 'manga';
  } else if (action?.includes('anime')) {
    type = 'anime';
  }

  console.log('🔍 MAL API - Request received:', {
    action,
    query,
    limit,
    offset,
    id,
    type // Agora mostra o tipo correto
  });

  try {
    // Ações para animes
    if (type === 'anime') {
      switch (action) {
        case 'search-anime':
          if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
          }
          const searchResult = await malClient.searchAnime(query, parseInt(limit), parseInt(offset));
          const animes = searchResult.data.map(item => malClient.formatAnimeData(item.node));
          return NextResponse.json({ 
            results: animes,
            total: searchResult.paging?.total || animes.length
          });

        case 'anime-details':
          if (!id) {
            return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
          }
          const animeDetails = await malClient.getAnimeDetails(parseInt(id));
          const formattedDetails = malClient.formatAnimeData(animeDetails);
          return NextResponse.json(formattedDetails);

        case 'popular-anime':
          const popularResult = await malClient.getPopularAnime(parseInt(limit));
          const popularAnimes = popularResult.data.map(item => malClient.formatAnimeData(item.node));
          return NextResponse.json({ 
            results: popularAnimes,
            total: popularResult.paging?.total || popularAnimes.length
          });

        case 'top-anime':
          const topResult = await malClient.getTopAnime(parseInt(limit));
          const topAnimes = topResult.data.map(item => malClient.formatAnimeData(item.node));
          return NextResponse.json({ 
            results: topAnimes,
            total: topResult.paging?.total || topAnimes.length
          });

        default:
          return NextResponse.json({ error: 'Invalid action for anime' }, { status: 400 });
      }
    }

    // Ações para mangás
    if (type === 'manga') {
      switch (action) {
        case 'search-manga':
          if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
          }
          console.log('🔍 MAL API - Searching manga with params:', { query, limit, offset });
          const mangaSearchResult = await malClient.searchManga(query, parseInt(limit), parseInt(offset));
          console.log('🔍 MAL API - Manga search raw result:', mangaSearchResult);
          const mangas = mangaSearchResult.data.map(item => malClient.formatMangaData(item.node));
          return NextResponse.json({ 
            results: mangas,
            total: mangaSearchResult.paging?.total || mangas.length
          });

        case 'manga-details':
          if (!id) {
            return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
          }
          const mangaDetails = await malClient.getMangaDetails(parseInt(id));
          const formattedMangaDetails = malClient.formatMangaData(mangaDetails);
          return NextResponse.json(formattedMangaDetails);

        case 'popular-manga':
          const popularMangaResult = await malClient.getPopularManga(parseInt(limit));
          const popularMangas = popularMangaResult.data.map(item => malClient.formatMangaData(item.node));
          return NextResponse.json({ 
            results: popularMangas,
            total: popularMangaResult.paging?.total || popularMangas.length
          });

        case 'top-manga':
          const topMangaResult = await malClient.getTopManga(parseInt(limit));
          const topMangas = topMangaResult.data.map(item => malClient.formatMangaData(item.node));
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