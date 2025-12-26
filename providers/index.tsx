'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth-provider';
import { AntdProvider } from './antd-provider';
import { GoogleAuthProvider } from './google-auth-provider';

/**
 * Root Providers
 * 
 * Combine tất cả providers vào một component:
 * - AntdProvider: Ant Design theme configuration
 * - GoogleAuthProvider: Google OAuth setup
 * - AuthProvider: Authentication state management
 * - Toaster: React Hot Toast notifications
 * 
 * Sử dụng trong app/layout.tsx
 */

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AntdProvider>
      <GoogleAuthProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </GoogleAuthProvider>
      
      {/* Toast notifications - Global */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AntdProvider>
  );
}
