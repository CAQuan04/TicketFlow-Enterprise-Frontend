/**
 * Event DTOs
 * ✅ Mapped chính xác từ Backend: TicketBooking.Application.Features.Events
 * 
 * Backend DTOs:
 * - EventListDto: Dùng cho danh sách sự kiện (Home, Browse, Search)
 * - EventDetailDto: Dùng cho chi tiết sự kiện (F4 - FULL INFO)
 * - TicketTypeDto: Chi tiết loại vé trong event detail
 * - PagedResult<T>: Wrapper cho pagination
 */

import { VenueDto } from './venue.types';

/**
 * ============================================
 * EVENT LIST DTO - Hiển thị trong danh sách
 * ============================================
 * 
 * Backend: EventListDto.cs
 * 
 * Dùng cho:
 * - Homepage featured events
 * - Events browse page
 * - Search results
 */
export interface EventListDto {
  id: string;
  name: string;
  description: string; // Short description
  startDateTime: string; // ISO DateTime: "2024-01-15T19:00:00Z"
  endDateTime: string; // ISO DateTime: "2024-01-15T23:00:00Z"
  venueName: string;
  coverImageUrl: string;
  minPrice: number;
  
  // Optional fields (Backend có thể trả thêm)
  categoryName?: string;
  organizerName?: string;
  availableTickets?: number;
  status?: EventStatus;
  isFeatured?: boolean;
}

/**
 * ============================================
 * TICKET TYPE DTO - Chi tiết loại vé
 * ============================================
 * 
 * Backend: TicketTypeDto.cs (trong EventDetailDto)
 * 
 * Dùng cho:
 * - Event Detail Page (F4)
 * - Booking Page
 */
export interface TicketTypeDto {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // Giá gốc (nếu có discount)
  description?: string;   // Mô tả loại vé (VD: "Bao gồm đồ uống miễn phí")
  availableQuantity: number; // Số lượng vé còn lại
}

/**
 * ============================================
 * EVENT DETAIL DTO - Chi tiết đầy đủ
 * ============================================
 * 
 * Backend: EventDetailDto.cs
 * 
 * Dùng cho:
 * - Event Detail Page (F4)
 * - Booking Page
 * 
 * ⚠️ Khác với EventListDto:
 * - Có đầy đủ thông tin venue (address, city)
 * - Có ticketTypes array (để chọn vé)
 * - Có description đầy đủ (long text)
 */
export interface EventDetailDto {
  id: string;
  name: string;
  description: string; // Full description (có thể là HTML/Markdown)
  startDateTime: string; // ISO DateTime
  endDateTime: string;   // ISO DateTime
  coverImageUrl: string | null; // Có thể null nếu không có ảnh
  
  // Venue Information
  venueName: string;
  venueAddress: string; // Địa chỉ đầy đủ
  venueCity: string;    // Thành phố
  
  // Ticket Types (danh sách loại vé)
  ticketTypes: TicketTypeDto[];
}

/**
 * ============================================
 * PAGED RESULT - Pagination wrapper
 * ============================================
 * 
 * Backend: PagedResult<T>.cs
 * 
 * ⚠️ Quan trọng: Backend dùng "pageIndex" (không phải "page")
 * pageIndex: 1-based (trang đầu tiên là 1)
 */
export interface PagedResult<T> {
  items: T[];
  pageIndex: number; // Current page (1-based)
  totalPages: number; // Total number of pages
  totalCount: number; // Total number of items
  pageSize?: number; // Items per page
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

/**
 * ============================================
 * EVENT STATUS ENUM
 * ============================================
 * 
 * Backend: EventStatus.cs (Enum)
 */
export enum EventStatus {
  Draft = "Draft",
  Published = "Published",
  OnSale = "OnSale",
  SoldOut = "SoldOut",
  Ended = "Ended",
  Cancelled = "Cancelled"
}

// Create Event Request (cho Organizer)
export interface CreateEventRequest {
  title: string;
  description: string;
  longDescription?: string;
  eventDate: string;
  endDate?: string;
  categoryId: string;
  venueId: string;
  imageFile?: File;
  bannerFile?: File;
  tags: string[];
  ticketTypes: CreateTicketTypeRequest[];
}

export interface CreateTicketTypeRequest {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  maxPerOrder: number;
  salesStartDate?: string;
  salesEndDate?: string;
}

// Update Event Request
export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  eventId: string;
  status?: EventStatus;
}

// Event Search/Filter
export interface EventSearchParams {
  keyword?: string;
  categoryId?: string;
  venueId?: string;
  organizerId?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: EventStatus;
  tags?: string[];
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'date' | 'price' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
