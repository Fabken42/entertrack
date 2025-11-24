// /entertrack/app/api/external/rawg/route.js

import { NextResponse } from 'next/server';
import { rawgClient } from '@/lib/api/rawg';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('pageSize') || '20';
  const id = searchParams.get('id');

  try {
    switch (action) {
      case 'search-games':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }
        const searchResult = await rawgClient.searchGames(query, parseInt(page), parseInt(pageSize));
        // Formatar os dados para nosso formato
        const games = searchResult.results.map(game => rawgClient.formatGameData(game));
        return NextResponse.json({ 
          results: games,
          count: searchResult.count,
          next: searchResult.next,
          previous: searchResult.previous
        });

      case 'game-details':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
        }
        const gameDetails = await rawgClient.getGameDetails(id);
        const formattedDetails = rawgClient.formatGameData(gameDetails);
        return NextResponse.json(formattedDetails);

      case 'popular-games':
        const popularResult = await rawgClient.getPopularGames(parseInt(page), parseInt(pageSize));
        const popularGames = popularResult.results.map(game => rawgClient.formatGameData(game));
        return NextResponse.json({ 
          results: popularGames,
          count: popularResult.count,
          next: popularResult.next,
          previous: popularResult.previous
        });

      case 'top-games':
        const topResult = await rawgClient.getTopRatedGames(parseInt(page), parseInt(pageSize));
        const topGames = topResult.results.map(game => rawgClient.formatGameData(game));
        return NextResponse.json({ 
          results: topGames,
          count: topResult.count,
          next: topResult.next,
          previous: topResult.previous
        });

      case 'genres':
        const genres = await rawgClient.getGenres();
        return NextResponse.json(genres);

      case 'platforms':
        const platforms = await rawgClient.getPlatforms();
        return NextResponse.json(platforms);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('RAWG API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from RAWG' },
      { status: 500 }
    );
  }
}