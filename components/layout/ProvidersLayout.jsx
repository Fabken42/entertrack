'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import Header from './header/Header';
import Footer from './footer/Footer';
import Sidebar from './sidebar/Sidebar';
import { cn } from '@/lib/utils/general-utils';

const ProvidersLayout = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black bg-fixed flex flex-col">
      <Header showFullHeader={!isAuthenticated} />
      <div className="flex flex-1">
        <Sidebar />
        <main className={cn(
          "flex-1 transition-all duration-300",
          "xl:ml-16",
        )}>
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default ProvidersLayout;