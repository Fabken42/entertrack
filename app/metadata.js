// app/metadata.js
export const metadata = {
  title: {
    default: 'EnterTrack - Gerencie seus entretenimentos',
    template: '%s | EnterTrack',
  },
  description: 'Acompanhe filmes, séries, animes, livros e games em um só lugar',
  keywords: ['filmes', 'séries', 'animes', 'livros', 'jogos', 'tracker', 'organizador'],
  authors: [{ name: 'EnterTrack' }],
  creator: 'EnterTrack',
  publisher: 'EnterTrack',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://entertrack.app',
    title: 'EnterTrack - Gerencie seus entretenimentos',
    description: 'Acompanhe filmes, séries, animes, livros e games em um só lugar',
    siteName: 'EnterTrack',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EnterTrack - Organize seu entretenimento',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EnterTrack - Gerencie seus entretenimentos',
    description: 'Acompanhe filmes, séries, animes, livros e games em um só lugar',
    images: ['/twitter-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};