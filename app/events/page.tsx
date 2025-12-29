/**
 * ============================================
 * EVENTS PAGE - ADVANCED SEARCH & FILTERS
 * ============================================
 * 
 * Features:
 * ✅ Smart Autocomplete (Elasticsearch)
 * ✅ Advanced Filters (Date Range, Price Range)
 * ✅ Pagination with SQL
 * ✅ URL State Management
 * 
 * ============================================
 * DUAL SEARCH ARCHITECTURE
 * ============================================
 * 
 * 1. **Elasticsearch Autocomplete (SmartSearchBar):**
 *    - Purpose: Fast suggestions với fuzzy search
 *    - Endpoint: /events/search-smart
 *    - Use case: User typing → Instant suggestions
 *    - Benefits: Typo tolerance, semantic search, fast
 *    
 * 2. **SQL Main Grid (getEvents):**
 *    - Purpose: Accurate results với pagination + filters
 *    - Endpoint: /events (SQL)
 *    - Use case: Final search → Display grid results
 *    - Benefits: Strict pagination, complex filters, accurate counts
 * 
 * Why Both?
 * - Elasticsearch: UX (gợi ý nhanh khi gõ)
 * - SQL: Accuracy (pagination chính xác, filter phức tạp)
 * 
 * ============================================
 * URL STATE MANAGEMENT
 * ============================================
 * 
 * All filters stored in URL query params:
 * - ?search=concert
 * - &fromDate=2024-01-01&toDate=2024-12-31
 * - &minPrice=100000&maxPrice=500000
 * - &page=2
 * 
 * Benefits:
 * - Shareable URLs
 * - Bookmarkable results
 * - Browser back button works
 * - SEO-friendly
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Pagination, Row, Col } from 'antd';
import { eventService, EventSearchParams } from '@/services/api/event.service';
import { EventListDto, PagedResult } from '@/types';
import { EventCard, EventCardSkeleton } from '@/components/events/EventCard';
import SmartSearchBar from '@/components/events/SmartSearchBar';
import EventFilter from '@/components/events/EventFilter';

export default function EventsPage() {
  const searchParams = useSearchParams();
  
  // State
  const [events, setEvents] = useState<PagedResult<EventListDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * ============================================
   * PARSE FILTERS FROM URL
   * ============================================
   * 
   * Read tất cả filter values từ URL query params
   */
  const currentPage = parseInt(searchParams.get('page') || '1');
  const searchTerm = searchParams.get('search') || undefined;
  const fromDate = searchParams.get('fromDate') || undefined; // ISO UTC string
  const toDate = searchParams.get('toDate') || undefined; // ISO UTC string
  const minPrice = searchParams.get('minPrice') 
    ? parseFloat(searchParams.get('minPrice')!) 
    : undefined;
  const maxPrice = searchParams.get('maxPrice')
    ? parseFloat(searchParams.get('maxPrice')!)
    : undefined;

  /**
   * ============================================
   * FETCH EVENTS FROM BACKEND (SQL)
   * ============================================
   * 
   * ⚠️ IMPORTANT: This uses SQL endpoint, NOT Elasticsearch
   * 
   * Why SQL for main grid?
   * - Accurate pagination counts
   * - Complex filters (date range, price, etc.)
   * - Consistent sorting
   * - Transaction support
   * 
   * Elasticsearch chỉ dùng cho autocomplete suggestions
   */
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching events (SQL):', {
        pageIndex: currentPage,
        pageSize: 12,
        searchTerm,
        fromDate,
        toDate,
        minPrice,
        maxPrice,
      });
      
      const params: EventSearchParams = {
        pageIndex: currentPage,
        pageSize: 12,
        searchTerm,
        startDate: fromDate, // Backend expects startDate
        endDate: toDate, // Backend expects endDate
        minPrice,
        maxPrice,
      };
      
      const result = await eventService.getEvents(params);
      
      console.log('✅ Events fetched:', {
        items: result.items.length,
        currentPage: result.pageIndex,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      });
      
      setEvents(result);
    } catch (err: any) {
      console.error('❌ Fetch events failed:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách sự kiện');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================================
   * EFFECT: FETCH WHEN URL CHANGES
   * ============================================
   * 
   * URL changes → Re-fetch events
   * Dependencies: All filter params from URL
   */
  useEffect(() => {
    fetchEvents();
  }, [currentPage, searchTerm, fromDate, toDate, minPrice, maxPrice]);

  /**
   * ============================================
   * HANDLE PAGE CHANGE
   * ============================================
   */
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    window.history.pushState({}, '', `?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Note: URL change sẽ trigger useEffect → fetchEvents
  };

  /**
   * ============================================
   * HANDLE CLEAR ALL FILTERS
   * ============================================
   */
  const handleClearFilters = () => {
    window.history.pushState({}, '', '/events');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">
            Khám Phá Sự Kiện
          </h1>
          <p className="text-blue-100 text-lg">
            Tìm kiếm và đặt vé cho các sự kiện tuyệt vời
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* ============================================
            SEARCH & FILTER SECTION
            ============================================
            
            Layout: 2 columns
            - Left (col-span-3): Filter Sidebar
            - Right (col-span-9): Search Bar + Results Grid
        */}
        <Row gutter={[24, 24]}>
          {/* LEFT SIDEBAR: FILTERS */}
          <Col xs={24} lg={6}>
            <EventFilter />
          </Col>

          {/* RIGHT: SEARCH BAR + RESULTS */}
          <Col xs={24} lg={18}>
            {/* SMART SEARCH BAR (Elasticsearch Autocomplete) */}
            <div className="mb-6">
              <SmartSearchBar />
            </div>

            {/* RESULTS */}
            {error ? (
              // Error State
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="text-red-600 text-lg mb-4">❌ {error}</div>
                <Button type="primary" onClick={fetchEvents}>
                  Thử lại
                </Button>
              </div>
            ) : loading ? (
              // Loading State
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : events && events.items.length > 0 ? (
              // Results Found
              <>
                {/* Results Info */}
                <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-600">
                    Tìm thấy <strong className="text-blue-600">{events.totalCount}</strong> sự kiện
                    {searchTerm && (
                      <span className="ml-2">
                        cho "<strong className="text-blue-600">{searchTerm}</strong>"
                      </span>
                    )}
                  </p>
                  
                  <p className="text-sm text-gray-500">
                    Trang {events.pageIndex} / {events.totalPages}
                  </p>
                </div>

                {/* Event Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.items.map((event, index) => (
                    <EventCard 
                      key={event.id} 
                      event={event}
                      priority={index < 3} // First 3 images have priority
                    />
                  ))}
                </div>

                {/* Pagination */}
                {events.totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <Pagination
                      current={events.pageIndex}
                      total={events.totalCount}
                      pageSize={12}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showTotal={(total) => `Tổng ${total} sự kiện`}
                    />
                  </div>
                )}
              </>
            ) : (
              // No Results
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Không tìm thấy sự kiện
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || fromDate || minPrice ? (
                    <>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</>
                  ) : (
                    <>Hiện tại chưa có sự kiện nào</>
                  )}
                </p>
                {(searchTerm || fromDate || minPrice) && (
                  <Button 
                    type="primary" 
                    onClick={handleClearFilters}
                  >
                    Xóa tất cả bộ lọc
                  </Button>
                )}
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
