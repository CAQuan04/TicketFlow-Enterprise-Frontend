'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store';

/**
 * Layout cho Admin/Organizer/Inspector Routes
 * 
 * Route Group: (admin)
 * - /dashboard
 * - /dashboard/events
 * - /dashboard/orders
 * - /dashboard/users
 * - /dashboard/settings
 * 
 * Includes: Sidebar + Header + Content
 * 
 * NOTE: Đây là Client Component vì sử dụng Ant Design Layout & Zustand
 */

const { Header, Sider, Content } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Tổng quan',
      onClick: () => router.push('/dashboard'),
    },
    {
      key: '/dashboard/events',
      icon: <CalendarOutlined />,
      label: 'Sự kiện',
      onClick: () => router.push('/dashboard/events'),
    },
    {
      key: '/dashboard/orders',
      icon: <ShoppingOutlined />,
      label: 'Đơn hàng',
      onClick: () => router.push('/dashboard/orders'),
    },
    {
      key: '/dashboard/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => router.push('/dashboard/settings'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: '#fff',
          borderRight: '1px solid #e5e7eb',
        }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary">TicketFlow</h1>
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />

        {/* Logout Button */}
        <div className="absolute bottom-4 w-full px-4">
          <Menu
            mode="inline"
            items={[
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Đăng xuất',
                onClick: handleLogout,
                danger: true,
              },
            ]}
          />
        </div>
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 className="text-xl font-semibold">Dashboard</h2>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <UserOutlined className="text-xl" />
            <div>
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
