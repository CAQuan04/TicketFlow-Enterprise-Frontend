'use client';

import { useEffect, useState } from 'react';
import { eventService } from '@/services/api/event.service';
import { EventListDto, PagedResult } from '@/types';
import { EventCard, EventCardSkeleton } from '@/components/events/EventCard';
import { useAuthStore } from '@/store';
import { Button } from 'antd';

/**
 * 🧪 Event Display Test Page
 * 
 * Test tất cả features của Event Display Layer:
 * 1. Get Events with Pagination
 * 2. Smart Featured Events (AI vs Guest)
 * 3. EventCard Component
 * 4. Loading States
 * 5. Image Handling
 * 
 * Access: http://localhost:3000/test-events
 */

export default function TestEventsPage() {
  const [events, setEvents] = useState<PagedResult<EventListDto> | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<EventListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { isAuthenticated, user } = useAuthStore();

  /**
   * Fetch Events với Pagination
   */
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const result = await eventService.getEvents({
          pageIndex: currentPage,
          pageSize: 6,
        });
        
        console.log('✅ Events fetched:', result);
        console.log(`📄 Page ${result.pageIndex}/${result.totalPages}`);
        console.log(`📊 Total: ${result.totalCount} events`);
        
        setEvents(result);
      } catch (error) {
        console.error('❌ Fetch events failed:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, [currentPage]);

  /**
   * Fetch Featured Events (Smart Logic)
   */
  const fetchFeaturedEvents = async () => {
    setFeaturedLoading(true);
    try {
      const result = await eventService.getFeaturedEvents();
      console.log('✅ Featured events:', result);
      console.log('👤 Auth status:', isAuthenticated ? '🔐 Logged In' : '👤 Guest');
      setFeaturedEvents(result);
    } catch (error) {
      console.error('❌ Fetch featured failed:', error);
    } finally {
      setFeaturedLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🧪 Event Display Test Page
          </h1>
          <p className="text-gray-600 mt-2">
            Testing Event Service & EventCard Component
          </p>
          
          {/* Auth Status */}
          <div className="mt-4 flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {isAuthenticated ? `🔐 Logged in: ${user?.fullName}` : '👤 Guest Mode'}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Section 1: Featured Events (Smart Logic) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isAuthenticated ? '🤖 AI Recommendations' : '🔥 Top Upcoming Events'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isAuthenticated 
                  ? 'Personalized recommendations based on your history' 
                  : 'Popular events for everyone'}
              </p>
            </div>
            
            <Button 
              type="primary" 
              onClick={fetchFeaturedEvents}
              loading={featuredLoading}
            >
              Load Featured Events
            </Button>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map(i => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {featuredEvents.map(event => (
                <EventCard key={event.id} event={event} priority />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Click "Load Featured Events" để test smart logic
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Section 2: All Events with Pagination */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                📅 All Events
              </h2>
              <p className="text-gray-600 mt-1">
                Browse all events with pagination
              </p>
            </div>

            {events && (
              <div className="text-sm text-gray-600">
                Page {events.pageIndex} / {events.totalPages} 
                <span className="ml-2 text-gray-400">
                  ({events.totalCount} total)
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : events && events.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.items.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </Button>
                
                <span className="text-gray-700">
                  Page {currentPage} of {events.totalPages}
                </span>
                
                <Button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage >= events.totalPages}
                >
                  Next →
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">Không có sự kiện nào</p>
            </div>
          )}
        </section>

        {/* Section 3: Test Info */}
        <section className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            📋 Test Checklist
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ EventCard component hiển thị đúng layout</li>
            <li>✅ Image loading với next/image optimization</li>
            <li>✅ Hover effects: scale + shadow</li>
            <li>✅ Date format: dayjs DD MMM YYYY, HH:mm</li>
            <li>✅ Price format: Intl.NumberFormat vi-VN</li>
            <li>✅ Loading skeleton animation</li>
            <li>✅ Pagination controls working</li>
            <li>✅ Smart featured events logic (AI vs Guest)</li>
            <li>✅ Click card → Navigate to /events/[id]</li>
          </ul>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Mở Console (F12) để xem logs chi tiết
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
