'use client';

import React from 'react';
import { ConfigProvider, theme as antdTheme, App } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

/**
 * Ant Design Theme Provider
 * 
 * Cấu hình:
 * - Theme colors map với Tailwind CSS
 * - Locale: Tiếng Việt
 * - DayJS locale: Tiếng Việt
 * - App component: Để sử dụng static methods (message, notification, modal)
 *   mà không bị warning về context
 */

// Set dayjs locale globally
dayjs.locale('vi');

interface AntdProviderProps {
  children: React.ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          // Primary Color (Map với Tailwind primary-600)
          colorPrimary: '#2563eb', // blue-600
          
          // Border Radius
          borderRadius: 8,
          
          // Font
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          
          // Success/Error/Warning colors
          colorSuccess: '#16a34a', // green-600
          colorError: '#dc2626', // red-600
          colorWarning: '#ea580c', // orange-600
          colorInfo: '#0284c7', // sky-600
          
          // Layout colors
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f9fafb', // gray-50
          
          // Text colors
          colorText: '#111827', // gray-900
          colorTextSecondary: '#6b7280', // gray-500
        },
        algorithm: antdTheme.defaultAlgorithm,
        components: {
          Button: {
            controlHeight: 40,
            fontWeight: 500,
          },
          Input: {
            controlHeight: 40,
          },
          Select: {
            controlHeight: 40,
          },
          Card: {
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          },
          Modal: {
            borderRadiusLG: 12,
          },
        },
      }}
    >
      {/* App component để support static methods (message, notification, modal) */}
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}
