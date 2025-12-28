'use client';

import Link from 'next/link';
import { Ticket } from 'lucide-react';
import { useAuthStore } from '@/store';
import { useState, useEffect } from 'react';

export function NavbarSimple() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    console.log('🔴 NavbarSimple MOUNTED');
    setMounted(true);
  }, []);
  
  const { isAuthenticated, user } = useAuthStore();
  
  console.log('🔴 NavbarSimple RENDER:', { mounted, isAuthenticated, user: user?.fullName });

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="h-6 w-32 animate-pulse bg-gray-200 rounded"></div>
          <div className="h-8 w-24 animate-pulse bg-gray-200 rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Ticket className="h-6 w-6 text-blue-600" />
          <span className="text-blue-600">TicketFlow</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link href="/events" className="text-gray-700 hover:text-blue-600">
            Sự kiện
          </Link>
          
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Xin chào, {user.fullName}
              </span>
              <Link
                href="/login"
                onClick={() => useAuthStore.getState().logout()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Đăng xuất
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg border border-blue-600 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
