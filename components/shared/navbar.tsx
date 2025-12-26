'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore, useCartStore } from '@/store';

/**
 * Navbar Component (cho customer pages)
 * 
 * Features:
 * - Logo + Navigation links
 * - Shopping cart badge
 * - User menu / Login button
 * 
 * NOTE: Client Component vì sử dụng Zustand stores
 */

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { getTotalQuantity } = useCartStore();

  const cartItemsCount = getTotalQuantity();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            TicketFlow
          </Link>

          {/* Navigation Links */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-primary"
            >
              Trang chủ
            </Link>
            <Link
              href="/events"
              className="text-sm font-medium text-gray-700 hover:text-primary"
            >
              Sự kiện
            </Link>
            {isAuthenticated && (
              <Link
                href="/my-tickets"
                className="text-sm font-medium text-gray-700 hover:text-primary"
              >
                Vé của tôi
              </Link>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Shopping Cart */}
            <button
              onClick={() => router.push('/cart')}
              className="relative rounded-lg p-2 hover:bg-gray-100"
            >
              <ShoppingCartOutlined className="text-xl" />
              {cartItemsCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
              >
                <UserOutlined />
                <span className="hidden text-sm font-medium md:block">
                  {user?.fullName}
                </span>
              </button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => router.push('/login')}>
                  Đăng nhập
                </Button>
                <Button
                  type="primary"
                  onClick={() => router.push('/register')}
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
