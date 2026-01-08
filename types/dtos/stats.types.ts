/**
 * Statistics & Analytics DTOs
 * Mapped từ Backend: Admin Stats Endpoints
 */

// Dashboard Overview Stats (từ Backend API)
export interface AdminStatsResponse {
  totalRevenue: number;
  totalTicketsSold: number;
  totalEvents: number;
  totalUsers: number;
}

// Chart Data Point (cho Recharts)
export interface ChartDataPoint {
  date: string;      // Format: "DD/MM" hoặc "YYYY-MM-DD"
  value: number;     // Revenue value
  label?: string;    // Optional: "Hôm nay", "Hôm qua", etc.
}

// Dashboard Summary (processed data)
export interface DashboardSummary {
  revenue: number;
  tickets: number;
  events: number;
  users: number;
}

// Complete Dashboard Data (API + Mocked Chart)
export interface DashboardData {
  summary: DashboardSummary;
  chart: ChartDataPoint[];
}

// Revenue Trend (Future: Real API data)
export interface RevenueTrendResponse {
  date: string;
  revenue: number;
  orders: number;
}
