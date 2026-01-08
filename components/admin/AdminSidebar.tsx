'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  BarChartOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

/**
 * AdminSidebar - Navigation Sidebar cho Admin Portal
 * 
 * Features:
 * - Auto-collapse trên mobile (< 768px)
 * - Active state tự động highlight dựa trên pathname
 * - Menu items với icons rõ ràng
 * - Responsive với breakpoint detection
 * 
 * Menu Structure:
 * - Dashboard: Tổng quan thống kê
 * - My Events: Quản lý sự kiện
 * - Reports: Báo cáo doanh thu
 * - Back to Home: Quay về trang chủ
 */

const { Sider } = Layout;

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

type MenuItem = Required<MenuProps>['items'][number];

export default function AdminSidebar({ collapsed, onCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse trên mobile
      if (mobile && !collapsed) {
        onCollapse(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [collapsed, onCollapse]);

  // Menu items definition
  const menuItems: MenuItem[] = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/admin/dashboard'),
    },
    {
      key: '/admin/events',
      icon: <CalendarOutlined />,
      label: 'My Events',
      onClick: () => router.push('/admin/events'),
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
      onClick: () => router.push('/admin/reports'),
    },
    {
      type: 'divider',
    },
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Back to Home',
      onClick: () => router.push('/'),
    },
  ];

  // Xác định menu item nào đang active dựa vào pathname
  const getSelectedKey = (): string => {
    // Exact match
    if (pathname === '/admin/dashboard') return '/admin/dashboard';
    if (pathname === '/admin/events' || pathname.startsWith('/admin/events/')) {
      return '/admin/events';
    }
    if (pathname === '/admin/reports') return '/admin/reports';
    if (pathname === '/') return '/';

    // Default to dashboard
    return '/admin/dashboard';
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      collapsedWidth={isMobile ? 0 : 80}
      width={250}
      theme="dark"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center bg-blue-700">
        {collapsed ? (
          <span className="text-white text-xl font-bold">TF</span>
        ) : (
          <span className="text-white text-lg font-semibold">TicketFlow Admin</span>
        )}
      </div>

      {/* Navigation Menu */}
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
}
