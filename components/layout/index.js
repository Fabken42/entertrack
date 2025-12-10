'use client';

import ProvidersLayout from './ProvidersLayout';
import ProtectedRoute from './protected-route/ProtectedRoute';

// Este é o componente principal de layout
export default function Layout({ children }) {
  return (
    <ProvidersLayout> 
      {children}
    </ProvidersLayout>
  );
}

// Re-exportar componentes
export { default as Header } from './header/Header';
export { default as Sidebar } from './sidebar/Sidebar';
export { default as Footer } from './footer/Footer';
export { default as ProtectedRoute } from './protected-route/ProtectedRoute';