'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store';

/**
 * Auth Provider
 * 
 * Chức năng:
 * - Initialize auth state khi app load
 * - Kiểm tra token validity
 * - Auto-connect SignalR nếu đã login
 * 
 * NOTE: Đây là Client Component vì sử dụng Zustand store
 */

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    // Initialize auth khi component mount
    initialize();
  }, [initialize]);

  // Optional: Hiển thị loading screen khi đang initialize
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
