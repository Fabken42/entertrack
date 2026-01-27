'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/general-utils';
import { Button } from '@/components/ui';
import { User, LogOut, Menu, X, LogIn, UserPlus, Home, BarChart3, Settings, Film, Tv, BookOpen, GamepadIcon, ChevronDown, LayoutDashboard, Tv2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

const Header = ({ showFullHeader = true }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const libraryNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Filmes', href: '/movie', icon: Film },
    { name: 'Séries', href: '/series', icon: Tv },
    { name: 'Animes', href: '/anime', icon: Tv2 },
    { name: 'Jogos', href: '/game', icon: GamepadIcon },
    { name: 'Mangás', href: '/manga', icon: BookOpen },
  ];

  const discoverNavigation = [
    { name: 'Filmes', href: '/discover/movie', icon: Film },
    { name: 'Séries', href: '/discover/series', icon: Tv },
    { name: 'Animes', href: '/discover/anime', icon: Tv2 },
    { name: 'Jogos', href: '/discover/game', icon: GamepadIcon },
    { name: 'Mangás', href: '/discover/manga', icon: BookOpen },
  ];

  const secondaryNavigation = [
    { name: 'Estatísticas', href: '/statistics', icon: BarChart3 },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      toast.success('Logout realizado com sucesso!');
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao fazer logout');
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      closeMobileMenu();
    }
  };

  const handleLogin = () => {
    router.push('/login');
    closeMobileMenu();
  };

  const handleRegister = () => {
    router.push('/register');
    closeMobileMenu();
  };

  // Fechar menu mobile ao mudar de rota
  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  // Renderizar esqueleto durante loading
  if (isLoading) {
    return (
      <>
        <header className="glass sticky top-0 z-50 w-full border-b border-white/5">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg animate-pulse"></div>
                <div className="w-32 h-6 bg-gray-700/30 rounded animate-pulse hidden sm:block backdrop-blur-sm"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-8 bg-gray-700/30 rounded animate-pulse backdrop-blur-sm"></div>
                <div className="w-8 h-8 bg-gray-700/30 rounded-full animate-pulse backdrop-blur-sm"></div>
              </div>
            </div>
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      <header className="glass sticky top-0 z-50 w-full border-b border-white/5 backdrop-blur-xl">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="lg:hidden text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg"
                icon={isMobileMenuOpen ? X : Menu}
              />

              {/* Logo com gradiente animado */}
              <Link
                href={isAuthenticated ? "/dashboard" : "/"}
                className="flex items-center gap-2 hover-lift"
              >
                <div className="w-8 h-8 gradient-animate rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-white font-bold text-sm">ET</span>
                </div>
                <span className="font-bold text-xl text-gradient-primary hidden sm:block">
                  EnterTrack
                </span>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                // Usuário AUTENTICADO
                <div className="flex items-center gap-3">
                  {/* User Menu */}
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 px-3 py-2 rounded-lg"
                      icon={User}
                    >
                      <span className="hidden sm:block text-sm">Perfil</span>
                      <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>

                    {/* Dropdown Menu - Estilo Glass */}
                    <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden fade-in">
                      {/* Header do dropdown */}
                      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-900/30">
                        <p className="text-sm font-medium text-white truncate">
                          {user?.name || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {user?.email || ''}
                        </p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200 group"
                        >
                          <LayoutDashboard className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                          Dashboard
                        </Link>

                        <Link
                          href="/dashboard/profile"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200 group"
                        >
                          <User className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
                          Meu Perfil
                        </Link>

                        <div className="h-px bg-white/10 my-2"></div>

                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:text-white rounded-lg hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          <LogOut className="w-4 h-4 group-hover:animate-pulse" />
                          {isLoggingOut ? 'Saindo...' : 'Sair da conta'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Usuário NÃO AUTENTICADO
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogin}
                    className="text-white/90 hover:text-white border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-200 rounded-lg px-4"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline text-sm">Entrar</span>
                  </Button>
                  <Button
                    variant="solid"
                    size="sm"
                    onClick={handleRegister}
                    className="bg-gradient-primary hover:bg-gradient-secondary text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 rounded-lg px-4"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline text-sm">Cadastrar</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu - Estilo Glass Moderno */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl absolute left-0 right-0 z-40 slide-up">
              <div className="px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {/* Seção Minha Biblioteca (apenas para usuários logados) - AGORA VEM PRIMEIRO */}
                {isAuthenticated && libraryNavigation.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gradient-secondary uppercase tracking-wider">
                      Minha Biblioteca
                    </div>
                    {libraryNavigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
                      return (
                        <Link
                          key={`library-${item.name}`}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 group',
                            isActive
                              ? 'bg-gradient-to-r from-blue-600/20 to-blue-600/10 text-white border-l-4 border-blue-500'
                              : 'text-gray-300 hover:text-white hover:bg-white/10'
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform",
                            isActive ? "bg-blue-500/20" : "bg-white/5"
                          )}>
                            {typeof Icon === 'string' ? (
                              <span className="text-base">{Icon}</span>
                            ) : (
                              <Icon className={cn(
                                "w-4 h-4",
                                isActive ? "text-blue-400" : "text-gray-400 group-hover:text-white"
                              )} />
                            )}
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Seção Descobrir - AGORA VEM DEPOIS */}
                <div className="space-y-1 pt-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gradient-primary uppercase tracking-wider">
                    Descobrir
                  </div>
                  {discoverNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={`discover-${item.name}`}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 group',
                          isActive
                            ? 'bg-gradient-to-r from-purple-600/20 to-purple-600/10 text-white border-l-4 border-purple-500'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform",
                          isActive ? "bg-purple-500/20" : "bg-white/5"
                        )}>
                          {typeof Icon === 'string' ? (
                            <span className="text-base">{Icon}</span>
                          ) : (
                            <Icon className={cn(
                              "w-4 h-4",
                              isActive ? "text-purple-400" : "text-gray-400 group-hover:text-white"
                            )} />
                          )}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Seção Geral (apenas para usuários logados) */}
                {isAuthenticated && secondaryNavigation.length > 0 && (
                  <div className="space-y-1 pt-4">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Geral
                    </div>
                    {secondaryNavigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 group',
                            isActive
                              ? 'bg-gradient-to-r from-gray-700/20 to-gray-700/10 text-white border-l-4 border-gray-500'
                              : 'text-gray-300 hover:text-white hover:bg-white/10'
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform",
                            isActive ? "bg-gray-500/20" : "bg-white/5"
                          )}>
                            <Icon className={cn(
                              "w-4 h-4",
                              isActive ? "text-gray-300" : "text-gray-400 group-hover:text-white"
                            )} />
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Auth Section (apenas para usuários não logados) */}
                {!isAuthenticated && (
                  <>
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-3"></div>

                    <button
                      onClick={handleLogin}
                      className="flex items-center gap-3 w-full px-3 py-3 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10">
                        <LogIn className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Entrar na conta</span>
                    </button>

                    <button
                      onClick={handleRegister}
                      className="flex items-center gap-3 w-full px-3 py-3 bg-gradient-primary text-white rounded-xl hover:bg-gradient-secondary transition-all duration-200 shadow-lg group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Criar conta gratuita</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;