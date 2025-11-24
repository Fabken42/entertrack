'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import ProtectedRoute from './protected-route/ProtectedRoute';
import Header from './header/Header';
import Sidebar from './sidebar/Sidebar';
import Footer from './footer/Footer';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();

  // Se não estiver autenticado, mostrar apenas o conteúdo sem layout
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:pl-64">
          {/* Header */}
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          {/* Page Content */}
          <main className="flex-1 bg-gray-900">
            {children}
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Layout;