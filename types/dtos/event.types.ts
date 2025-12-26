/**
 * Event DTOs
 * Mapped từ Backend: TicketBooking.Application.Features.Events
 */

import { VenueDto } from './venue.types';

// Event List DTO (cho trang Home/Browse)
export interface EventListDto {
  eventId: string;
  title: string;
  description: string;
  eventDate: string; // ISO DateTime
  imageUrl: string;
  categoryName: string;
  venueName: string;
  venueLocation: string;
  organizerName: string;
  minPrice: number;
  maxPrice: number;
  availableTickets: number;
  totalTickets: number;
  status: EventStatus;
  isFeatured: boolean;
  tags: string[];
}

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
