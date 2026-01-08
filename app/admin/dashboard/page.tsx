'use client';

import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import {
  DollarOutlined,
  TagsOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getAdminStats, formatCurrency } from '@/services/api/stats.service';
import type { DashboardData } from '@/types/dtos/stats.types';

/**
 * Admin Dashboard - F8.2: Analytics & Statistics UI
 * 
 * Features:
 * - Real-time stats từ Backend API
 * - 4 Statistic cards: Revenue, Tickets, Events, Users
 * - Revenue trend chart (7 ngày gần nhất)
 * - Loading states với skeleton
 * - Error handling với fallback data
 * 
 * Data Source:
 * - API: /admin/stats/overview (Real stats)
 * - Mock: Revenue chart data (Last 7 days)
 * 
 * Design:
 * - Total Revenue card nổi bật (larger font, green color)
 * - Chart với gradient fill (blue theme)
 * - Responsive grid layout
 */

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const dashboardData = await getAdminStats();
        setData(dashboardData);
        
        console.log('✅ Dashboard data loaded:', dashboardData);
      } catch (err) {
        console.error('❌ Error loading dashboard:', err);
        setError('Không thể tải dữ liệu dashboard. Đang hiển thị dữ liệu mẫu.');
        
        // Fallback data đã được handle trong service
        const fallbackData = await getAdminStats();
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="Đang tải dữ liệu dashboard..." />
      </div>
    );
  }

  // No data (shouldn't happen due to fallback)
  if (!data) {
    return (
      <Alert
        message="Lỗi"
        description="Không thể tải dữ liệu dashboard."
        type="error"
        showIcon
      />
    );
  }

  const { summary, chart } = data;

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">Dashboard Analytics</h1>

      {/* Error Alert (nếu có) */}
      {error && (
        <Alert
          message="Thông báo"
          description={error}
          type="warning"
          showIcon
          closable
          className="mb-6"
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Card 1: Total Revenue (Nổi bật) */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderColor: '#52c41a',
              borderWidth: 2,
            }}
          >
            <Statistic
              title="Tổng Doanh Thu"
              value={summary.revenue}
              prefix={<DollarOutlined />}
              styles={{
                value: {
                  color: '#3f8600',
                  fontSize: '28px',
                  fontWeight: 'bold',
                },
              }}
              formatter={(value) => formatCurrency(value as number)}
            />
          </Card>
        </Col>

        {/* Card 2: Tickets Sold */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Vé Đã Bán"
              value={summary.tickets}
              prefix={<TagsOutlined />}
              styles={{ value: { color: '#1890ff' } }}
            />
          </Card>
        </Col>

        {/* Card 3: Active Events */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sự Kiện Hoạt Động"
              value={summary.events}
              prefix={<CalendarOutlined />}
              styles={{ value: { color: '#722ed1' } }}
            />
          </Card>
        </Col>

        {/* Card 4: Total Users */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Người Dùng"
              value={summary.users}
              prefix={<UserOutlined />}
              styles={{ value: { color: '#fa8c16' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Trend Chart */}
      <Card title="Xu Hướng Doanh Thu (7 Ngày Gần Nhất)" className="mb-6">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={chart}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

            {/* Axes */}
            <XAxis
              dataKey="date"
              stroke="#8c8c8c"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#8c8c8c"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => {
                // Format Y-axis: 1M, 2M, etc.
                if (value >= 1_000_000) {
                  return `${(value / 1_000_000).toFixed(1)}M`;
                }
                if (value >= 1_000) {
                  return `${(value / 1_000).toFixed(0)}K`;
                }
                return value.toString();
              }}
            />

            {/* Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div
                      style={{
                        backgroundColor: '#fff',
                        padding: '12px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '4px' }}>
                        {data.label || data.date}
                      </p>
                      <p style={{ margin: 0, color: '#1890ff' }}>
                        Doanh thu: {formatCurrency(data.value)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Area */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1890ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Chart Footer Note */}
        <div className="mt-4 text-center text-gray-500 text-sm">
          <p>
            💡 Dữ liệu biểu đồ được tạo tự động dựa trên tổng doanh thu.
            Tính năng revenue tracking theo ngày sẽ có trong phiên bản tiếp theo.
          </p>
        </div>
      </Card>

      {/* Quick Insights */}
      <Card title="📊 Thống Kê Nhanh">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-600 mb-2">Doanh thu trung bình / ngày</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(Math.round(summary.revenue / 30))}
              </p>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 mb-2">Trung bình vé / sự kiện</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.events > 0
                  ? Math.round(summary.tickets / summary.events)
                  : 0}
              </p>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-gray-600 mb-2">Giá vé trung bình</p>
              <p className="text-2xl font-bold text-purple-600">
                {summary.tickets > 0
                  ? formatCurrency(Math.round(summary.revenue / summary.tickets))
                  : '0 VNĐ'}
              </p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
