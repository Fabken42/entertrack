import { Inter } from 'next/font/google';
import './globals.css';
import { Footer, Header } from '@/components/layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'EnterTrack - Gerencie seus entretenimentos',
  description: 'Acompanhe filmes, séries, animes, livros e games em um só lugar',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}