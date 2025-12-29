/**
 * Utility Functions
 * Helper functions dùng chung trong app
 */

/**
 * Get Image URL - Xử lý image paths từ Backend
 * 
 * Backend có thể trả về 3 dạng:
 * 1. Full URL (http/https): Dùng trực tiếp
 * 2. Relative path (/uploads/...): Ghép với API base URL
 * 3. null/undefined: Trả về placeholder
 * 
 * ⚠️ Issue: API_URL có thể kết thúc bằng "/" hoặc không
 * → Cần xử lý để tránh double slash: /api//uploads/...
 * 
 * @param path - Image path từ Backend
 * @returns Full image URL hoặc placeholder
 * 
 * @example
 * getImageUrl('http://example.com/image.jpg') // → http://example.com/image.jpg
 * getImageUrl('/uploads/event.jpg') // → https://localhost:7207/uploads/event.jpg
 * getImageUrl(null) // → /assets/placeholder.jpg
 */
export function getImageUrl(path: string | null | undefined): string {
  // Case 1: Null/undefined → Return placeholder
  if (!path) {
    return '/assets/placeholder.jpg';
  }

  // Case 2: Đã là full URL (http/https) → Return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Case 3: Relative path → Ghép với Backend base URL (không có /api)
  // ⚠️ Dùng NEXT_PUBLIC_BACKEND_URL, KHÔNG dùng NEXT_PUBLIC_API_URL
  // Vì images ở /user-content/..., không phải /api/user-content/...
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:7207';
  
  // Xử lý double slash:
  // - Nếu backendUrl kết thúc bằng "/" và path bắt đầu bằng "/" → Remove 1 slash
  // - Nếu backendUrl không kết thúc bằng "/" và path không bắt đầu bằng "/" → Thêm slash
  const normalizedBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  const fullUrl = `${normalizedBackendUrl}${normalizedPath}`;
  console.log('🖼️ getImageUrl:', { input: path, output: fullUrl });
  return fullUrl;
}

/**
 * Format Currency - Format số tiền theo VND
 * 
 * @param amount - Số tiền (VND)
 * @returns Formatted string: "1.000.000 ₫"
 * 
 * @example
 * formatCurrency(100000) // → "100.000 ₫"
 * formatCurrency(1500000) // → "1.500.000 ₫"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format Date - Format ngày giờ
 * 
 * @param dateString - ISO date string
 * @param format - dayjs format string
 * @returns Formatted date string
 * 
 * @example
 * formatDate('2024-01-15T19:00:00Z', 'DD MMM YYYY, HH:mm')
 * // → "15 Jan 2024, 19:00"
 */
export function formatDate(dateString: string, format: string = 'DD/MM/YYYY HH:mm'): string {
  // Dynamic import dayjs để tránh import nặng
  // Trong component có thể import dayjs trực tiếp
  const dayjs = require('dayjs');
  return dayjs(dateString).format(format);
}

/**
 * Truncate Text - Cắt text dài thành preview
 * 
 * @param text - Text gốc
 * @param maxLength - Độ dài tối đa
 * @returns Truncated text với "..."
 * 
 * @example
 * truncateText('Long description text...', 100)
 * // → "Long description text... (truncated)"
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Get Event Status Badge Color
 * 
 * @param status - Event status enum
 * @returns Tailwind color class
 */
export function getEventStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    Draft: 'gray',
    Published: 'blue',
    OnSale: 'green',
    SoldOut: 'red',
    Ended: 'gray',
    Cancelled: 'red',
  };
  
  return colorMap[status] || 'gray';
}
