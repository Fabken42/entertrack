'use client';

import React from 'react'; 
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { X, BarChart3, Settings } from 'lucide-react';
import { mockUser } from '@/lib/mock-data';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Filmes', href: '/movies', icon: '🎬' },
    { name: 'Séries', href: '/series', icon: '📺' },
    { name: 'Animes', href: '/animes', icon: '🇯🇵' },
    { name: 'Livros', href: '/books', icon: '📚' },
    { name: 'Games', href: '/games', icon: '🎮' },
  ];

  const secondaryNavigation = [
    { name: 'Estatísticas', href: '/dashboard/statistics', icon: BarChart3 },
    { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ET</span>
              </div>
              <span className="font-bold text-xl text-white">EnterTrack</span>
            </Link>
            
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-700 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Mídias
              </h3>
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    )}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="space-y-1 pt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Geral
              </h3>
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {mockUser.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {mockUser.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;