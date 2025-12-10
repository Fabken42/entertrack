'use client';

import { SessionProvider } from 'next-auth/react';
import ToastProvider from './toast-provider/ToastProvider';
import Layout from '@/components/layout';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <Layout>
          {children}
        </Layout>
      </ToastProvider>
    </SessionProvider>
  );
}