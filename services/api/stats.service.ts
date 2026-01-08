import { axiosClient } from '@/lib/axios-client';
import type { 
  AdminStatsResponse, 
  DashboardData, 
  ChartDataPoint 
} from '@/types/dtos/stats.types';

/**
 * Stats Service - Admin Analytics & Dashboard
 * 
 * Features:
 * - Fetch real stats từ Backend API
 * - Generate mock chart data (7 ngày gần nhất)
 * - Format data cho Recharts
 * 
 * API Endpoints:
 * - GET /admin/stats/overview → AdminStatsResponse
 */

/**
 * Generate mock revenue trend data cho 7 ngày gần nhất
 * 
 * Logic:
 * - Tính từ hôm nay lùi về 6 ngày trước
 * - Generate random revenue dựa trên total revenue
 * - Format date theo "DD/MM" cho chart axis
 * 
 * @param totalRevenue - Total revenue từ API để tính trung bình
 * @returns Array of ChartDataPoint
 */
function generateRevenueChart(totalRevenue: number): ChartDataPoint[] {
  const chartData: ChartDataPoint[] = [];
  const today = new Date(2026, 0, 6); // January 6, 2026
  
  // Daily average (chia đều + thêm random để realistic)
  const baseDaily = totalRevenue / 30; // Giả sử revenue trong 30 ngày
  
  // Generate 7 data points (6 ngày trước + hôm nay)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random variance: ±30% của base
    const variance = (Math.random() - 0.5) * 0.6;
    const dailyRevenue = Math.max(0, baseDaily * (1 + variance));
    
    // Format date
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Label cho tooltip
    let label = `${day}/${month}`;
    if (i === 0) label = `Hôm nay (${day}/${month})`;
    else if (i === 1) label = `Hôm qua (${day}/${month})`;
    
    chartData.push({
      date: `${day}/${month}`,
      value: Math.round(dailyRevenue),
      label,
    });
  }
  
  return chartData;
}

/**
 * Fetch Admin Dashboard Stats
 * 
 * Flow:
 * 1. Call API để lấy tổng quan (revenue, tickets, events, users)
 * 2. Generate mock chart data dựa trên total revenue
 * 3. Return combined data
 * 
 * @returns Promise<DashboardData>
 */
export async function getAdminStats(): Promise<DashboardData> {
  try {
    // Call Backend API
    const response = await axiosClient.get<AdminStatsResponse>('/admin/stats/overview');
    
    const { totalRevenue, totalTicketsSold, totalEvents, totalUsers } = response.data;
    
    console.log('📊 Admin Stats fetched:', {
      revenue: totalRevenue,
      tickets: totalTicketsSold,
      events: totalEvents,
      users: totalUsers,
    });
    
    // Generate mock chart data
    const chartData = generateRevenueChart(totalRevenue);
    
    console.log('📈 Chart data generated:', chartData);
    
    // Return combined data
    return {
      summary: {
        revenue: totalRevenue,
        tickets: totalTicketsSold,
        events: totalEvents,
        users: totalUsers,
      },
      chart: chartData,
    };
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    
    // Fallback: Return mock data nếu API fail
    const fallbackRevenue = 125000000; // 125 triệu VNĐ
    
    return {
      summary: {
        revenue: fallbackRevenue,
        tickets: 1234,
        events: 56,
        users: 789,
      },
      chart: generateRevenueChart(fallbackRevenue),
    };
  }
}

/**
 * Format currency cho display
 * 
 * @param value - Số tiền
 * @returns Formatted string: "125,000,000 VNĐ"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(value) + ' VNĐ';
}

/**
 * Format large numbers với suffixes (K, M, B)
 * 
 * @param value - Số cần format
 * @returns Formatted string: "1.2M", "125K"
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + 'B';
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K';
  }
  return value.toString();
}
