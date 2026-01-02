/**
 * ============================================
 * EVENT DETAIL PAGE (F4)
 * ============================================
 * 
 * Route: /events/[id]
 * Example: /events/27d83230-7fec-4419-92bf-f3cee0a45987
 * 
 * Features:
 * ✅ Server Component (async/await)
 * ✅ Dynamic Metadata (SEO optimization)
 * ✅ 404 Handling với notFound()
 * ✅ Rich UI với Hero, Info, TicketList
 * ✅ Currency formatting (Intl.NumberFormat)
 * ✅ Optimized images
 * 
 * Structure:
 * 1. generateMetadata() - SEO (title, og:image)
 * 2. EventDetailPage() - Server Component
 * 3. Fetch event data
 * 4. Render Hero + Info + TicketList
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eventService } from '@/services/api/event.service';
import EventHero from '@/components/events/detail/EventHero';
import EventInfo from '@/components/events/detail/EventInfo';
import TicketList from '@/components/events/detail/TicketList';

/**
 * ============================================
 * DYNAMIC PARAMS TYPE
 * ============================================
 */
interface EventDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * ============================================
 * GENERATE METADATA (SEO)
 * ============================================
 * 
 * Next.js automatically calls this function to set:
 * - <title> tag
 * - <meta property="og:title">
 * - <meta property="og:image">
 * - <meta property="og:description">
 * 
 * Benefits:
 * - Better SEO ranking
 * - Beautiful social media previews (Facebook, Twitter)
 * - Dynamic per-event metadata
 * 
 * Example:
 * When sharing /events/xxx on Facebook:
 * - Title: "BLACKPINK World Tour Hanoi | TicketFlow"
 * - Image: Event cover image
 * - Description: Event description
 * 
 * ⚠️ Next.js 15+: params is a Promise!
 * Must await before accessing properties
 * 
 * @param params - Route params (Promise<{ id: string }>)
 * @returns Metadata object
 */
export async function generateMetadata(
  { params }: EventDetailPageProps
): Promise<Metadata> {
  // ⚠️ CRITICAL: Next.js 15+ - params is a Promise
  const { id } = await params;

  // Fetch event data (same call as page, Next.js will dedupe)
  const event = await eventService.getEventById(id);

  // Nếu không tìm thấy event → Default metadata
  if (!event) {
    return {
      title: 'Sự kiện không tồn tại | TicketFlow',
      description: 'Sự kiện bạn tìm kiếm không tồn tại hoặc đã bị xóa.',
    };
  }

  // Dynamic metadata từ event data
  return {
    title: `${event.name} | TicketFlow`,
    description: event.description.substring(0, 160), // Limit to 160 chars for SEO
    
    // Open Graph (Facebook, LinkedIn)
    openGraph: {
      title: event.name,
      description: event.description,
      images: event.coverImageUrl 
        ? [
            {
              url: event.coverImageUrl.startsWith('http') 
                ? event.coverImageUrl 
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${event.coverImageUrl}`,
              width: 1200,
              height: 630,
              alt: event.name,
            }
          ]
        : [],
      type: 'website',
      siteName: 'TicketFlow',
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: event.name,
      description: event.description,
      images: event.coverImageUrl 
        ? [event.coverImageUrl.startsWith('http') 
            ? event.coverImageUrl 
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}${event.coverImageUrl}`]
        : [],
    },

    // Additional SEO
    keywords: [
      event.name,
      event.venueName,
      event.venueCity,
      'vé sự kiện',
      'đặt vé online',
      'ticketflow',
    ].join(', '),

    // Canonical URL
    alternates: {
      canonical: `/events/${id}`,
    },
  };
}

/**
 * ============================================
 * EVENT DETAIL PAGE (SERVER COMPONENT)
 * ============================================
 * 
 * ⚠️ Server Component:
 * - Can use async/await directly
 * - Fetch data on server → Better performance
 * - No "use client" needed
 * - Data fetching happens during SSR/SSG
 * 
 * ⚠️ Next.js 15+: params is a Promise!
 * Must await before accessing properties
 * 
 * Flow:
 * 1. Await params to get id
 * 2. Fetch event from Backend API
 * 3. If not found → Call notFound() (Next.js 404 page)
 * 4. Render Hero + Info + TicketList
 * 
 * @param params - Route params (Promise<{ id: string }>)
 */
export default async function EventDetailPage({ params }: EventDetailPageProps) {
  // ⚠️ CRITICAL: Next.js 15+ - params is a Promise
  const { id } = await params;

  console.log('🔍 Fetching event detail:', id);

  /**
   * ============================================
   * FETCH EVENT DATA
   * ============================================
   * 
   * ⚠️ Error Handling:
   * - eventService.getEventById returns null if 404
   * - Call notFound() to show Next.js 404 page
   * - Other errors will throw → Error boundary
   */
  const event = await eventService.getEventById(id);

  if (!event) {
    console.warn('⚠️ Event not found:', id);
    notFound(); // Next.js sẽ hiển thị 404 page
  }

  console.log('✅ Event loaded:', event.name);

  /**
   * ============================================
   * RENDER PAGE
   * ============================================
   */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Full width */}
      <EventHero event={event} />

      {/* Content Container */}
      <div className="container mx-auto px-4 py-12">
        {/* 2-Column Layout: Info (Left) + Tickets (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Event Info (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            <EventInfo event={event} />
          </div>

          {/* RIGHT: Ticket List (1/3 width on desktop, sticky on scroll) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <TicketList 
                ticketTypes={event.ticketTypes} 
                eventName={event.name}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section (Optional - Encourage booking) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Đừng bỏ lỡ sự kiện này!
          </h2>
          <p className="text-xl text-blue-100 mb-6">
            Đặt vé ngay hôm nay để có giá tốt nhất
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Thanh toán an toàn</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Xác nhận ngay lập tức</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ============================================
 * EXPLANATION: WHY SERVER COMPONENT?
 * ============================================
 * 
 * 1. **Better SEO:**
 *    - HTML được render sẵn trên server
 *    - Search engines có thể crawl content ngay lập tức
 *    - Meta tags (title, og:image) có sẵn trong HTML
 * 
 * 2. **Faster Initial Load:**
 *    - Không cần fetch data trên client
 *    - Giảm JavaScript bundle size
 *    - User thấy content ngay khi page load
 * 
 * 3. **Security:**
 *    - API calls happen trên server
 *    - Không expose API endpoints cho client
 *    - Có thể dùng private APIs
 * 
 * 4. **Data Freshness:**
 *    - Next.js cache và revalidate data
 *    - ISR (Incremental Static Regeneration) support
 *    - On-demand revalidation
 * 
 * ============================================
 * EXPLANATION: GENERATE METADATA
 * ============================================
 * 
 * **What it does:**
 * - Fetch event data để generate dynamic metadata
 * - Set <title>, <meta> tags cho SEO
 * - Set Open Graph tags cho social media
 * 
 * **Why it's important:**
 * - Better SEO ranking (Google loves rich metadata)
 * - Beautiful previews khi share link (Facebook, Twitter)
 * - Dynamic per-event (không phải static title chung)
 * 
 * **Example Output (HTML):**
 * ```html
 * <head>
 *   <title>BLACKPINK World Tour Hanoi | TicketFlow</title>
 *   <meta property="og:title" content="BLACKPINK World Tour Hanoi">
 *   <meta property="og:image" content="https://backend.com/images/blackpink.jpg">
 *   <meta property="og:description" content="The biggest concert ever...">
 * </head>
 * ```
 * 
 * **When user shares link:**
 * Facebook/Twitter sẽ crawl metadata và hiển thị:
 * - Title: BLACKPINK World Tour Hanoi
 * - Image: Event cover
 * - Description: Event description
 * 
 * → Beautiful preview card thay vì plain link!
 */
