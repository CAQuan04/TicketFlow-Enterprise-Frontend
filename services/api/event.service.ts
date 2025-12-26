import { axiosClient } from '@/lib/axios-client';
import {
  EventListDto,
  EventDetailDto,
  CreateEventRequest,
  UpdateEventRequest,
  EventSearchParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

/**
 * Event Service
 * Xử lý tất cả API calls liên quan đến events
 */

const EVENT_ENDPOINTS = {
  EVENTS: '/events',
  EVENT_DETAIL: (id: string) => `/events/${id}`,
  FEATURED_EVENTS: '/events/featured',
  UPCOMING_EVENTS: '/events/upcoming',
  SEARCH_EVENTS: '/events/search',
  MY_EVENTS: '/events/my-events', // Cho organizer
};

export const eventService = {
  /**
   * Get paginated events với filters
   */
  async getEvents(params?: EventSearchParams): Promise<PaginatedResponse<EventListDto>> {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<EventListDto>>>(
      EVENT_ENDPOINTS.EVENTS,
      { params }
    );
    return response.data.data!;
  },

  /**
   * Get event detail by ID
   */
  async getEventById(eventId: string): Promise<EventDetailDto> {
    const response = await axiosClient.get<ApiResponse<EventDetailDto>>(
      EVENT_ENDPOINTS.EVENT_DETAIL(eventId)
    );
    return response.data.data!;
  },

  /**
   * Get featured events (trang chủ)
   */
  async getFeaturedEvents(): Promise<EventListDto[]> {
    const response = await axiosClient.get<ApiResponse<EventListDto[]>>(
      EVENT_ENDPOINTS.FEATURED_EVENTS
    );
    return response.data.data!;
  },

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit?: number): Promise<EventListDto[]> {
    const response = await axiosClient.get<ApiResponse<EventListDto[]>>(
      EVENT_ENDPOINTS.UPCOMING_EVENTS,
      { params: { limit } }
    );
    return response.data.data!;
  },

  /**
   * Search events
   */
  async searchEvents(params: EventSearchParams): Promise<PaginatedResponse<EventListDto>> {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<EventListDto>>>(
      EVENT_ENDPOINTS.SEARCH_EVENTS,
      { params }
    );
    return response.data.data!;
  },

  /**
   * Create new event (Organizer only)
   */
  async createEvent(data: CreateEventRequest): Promise<EventDetailDto> {
    // Nếu có file upload, dùng FormData
    const formData = new FormData();

    // Append các fields thông thường
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'imageFile' || key === 'bannerFile') {
        if (value) formData.append(key, value as File);
      } else if (key === 'ticketTypes') {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'tags') {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await axiosClient.post<ApiResponse<EventDetailDto>>(
      EVENT_ENDPOINTS.EVENTS,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data!;
  },

  /**
   * Update event (Organizer only)
   */
  async updateEvent(data: UpdateEventRequest): Promise<EventDetailDto> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'imageFile' || key === 'bannerFile') {
        if (value) formData.append(key, value as File);
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await axiosClient.put<ApiResponse<EventDetailDto>>(
      EVENT_ENDPOINTS.EVENT_DETAIL(data.eventId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data!;
  },

  /**
   * Delete event (Organizer only)
   */
  async deleteEvent(eventId: string): Promise<void> {
    await axiosClient.delete(EVENT_ENDPOINTS.EVENT_DETAIL(eventId));
  },

  /**
   * Get my events (Organizer)
   */
  async getMyEvents(): Promise<EventListDto[]> {
    const response = await axiosClient.get<ApiResponse<EventListDto[]>>(
      EVENT_ENDPOINTS.MY_EVENTS
    );
    return response.data.data!;
  },
};
