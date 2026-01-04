/**
 * ============================================
 * TICKET DATA TYPES (F7.1)
 * ============================================
 * 
 * Định nghĩa cấu trúc dữ liệu cho "My Tickets" page
 * 
 * ARCHITECTURE NOTE:
 * - Backend trả về Orders (mỗi Order có nhiều Tickets)
 * - Frontend cần Flat List để render dễ dàng
 * - Service layer sẽ dùng flatMap để "flatten" structure
 * 
 * Flow:
 * Backend: Order[] (nested tickets)
 *   ↓ flatMap in Service Layer
 * Frontend: Ticket[] (flat array)
 */

// Import TicketStatus from order.types (already defined there)
import { TicketStatus } from './order.types';

// Re-export for convenience
export { TicketStatus };

/**
 * Ticket DTO (Matches Backend MyTicketDto exactly)
 * 
 * Chứa tất cả thông tin cần thiết để:
 * - Render ticket card trong UI
 * - Generate QR code cho check-in (ticketCode)
 * - Link back to order details
 * - Display event info
 */
export interface TicketDto {
  /**
   * Ticket ID (unique identifier)
   */
  id: string;

  /**
   * Ticket Code - Secret string for QR generation
   * Format: "TKT-ABC123XYZ"
   * Dùng để generate QR code cho check-in
   */
  ticketCode: string;

  /**
   * Event Information
   */
  eventName: string;
  venueName: string;
  venueAddress: string;
  startDateTime: string; // ISO format: "2024-12-25T19:00:00Z"

  /**
   * Ticket Type (VIP, GA, Premium, etc.)
   */
  ticketTypeName: string;

  /**
   * Pricing
   */
  price: number;

  /**
   * Status
   * - Active: Vé còn hiệu lực, chưa check-in
   * - Used: Đã check-in vào sự kiện
   * - Cancelled: Đã hủy
   */
  status: TicketStatus;

  /**
   * Order Reference (to link back to order details)
   */
  orderId: string;

  /**
   * Media (optional)
   */
  coverImageUrl?: string; // Event thumbnail for ticket card
}

/**
 * Ticket List Response (if backend returns paginated)
 */
export interface TicketListResponse {
  tickets: TicketDto[];
  totalCount: number;
  page?: number;
  pageSize?: number;
}
