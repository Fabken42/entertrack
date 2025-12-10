import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'EnterTrack - Gerencie seus entretenimentos',
    template: '%s | EnterTrack',
  },
  description: 'Acompanhe filmes, séries, livros e jogos em um só lugar',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}