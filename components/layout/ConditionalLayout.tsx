'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from '../shared/footer';

/**
 * ConditionalLayout - Wrapper để conditional render Navbar/Footer
 * 
 * Logic:
 * - Admin routes (/admin/*): Không render customer navbar/footer
 * - Auth routes (/login, /register): Không render navbar/footer
 * - Customer routes: Render đầy đủ navbar + footer
 * 
 * Tại sao cần:
 * Admin portal có layout riêng với AdminHeader & AdminSidebar
 * Nếu render customer Navbar sẽ bị duplicate và confusing
 */

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if current route is admin or auth
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname?.startsWith('/verify-email');

  // Admin routes: No navbar/footer (use AdminHeader & AdminSidebar instead)
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Auth routes: No navbar/footer (minimal layout)
  if (isAuthRoute) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Customer routes: Full layout with navbar + footer
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
