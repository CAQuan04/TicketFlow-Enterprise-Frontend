import { axiosClient } from '@/lib/axios-client';
import { useAuthStore } from '@/store';
import {
  EventListDto,
  EventDetailDto,
  PagedResult,
} from '@/types';

/**
 * Event Service
 * ✅ Xử lý tất cả API calls liên quan đến events
 * ✅ Smart Logic: Detect logged-in user để call AI recommendation
 * ✅ Elasticsearch: Smart autocomplete với fuzzy search
 */

const EVENT_ENDPOINTS = {
  EVENTS: '/events',
  EVENT_DETAIL: (id: string) => `/events/${id}`,
  RECOMMENDATIONS: '/events/recommendations', // AI endpoint (for logged-in users)
  SEARCH_SMART: '/search/smart', // ✅ Elasticsearch autocomplete (corrected endpoint)
};

/**
 * Event Search/Filter Parameters
 * Backend: GetEventsQuery.cs
 */
export interface EventSearchParams {
  searchTerm?: string; // Search by name/description
  pageIndex?: number; // Page number (1-based)
  pageSize?: number; // Items per page
  venueId?: string; // Filter by venue
  fromDate?: string; // Filter start date (ISO format)
  toDate?: string; // Filter end date (ISO format)
  categoryId?: string; // Filter by category
  minPrice?: number; // Filter min price
  maxPrice?: number; // Filter max price
}

export const eventService = {
  /**
   * Get Events với Pagination & Filters
   * 
   * Backend endpoint: GET /api/events
   * Query params: searchTerm, pageIndex, pageSize, venueId, fromDate, toDate
   * 
   * @example
   * const result = await eventService.getEvents({
   *   searchTerm: 'concert',
   *   pageIndex: 1,
   *   pageSize: 12,
   *   fromDate: '2024-01-01'
   * });
   * console.log(result.items, result.totalPages);
   */
  async getEvents(params?: EventSearchParams): Promise<PagedResult<EventListDto>> {
    const response = await axiosClient.get<PagedResult<EventListDto>>(
      EVENT_ENDPOINTS.EVENTS,
      { 
        params: {
          pageIndex: 1, // Default page 1
          pageSize: 12, // Default 12 items
          ...params, // Override with user params
        }
      }
    );
    
    // Backend trả về trực tiếp PagedResult, không wrap trong ApiResponse
    return response.data;
  },

  /**
   * ============================================
   * GET EVENT DETAIL BY ID (F4)
   * ============================================
   * 
   * Backend endpoint: GET /api/events/{id}
   * 
   * ⚠️ 404 Handling:
   * - Nếu event không tồn tại → return null
   * - Caller (page.tsx) sẽ gọi notFound() của Next.js
   * 
   * Why return null instead of throwing?
   * - Next.js Server Component có thể dùng notFound() để show 404 page
   * - Tránh unhandled error crashes
   * 
   * @param eventId - Event ID
   * @returns Promise<EventDetailDto | null>
   * 
   * @example
   * // Server Component (page.tsx)
   * const event = await eventService.getEventById(params.id);
   * if (!event) {
   *   notFound(); // Next.js 404 page
   * }
   */
  async getEventById(eventId: string): Promise<EventDetailDto | null> {
    try {
      const response = await axiosClient.get<EventDetailDto>(
        EVENT_ENDPOINTS.EVENT_DETAIL(eventId)
      );
      return response.data;
    } catch (error: any) {
      // Nếu 404: Event không tồn tại
      if (error.response?.status === 404) {
        console.warn(`⚠️ Event not found: ${eventId}`);
        return null;
      }
      
      // Các lỗi khác: throw để caller xử lý
      throw error;
    }
  },

  /**
   * Get Featured Events - SMART LOGIC
   * 
   * Logic thông minh:
   * 1. Nếu user đã đăng nhập → Call AI Recommendation API
   * 2. Nếu user là guest → Call danh sách sự kiện upcoming (top 5)
   * 
   * Why?
   * - Logged-in users: Personalized recommendations based on history
   * - Guest users: Show popular upcoming events
   * 
   * @returns Promise<EventListDto[]> - Array of featured/recommended events
   * 
   * @example
   * // Trên homepage
   * const featuredEvents = await eventService.getFeaturedEvents();
   * // Nếu logged in: AI recommendations
   * // Nếu guest: Top 5 upcoming events
   */
  async getFeaturedEvents(): Promise<EventListDto[]> {
    // Check authentication state từ Zustand store
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const accessToken = useAuthStore.getState().accessToken;
    
    // Logged-in users: Get AI personalized recommendations
    if (isAuthenticated && accessToken) {
      try {
        console.log('🤖 Fetching AI recommendations for logged-in user');
        
        const response = await axiosClient.get<EventListDto[]>(
          EVENT_ENDPOINTS.RECOMMENDATIONS
        );
        
        // Backend trả về array trực tiếp
        return response.data;
      } catch (error) {
        console.warn('⚠️ AI recommendations failed, fallback to upcoming events:', error);
        
        // Fallback: Nếu AI endpoint fail, dùng upcoming events
        const pagedResult = await this.getEvents({
          pageIndex: 1,
          pageSize: 5,
        });
        
        return pagedResult.items;
      }
    }
    
    // Guest users: Get top upcoming events
    console.log('👤 Guest user, fetching top upcoming events');
    
    const pagedResult = await this.getEvents({
      pageIndex: 1,
      pageSize: 5,
      // Optional: Thêm filter để chỉ lấy upcoming events
      // fromDate: new Date().toISOString(),
    });
    
    return pagedResult.items;
  },

  /**
   * Smart Search - Elasticsearch Autocomplete
   * 
   * ============================================
   * ELASTICSEARCH VS SQL
   * ============================================
   * 
   * Tại sao dùng 2 systems?
   * 
   * 1. **Elasticsearch (Autocomplete Dropdown):**
   *    - Fuzzy Search: Xử lý typo (blackpnk → BLACKPINK)
   *    - Fast: < 50ms response time
   *    - Purpose: User experience - gợi ý nhanh khi gõ
   *    - Trả về: Top 10 suggestions
   * 
   * 2. **SQL Database (Main Grid Results):**
   *    - Strict Pagination: Đảm bảo consistency
   *    - Filtering: Complex joins với venues, categories
   *    - Sorting: Consistent ordering
   *    - Purpose: Chính xác, reliable data
   * 
   * Flow:
   * 1. User gõ "blakpink" → Elasticsearch suggest "BLACKPINK World Tour"
   * 2. User select suggestion → Navigate to /events/{id}
   * 3. User nhấn Enter hoặc search button → SQL query với full filters
   * 
   * Backend endpoint: GET /api/events/search-smart?keyword=xxx
   * 
   * @param keyword - Search keyword
   * @returns Promise<EventListDto[]> - Top 10 matching events
   * 
   * @example
   * const suggestions = await eventService.searchSmart('blackp');
   * // Returns: [{ id: 'xxx', name: 'BLACKPINK World Tour', ... }]
   */
  async searchSmart(keyword: string): Promise<EventListDto[]> {
    if (!keyword || keyword.trim().length < 2) {
      return []; // Không search nếu < 2 ký tự
    }

    try {
      const response = await axiosClient.get<EventListDto[]>(
        EVENT_ENDPOINTS.SEARCH_SMART,
        {
          params: { keyword: keyword.trim() }
        }
      );
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Smart search failed:', error);
      return []; // Return empty array nếu lỗi, không break UI
    }
  },
};
