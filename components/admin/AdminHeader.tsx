'use client';

import { Layout, Button, Dropdown, Avatar, Space, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { UserRole } from '@/types';

/**
 * AdminHeader - Header bar cho Admin Portal
 * 
 * Features:
 * - Toggle button để collapse/expand sidebar
 * - User info dropdown với Full Name và Role
 * - Logout button với confirm
 * - Sticky position để luôn hiển thị khi scroll
 * 
 * Layout:
 * - Left: Toggle sidebar button
 * - Right: User greeting + Avatar + Dropdown menu
 */

const { Header } = Layout;
const { Text } = Typography;

interface AdminHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminHeader({ collapsed, onToggle }: AdminHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Handle logout với confirmation
  const handleLogout = () => {
    // Ant Design Modal confirm
    const confirmed = window.confirm('Bạn có chắc muốn đăng xuất?');
    
    if (confirmed) {
      logout();
      router.push('/login');
    }
  };

  // Map UserRole enum sang tên hiển thị tiếng Việt
  const getRoleName = (role: UserRole): string => {
    const roleMap: Record<UserRole, string> = {
      [UserRole.Admin]: 'Quản trị viên',
      [UserRole.Organizer]: 'Nhà tổ chức',
      [UserRole.Inspector]: 'Thanh tra',
      [UserRole.Customer]: 'Khách hàng',
    };
    return roleMap[role] || role;
  };

  // Dropdown menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => {
        // TODO: Navigate to profile page in future
        console.log('Navigate to profile');
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => {
        // TODO: Navigate to settings page in future
        console.log('Navigate to settings');
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Left: Toggle Sidebar Button */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{
          fontSize: '16px',
          width: 40,
          height: 40,
        }}
      />

      {/* Right: User Info & Dropdown */}
      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
        <Space style={{ cursor: 'pointer' }}>
          {/* User Greeting */}
          <div style={{ textAlign: 'right', marginRight: 8 }}>
            <Text strong style={{ display: 'block', fontSize: '14px' }}>
              {user?.fullName || 'Admin User'}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {user?.role ? getRoleName(user.role) : 'N/A'}
            </Text>
          </div>

          {/* Avatar */}
          <Avatar 
            icon={<UserOutlined />} 
            src={user?.avatarUrl}
            style={{ backgroundColor: '#1890ff' }}
          />
        </Space>
      </Dropdown>
    </Header>
  );
}
