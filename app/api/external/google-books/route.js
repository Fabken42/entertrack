// /entertrack/app/api/external/google-books/route.js

import { NextResponse } from 'next/server';
import { googleBooksClient } from '@/lib/api/google-books';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const maxResults = searchParams.get('maxResults') || '20';
  const startIndex = searchParams.get('startIndex') || '0';
  const id = searchParams.get('id');
  const category = searchParams.get('category');

  try {
    switch (action) {
      case 'search-books':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }
        const searchResult = await googleBooksClient.searchBooks(query, parseInt(maxResults), parseInt(startIndex));
        // Formatar os dados para nosso formato
        const books = searchResult.items?.map(item => googleBooksClient.formatBookData(item)) || [];
        return NextResponse.json({ 
          results: books,
          totalItems: searchResult.totalItems || 0
        });

      case 'book-details':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
        }
        const bookDetails = await googleBooksClient.getBookDetails(id);
        const formattedDetails = googleBooksClient.formatBookData(bookDetails);
        return NextResponse.json(formattedDetails);

      case 'books-by-category':
        if (!category) {
          return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 });
        }
        const categoryResult = await googleBooksClient.getBooksByCategory(category, parseInt(maxResults));
        const categoryBooks = categoryResult.items?.map(item => googleBooksClient.formatBookData(item)) || [];
        return NextResponse.json({ 
          results: categoryBooks,
          totalItems: categoryResult.totalItems || 0
        });

      case 'popular-books':
        const popularResult = await googleBooksClient.getPopularBooks(parseInt(maxResults));
        const popularBooks = popularResult.items?.map(item => googleBooksClient.formatBookData(item)) || [];
        return NextResponse.json({ 
          results: popularBooks,
          totalItems: popularResult.totalItems || 0
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Google Books API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Google Books' },
      { status: 500 }
    );
  }
}