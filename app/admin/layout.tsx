'use client';

import { useState } from 'react';
import { Layout } from 'antd';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

/**
 * Admin Portal Layout - F8.1: Admin Dashboard Layout & RBAC
 * 
 * Architecture:
 * - AdminGuard: Security wrapper kiểm tra authentication & authorization
 * - AdminSidebar: Navigation menu với collapsed state
 * - AdminHeader: Toggle button & user info
 * - Content: Main content area với background light gray
 * 
 * Route Group: (admin)
 * Protected Routes:
 * - /admin/dashboard: Tổng quan thống kê
 * - /admin/events: Quản lý sự kiện của Organizer
 * - /admin/reports: Báo cáo doanh thu
 * 
 * Role-Based Access Control (RBAC):
 * - Admin (Role = 1): Full access to all features
 * - Organizer (Role = 2): Manage own events only
 * - Customer (Role = 0): No access - redirect to home
 * 
 * Design Principles:
 * - Data Density: Tối ưu hiển thị thông tin cho môi trường quản trị
 * - Light gray background (#f5f5f5) để content trắng nổi bật
 * - Responsive: Auto-collapse sidebar trên mobile
 * - Sticky Header: Luôn hiển thị khi scroll
 */

const { Content } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <AdminGuard>
      <Layout className="min-h-screen">
        {/* Sidebar Navigation */}
        <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />

        {/* Main Layout Area */}
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 250,
            transition: 'margin-left 0.2s',
            background: '#f5f5f5',
          }}
        >
          {/* Header Bar */}
          <AdminHeader collapsed={collapsed} onToggle={handleToggle} />

          {/* Content Area */}
          <Content
            style={{
              margin: '16px',
              padding: '24px',
              minHeight: 'calc(100vh - 64px - 32px)',
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
              overflow: 'auto',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </AdminGuard>
  );
}
