'use client';

import React, { useState } from 'react'; 
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Search, User, LogOut, Menu, Compass, X } from 'lucide-react';
import { mockUser } from '@/lib/mock-data';

const Header = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mediaNavigation = [
    { name: 'Filmes', href: '/movies', icon: '🎬', discoverHref: '/discover/movies' },
    { name: 'Séries', href: '/series', icon: '📺', discoverHref: '/discover/series' },
    { name: 'Animes', href: '/animes', icon: '🇯🇵', discoverHref: '/discover/animes' },
    { name: 'Mangás', href: '/mangas', icon: '📚', discoverHref: '/discover/mangas' },
    { name: 'Livros', href: '/books', icon: '📖', discoverHref: '/discover/books' },
    { name: 'Games', href: '/games', icon: '🎮', discoverHref: '/discover/games' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="lg:hidden text-white hover:bg-gray-700"
              icon={isMobileMenuOpen ? X : Menu}
            />
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2d3748] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ET</span>
              </div>
              <span className="font-bold text-xl text-white hidden sm:block">
                EnterTrack
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 ml-8">
              {/* Media Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                  <Compass className="w-4 h-4" />
                  Explorar
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute left-0 top-full mt-1 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    {/* Dashboard Link */}
                    <Link
                      href="/dashboard"
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors mb-2',
                        pathname === '/dashboard' || pathname?.startsWith('/dashboard/')
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      )}
                    >
                      <span>📊</span>
                      Dashboard
                    </Link>

                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Minha Biblioteca
                    </div>
                    {mediaNavigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          )}
                        >
                          <span>{item.icon}</span>
                          {item.name}
                        </Link>
                      );
                    })}

                    <div className="border-t border-gray-600 my-2"></div>

                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Descobrir
                      </div>
                      {mediaNavigation.map((item) => {
                        const isActive = pathname === item.discoverHref;
                        return (
                          <Link
                            key={`discover-${item.name}`}
                            href={item.discoverHref}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                              isActive
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            )}
                          >
                            <span>✨</span>
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Right Section - User Menu */}
          <div className="flex items-center gap-4">
            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex sm:flex-col sm:items-end">
                <span className="text-sm font-medium text-white">
                  {mockUser.name}
                </span>
                <span className="text-xs text-gray-400">
                  {mockUser.email}
                </span>
              </div>

              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-white hover:bg-gray-700"
                  icon={User}
                >
                  <span className="hidden sm:block">Perfil</span>
                </Button>

                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Meu Perfil
                    </Link>
                    <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 rounded-md hover:bg-red-900 hover:text-white transition-colors">
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 bg-gray-800 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {/* Dashboard Link Mobile */}
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                  pathname === '/dashboard' || pathname?.startsWith('/dashboard/')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <span>📊</span>
                Dashboard
              </Link>

              <div className="border-t border-gray-600 my-2"></div>

              {/* Library Section */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Minha Biblioteca
              </div>
              {mediaNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    )}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}

              <div className="border-t border-gray-600 my-2"></div>

              {/* Discover Section */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Descobrir
              </div>
              {mediaNavigation.map((item) => {
                const isActive = pathname === item.discoverHref;
                return (
                  <Link
                    key={`discover-${item.name}`}
                    href={item.discoverHref}
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-colors',
                      isActive
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    )}
                  >
                    <span>✨</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;