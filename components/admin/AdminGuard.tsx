'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useAuthStore } from '@/store';
import { UserRole } from '@/types';

/**
 * AdminGuard - Security Wrapper cho Admin Portal
 * 
 * Chức năng:
 * - Kiểm tra authentication: User phải đã đăng nhập
 * - Kiểm tra authorization: Role phải là Admin hoặc Organizer
 * - Redirect về /login nếu chưa đăng nhập
 * - Redirect về / (trang chủ) nếu không đủ quyền
 * 
 * Role Mapping (Backend Enum):
 * - Admin = 1 (Full access)
 * - Organizer = 2 (Manage own events)
 * - Customer = 0 (No admin access)
 * 
 * Usage:
 * Wrap toàn bộ Admin Layout để bảo vệ tất cả routes trong /admin/*
 */

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Chờ một chút để Zustand hydrate state từ localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isChecking) {
      // Case 1: Chưa đăng nhập → Redirect to login
      if (!isAuthenticated || !user) {
        console.warn('❌ AdminGuard: User not authenticated. Redirecting to /login');
        router.replace('/login?redirect=/admin/dashboard');
        return;
      }

      // Case 2: Đã đăng nhập nhưng không đủ quyền → Redirect to home
      const allowedRoles: UserRole[] = [UserRole.Admin, UserRole.Organizer];
      
      if (!allowedRoles.includes(user.role)) {
        console.warn('❌ AdminGuard: Insufficient permissions.', {
          userRole: user.role,
          allowedRoles,
        });
        router.replace('/?error=insufficient_permissions');
        return;
      }

      // Case 3: Valid - User có quyền truy cập
      console.log('✅ AdminGuard: Access granted', {
        userId: user.userId,
        role: user.role,
        fullName: user.fullName,
      });
    }
  }, [isChecking, isAuthenticated, user, router]);

  // Loading state: Show full-screen spinner
  if (isChecking || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Kiểm tra role một lần nữa trước khi render
  const allowedRoles: UserRole[] = [UserRole.Admin, UserRole.Organizer];
  if (!allowedRoles.includes(user.role)) {
    return null; // Redirect đang xảy ra trong useEffect
  }

  // Authorized: Render children
  return <>{children}</>;
}
