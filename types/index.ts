/**
 * Central Type Exports
 * Import tất cả types từ đây: import { EventListDto, LoginResponse } from '@/types'
 */

// Auth Types
export * from './dtos/auth.types';

// Event Types
export * from './dtos/event.types';

// Venue Types
export * from './dtos/venue.types';

// Order & Payment Types
export * from './dtos/order.types';

// Ticket Types
export * from './dtos/ticket.types';

// Stats & Analytics Types
export * from './dtos/stats.types';

// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiError[];
  statusCode: number;
}
