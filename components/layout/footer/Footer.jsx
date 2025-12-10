'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Heart, Sparkles, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass border-t border-white/10 backdrop-blur-xl">
      <div className="w-full px-4 py-12 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-animate rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-sm">ET</span>
              </div>
              <span className="font-bold text-xl text-gradient-primary">
                EnterTrack
              </span>
            </div>
            <p className="text-sm text-white/60 max-w-xs">
              Acompanhe seus entretenimentos favoritos em um só lugar.
            </p>
            <p className="text-xs text-white/40">
              © {currentYear} EnterTrack. Todos os direitos reservados.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h4 className="font-semibold text-white text-sm">Produto</h4>
              <div className="space-y-2">
                <Link href="/features" className="text-sm text-white/60 hover:text-white transition-colors block">
                  Recursos
                </Link>
                <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors block">
                  Preços
                </Link>
                <Link href="/updates" className="text-sm text-white/60 hover:text-white transition-colors block">
                  Atualizações
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-white text-sm">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors block">
                  Privacidade
                </Link>
                <Link href="/terms" className="text-sm text-white/60 hover:text-white transition-colors block">
                  Termos
                </Link>
                <Link href="/cookies" className="text-sm text-white/60 hover:text-white transition-colors block">
                  Cookies
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-white text-sm">Comunidade</h4>
              <div className="space-y-2">
                <Link href="/community" className="text-sm text-white/60 hover:text-white transition-colors block">
                  Fórum
                </Link>
                <Link href="/blog" className="text-sm text-white/60 hover:text-white transition-colors block">
                  Blog
                </Link>
                <Link href="/help" className="text-sm text-white/60 hover:text-white transition-colors block">
                  Ajuda
                </Link>
              </div>
            </div>
          </div>

          {/* Social and Contact */}
          <div className="flex flex-col items-center md:items-end space-y-4">
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
              </a>
              <a
                href="mailto:contato@entertrack.app"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
              </a>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-xs text-white/40 flex items-center gap-1 justify-center md:justify-end">
                Feito com <Heart className="w-3 h-3 text-red-400 fill-current" /> pela comunidade
              </p>
              <p className="text-xs text-white/30 mt-1">
                v1.0 • Beta
              </p>
            </div>
          </div>
        </div>

        {/* Bottom separator */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40 text-center">
              EnterTrack não está afiliado com TMDB, MyAnimeList, RAWG ou Google Books.
            </p>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white/30" />
              <span className="text-xs text-white/40">
                Desenvolvido com Next.js 14 & Tailwind CSS
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;