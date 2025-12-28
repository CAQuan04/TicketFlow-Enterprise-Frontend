'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { 
  Ticket, 
  LogOut, 
  LayoutDashboard,
  UserCircle,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

/**
 * NAVBAR COMPONENT - HOÀN CHỈNH
 * 
 * ====================================
 * HYDRATION MISMATCH - GIẢI THÍCH CHI TIẾT
 * ====================================
 * 
 * ⚠️ VẤN ĐỀ:
 * 
 * Next.js render component 2 lần:
 * 1. **Server-Side Render (SSR)**: 
 *    - Chạy trên server Node.js
 *    - KHÔNG có access to browser APIs (window, localStorage, document)
 *    - KHÔNG có user state từ localStorage
 *    - Render: Guest state (Login/Register buttons)
 * 
 * 2. **Client-Side Hydration**:
 *    - Chạy trên browser
 *    - CÓ access to localStorage
 *    - Zustand load state từ localStorage
 *    - Render: Logged-in state (User menu)
 * 
 * ❌ KẾT QUẢ:
 * Server HTML ≠ Client HTML → React throw error:
 * "Warning: Text content did not match. Server: "Login" Client: "John Doe""
 * 
 * 
 * ====================================
 * GIẢI PHÁP: useMounted Hook
 * ====================================
 * 
 * Pattern:
 * ```tsx
 * const [mounted, setMounted] = useState(false);
 * 
 * useEffect(() => {
 *   setMounted(true); // ← Chỉ chạy ở client
 * }, []);
 * 
 * if (!mounted) {
 *   return <Skeleton />; // ← Server render skeleton
 * }
 * 
 * return <RealContent />; // ← Client render real content
 * ```
 * 
 * Cách hoạt động:
 * 1. **SSR**: mounted = false → Render skeleton (simple, consistent)
 * 2. **Hydration**: React match skeleton (server) vs skeleton (client) → ✅ OK
 * 3. **useEffect runs**: setMounted(true) → Re-render với real content
 * 4. **Client**: Render user menu với data từ localStorage → ✅ OK
 * 
 * Trade-off:
 * - Pros: No hydration mismatch, always works
 * - Cons: Flash of skeleton (nhưng chỉ ~50ms, acceptable)
 * 
 * 
 * ====================================
 * NAVIGATION STRUCTURE
 * ====================================
 * 
 * Layout:
 * ┌─────────────────────────────────────────────┐
 * │ [Logo] Events About Contact   [Login] [Reg] │ ← Guest
 * │ [Logo] Events About Contact   [Avatar ▼]    │ ← Logged In
 * └─────────────────────────────────────────────┘
 * 
 * Dropdown Menu:
 * - My Tickets (Customer)
 * - Profile
 * - Dashboard (Admin/Organizer only)
 * - Logout
 * 
 * 
 * ====================================
 * STYLING NOTES
 * ====================================
 * 
 * Glassmorphism Effect:
 * - backdrop-blur-md: Blur background
 * - bg-white/80: 80% opacity white
 * - border-b: Subtle border
 * 
 * Active Link:
 * - Check usePathname()
 * - Apply gradient text + border-b-2
 * 
 * 
 * ====================================
 * TESTING SCENARIOS
 * ====================================
 * 
 * Test 1: Guest State
 * 1. Clear localStorage
 * 2. Refresh page
 * 3. Should show: Logo, Nav links, Login, Register
 * 4. No hydration warnings in console
 * 
 * Test 2: Logged-in State
 * 1. Login with account
 * 2. Refresh page
 * 3. Should show: Logo, Nav links, Avatar with name
 * 4. Click avatar → Dropdown opens
 * 5. Check menu items based on role
 * 
 * Test 3: Navigation
 * 1. Click "Events" → Should highlight with blue gradient
 * 2. Navigate to /about → "About" highlighted
 * 3. Active indicator should move smoothly
 * 
 * Test 4: Logout
 * 1. Click Avatar → Logout
 * 2. Should clear tokens
 * 3. Redirect to /login
 * 4. Navbar switches to guest state
 * 
 * Test 5: Role-based Menu
 * 1. Login as Customer → No "Dashboard" in menu
 * 2. Login as Admin → "Dashboard" visible
 * 3. Login as Organizer → "Dashboard" visible
 */

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  
  /**
   * Hydration Fix: useMounted Pattern
   * 
   * Chỉ render auth-dependent UI sau khi component mount ở client.
   * Server render skeleton → Client hydrate → Then show real content.
   */
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // This is intentional for hydration fix - not a side effect
    // Server renders skeleton, client mounts and updates to real content
    setMounted(true);
  }, []);

  /**
   * Handle Logout
   * 
   * Steps:
   * 1. Call logout API và clear tokens from store
   * 2. Show toast notification
   * 3. Redirect to login page
   */
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đã đăng xuất thành công');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Có lỗi khi đăng xuất');
    }
  };

  /**
   * Dropdown Menu Items
   * 
   * Dynamic based on user role
   */
  const menuItems: MenuProps['items'] = [
    {
      key: 'tickets',
      label: (
        <Link href="/booking/my-tickets" className="flex items-center gap-2">
          <Ticket className="h-4 w-4" />
          Vé của tôi
        </Link>
      ),
    },
    {
      key: 'profile',
      label: (
        <Link href="/profile" className="flex items-center gap-2">
          <UserCircle className="h-4 w-4" />
          Thông tin cá nhân
        </Link>
      ),
    },
    // Show Dashboard only for Admin/Organizer
    ...(user?.role === 'Admin' || user?.role === 'Organizer'
      ? [
          {
            type: 'divider' as const,
          },
          {
            key: 'dashboard',
            label: (
              <Link href="/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            ),
          },
        ]
      : []),
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      danger: true,
      label: (
        <button onClick={handleLogout} className="flex w-full items-center gap-2">
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      ),
    },
  ];

  /**
   * Check if link is active
   */
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  /**
   * Navigation Links
   */
  const navLinks = [
    { href: '/events', label: 'Sự kiện' },
    { href: '/about', label: 'Giới thiệu' },
    { href: '/contact', label: 'Liên hệ' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold transition-transform hover:scale-105"
          >
            <Ticket className="h-6 w-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TicketFlow
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-[21px] left-0 h-0.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
                )}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {/* 
              Hydration Fix: Show skeleton until mounted 
              Prevents mismatch between server (guest) and client (logged-in)
            */}
            {!mounted ? (
              // Skeleton loader (same on server & client)
              <div className="flex items-center gap-3">
                <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-200" />
                <div className="hidden h-9 w-24 animate-pulse rounded-lg bg-gray-200 md:block" />
              </div>
            ) : isAuthenticated && user ? (
              // Logged-in state (only rendered on client)
              <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
                <button className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100">
                  {/* Avatar */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  
                  {/* Name (hidden on mobile) */}
                  <span className="hidden font-medium text-gray-900 md:block">
                    {user.fullName || 'User'}
                  </span>
                </button>
              </Dropdown>
            ) : (
              // Guest state (only rendered on client)
              <>
                <Link href="/login">
                  <Button type="text" size="large" className="hidden md:inline-flex">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    type="primary" 
                    size="large"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && mounted && (
          <div className="border-t border-gray-200 py-4 md:hidden">
            {/* Navigation Links */}
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-lg px-4 py-2 font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Section */}
            {isAuthenticated && user ? (
              <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
                <Link
                  href="/booking/my-tickets"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  <Ticket className="h-4 w-4" />
                  Vé của tôi
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  <UserCircle className="h-4 w-4" />
                  Thông tin cá nhân
                </Link>
                {(user.role === 'Admin' || user.role === 'Organizer') && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-center font-medium text-gray-700 hover:bg-gray-50"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-center font-medium text-white hover:from-blue-700 hover:to-indigo-700"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}