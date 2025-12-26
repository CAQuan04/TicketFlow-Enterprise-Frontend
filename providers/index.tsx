'use client';

import React from 'react';
import { AuthProvider } from './auth-provider';
import { AntdProvider } from './antd-provider';

/**
 * Root Providers
 * 
 * Combine tất cả providers vào một component
 * Sử dụng trong app/layout.tsx
 */

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AntdProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AntdProvider>
  );
}
