// components/sidebar/Sidebar.jsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Film,
  Tv,
  BookOpen,
  GamepadIcon,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Library,
  LayoutDashboard,
  Users,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';

const Sidebar = () => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Tentar recuperar do localStorage - ALTERADO: Inicia ABERTA (false)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved ? JSON.parse(saved) : false; // Inicia ABERTA
    }
    return false;
  });
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(true); // Inicia como expandida manualmente
  const [isMounted, setIsMounted] = useState(false);

  // Salvar estado no localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isMounted]);

  // Prevenir renderização no servidor
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Navigation items usando useMemo - ORDEM CORRIGIDA: Biblioteca > Descobrir > Geral
  const navigationItems = useMemo(() => {
    const items = [];

    // Library section (apenas para autenticados) - PRIMEIRA SEÇÃO
    if (isAuthenticated) {
      items.push({
        name: 'Minha Biblioteca',
        href: '#',
        icon: Library,
        isTitle: true,
        color: 'text-blue-400'
      });

      items.push({
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        color: 'text-cyan-400'
      });

      items.push({
        name: 'Filmes',
        href: '/movies',
        icon: Film,
        color: 'text-cyan-400'
      });

      items.push({
        name: 'Séries',
        href: '/series',
        icon: Tv,
        color: 'text-green-400'
      });

      items.push({
        name: 'Games',
        href: '/games',
        icon: GamepadIcon,
        color: 'text-purple-400'
      });

      items.push({
        name: 'Animes',
        href: '/animes',
        icon: '🇯🇵',
        color: 'text-pink-400'
      });
      
      items.push({
        name: 'Mangás',
        href: '/mangas',
        icon: BookOpen,
        color: 'text-red-400'
      });

      items.push({
        name: 'Livros',
        href: '/books',
        icon: '📖',
        color: 'text-yellow-400'
      });
    }

    // Discover section (sempre visível para todos) - SEGUNDA SEÇÃO
    items.push({
      name: 'Descobrir',
      href: '#',
      icon: Sparkles,
      isTitle: true,
      color: 'text-purple-400'
    });

    items.push({
      name: 'Filmes',
      href: '/discover/movies',
      icon: Film,
      color: 'text-cyan-400'
    });

    items.push({
      name: 'Séries',
      href: '/discover/series',
      icon: Tv,
      color: 'text-green-400'
    });

    items.push({
      name: 'Games',
      href: '/discover/games',
      icon: GamepadIcon,
      color: 'text-purple-400'
    });

    items.push({
      name: 'Animes',
      href: '/discover/animes',
      icon: '🇯🇵',
      color: 'text-pink-400'
    });

    items.push({
      name: 'Mangás',
      href: '/discover/mangas',
      icon: BookOpen,
      color: 'text-red-400'
    });

    items.push({
      name: 'Livros',
      href: '/discover/books',
      icon: '📖',
      color: 'text-yellow-400'
    });

    // General section (apenas para autenticados) - TERCEIRA SEÇÃO
    if (isAuthenticated) {
      items.push({
        name: 'Geral',
        href: '#',
        icon: Users,
        isTitle: true,
        color: 'text-gray-400'
      });

      items.push({
        name: 'Estatísticas',
        href: '/statistics',
        icon: BarChart3,
        color: 'text-indigo-400'
      });

      items.push({
        name: 'Configurações',
        href: '/settings',
        icon: Settings,
        color: 'text-gray-400'
      });
    }

    return items;
  }, [isAuthenticated]);

  // Não renderizar no servidor ou durante loading
  if (!isMounted || isLoading) {
    return null;
  }

  // Controlar expansão: apenas quando manualmente expandida
  const shouldShowExpanded = isManuallyExpanded && !isCollapsed;

  const toggleSidebar = () => {
    if (isCollapsed) {
      // Se está recolhida, expande
      setIsCollapsed(false);
      setIsManuallyExpanded(true);
    } else {
      // Se está expandida, recolhe
      setIsCollapsed(true);
      setIsManuallyExpanded(false);
    }
  };

  const renderIcon = (item, className = "") => {
    if (typeof item.icon === 'string') {
      return <span className={cn("text-lg flex-shrink-0", item.color, className)}>{item.icon}</span>;
    }
    const IconComponent = item.icon;
    return <IconComponent className={cn("w-5 h-5 flex-shrink-0", item.color, className)} />;
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-[calc(100vh-4rem)] bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 fixed left-0 top-16 z-40 overflow-hidden transition-all duration-300 ease-in-out',
          shouldShowExpanded ? 'w-64' : 'w-16'
        )}
        style={{
          boxShadow: '2px 0 30px rgba(0, 0, 0, 0.5)',
          background: 'linear-gradient(180deg, rgba(17,24,39,0.98) 0%, rgba(31,41,55,0.95) 100%)'
        }}
      >
        {/* Botão para recolher/expandir - SEMPRE VISÍVEL */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 bg-gray-800 border border-gray-700 rounded-full p-1.5 hover:bg-gray-700 hover:scale-110 transition-all duration-200 z-50 shadow-lg group"
          aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-white" />
          )}
        </button>

        {/* Header da sidebar - APENAS QUANDO EXPANDIDA */}
        {shouldShowExpanded && (
          <div className="px-4 py-3 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ET</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-bold text-white truncate bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  EnterTrack {isAuthenticated ? 'Pro' : ''}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {isAuthenticated ? `Olá, ${user?.name?.split(' ')[0] || 'Usuário'}` : 'Explore conteúdos'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da sidebar */}
        <div className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900/50">
          <nav className="space-y-1 px-2">
            {navigationItems.map((item, index) => {
              const isActive = !item.isTitle && (
                pathname === item.href ||
                (item.href !== '/discover' && pathname.startsWith(item.href))
              );

              // Se for um título/seção
              if (item.isTitle) {
                if (!shouldShowExpanded) return null;

                return (
                  <div
                    key={`title-${index}`}
                    className="px-3 py-2 mt-6 first:mt-2 relative"
                  >
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate flex items-center gap-2">
                      {renderIcon(item)}
                      <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                        {item.name}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                  </div>
                );
              }

              const isCollapsedState = !shouldShowExpanded;
              const showText = shouldShowExpanded;

              return (
                <Link
                  key={`${item.href}-${index}`}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl transition-all duration-300 group relative overflow-hidden',
                    'hover:bg-gray-800/80',
                    isActive
                      ? item.href.startsWith('/discover')
                        ? 'bg-gradient-to-r from-purple-900/30 via-purple-900/20 to-transparent text-white'
                        : 'bg-gradient-to-r from-blue-900/30 via-blue-900/20 to-transparent text-white'
                      : 'text-gray-300 hover:text-white'
                  )}
                  title={isCollapsedState ? item.name : undefined}
                >
                  {/* Ícone */}
                  <div className={cn(
                    "relative z-10 transition-transform duration-300",
                    isActive && "scale-110"
                  )}>
                    {renderIcon(item)}
                  </div>

                  {/* Texto - APENAS QUANDO EXPANDIDA */}
                  {showText && (
                    <div className="flex-1 flex items-center justify-between relative z-10">
                      <span className="text-sm font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                  )}

                  {/* Tooltip para estado recolhido */}
                  {isCollapsedState && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-2xl border border-gray-700 backdrop-blur-sm">
                      <div className="font-bold">{item.name}</div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  )}

                  {/* Indicador ativo para estado recolhido */}
                  {isCollapsedState && isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-r-full"></div>
                  )}

                  {/* Animação de ponto para itens ativos */}
                  {isActive && showText && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer da sidebar - Simplificado */}
        {shouldShowExpanded && (
          <div className="p-4 border-t border-gray-800/50">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">ET</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-white truncate">
                      EnterTrack
                    </div>
                    <div className="text-[10px] text-gray-400">
                      v1.0
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Link
                  href="/register"
                  className="block w-full py-2 px-3 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-900/30"
                >
                  Cadastre-se Grátis
                </Link>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Estilos globais */}
      <style jsx global>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6b7280, #4b5563);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9ca3af, #6b7280);
        }
      `}</style>
    </>
  );
};

export default Sidebar;