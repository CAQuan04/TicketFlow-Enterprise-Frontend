/**
 * Event DTOs
 * ✅ Mapped chính xác từ Backend: TicketBooking.Application.Features.Events
 * 
 * Backend DTOs:
 * - EventListDto: Dùng cho danh sách sự kiện (Home, Browse, Search)
 * - EventDetailDto: Dùng cho chi tiết sự kiện
 * - PagedResult<T>: Wrapper cho pagination
 */

import { VenueDto } from './venue.types';

/**
 * Event List DTO - Hiển thị trong danh sách
 * Backend: EventListDto.cs
 * 
 * Fields mapping:
 * - id → eventId (unique identifier)
 * - name → title (event name)
 * - description → description (short description)
 * - startDateTime → startDateTime (ISO 8601 format)
 * - endDateTime → endDateTime (ISO 8601 format)
 * - venueName → venueName (display venue name)
 * - coverImageUrl → coverImageUrl (main image URL)
 * - minPrice → minPrice (lowest ticket price)
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
  
  // Optional fields (có thể Backend trả thêm)
  categoryName?: string;
  organizerName?: string;
  availableTickets?: number;
  status?: EventStatus;
  isFeatured?: boolean;
}

/**
 * Paged Result - Pagination wrapper
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
 * Alias cho backward compatibility
 */
export type PaginatedResponse<T> = PagedResult<T>;

// Event Detail DTO (cho trang Event Detail)
export interface EventDetailDto {
  eventId: string;
  title: string;
  description: string;
  longDescription?: string;
  eventDate: string;
  endDate?: string;
  imageUrl: string;
  bannerUrl?: string;
  categoryId: string;
  categoryName: string;
  venue: VenueDto;
  organizerId: string;
  organizerName: string;
  organizerLogo?: string;
  organizerDescription?: string;
  ticketTypes: TicketTypeDto[];
  tags: string[];
  status: EventStatus;
  isFeatured: boolean;
  capacity: number;
  soldTickets: number;
  createdAt: string;
  updatedAt: string;
}

// Ticket Type (trong Event)
export interface TicketTypeDto {
  ticketTypeId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  remainingQuantity: number;
  maxPerOrder: number;
  salesStartDate?: string;
  salesEndDate?: string;
  isActive: boolean;
}

// Event Status (từ Backend Enums)
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
