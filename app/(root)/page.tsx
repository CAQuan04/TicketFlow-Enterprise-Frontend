/**
 * ============================================
 * HOMEPAGE - SERVER COMPONENT
 * ============================================
 * 
 * Route: / (Root)
 * Layout: (root)/layout.tsx
 * 
 * ============================================
 * TẠI SAO DÙNG SERVER COMPONENT?
 * ============================================
 * 
 * Server Component vs Client Component (useEffect):
 * 
 * 1. SEO (Search Engine Optimization):
 *    ❌ Client (useEffect):
 *       - Search engine crawler nhận HTML trống
 *       - Data load sau khi JS execute
 *       - Google khó index được nội dung
 *       
 *    ✅ Server Component:
 *       - HTML đã có data khi gửi về browser
 *       - Search engine thấy full content
 *       - Tốt cho SEO, Social Sharing (OG tags)
 * 
 * 2. Performance (Core Web Vitals):
 *    ❌ Client (useEffect):
 *       - User thấy màn hình trắng → Skeleton → Data
 *       - Phải đợi JS download, execute
 *       - FCP (First Contentful Paint) chậm
 *       
 *    ✅ Server Component:
 *       - User thấy content ngay lập tức
 *       - Không cần đợi JS
 *       - FCP nhanh, TTI (Time to Interactive) tốt
 * 
 * 3. Security:
 *    ❌ Client (useEffect):
 *       - API keys, tokens expose trong browser
 *       - Rate limiting khó kiểm soát
 *       
 *    ✅ Server Component:
 *       - API calls execute trên server
 *       - Secrets không expose ra client
 * 
 * 4. Code Size:
 *    ❌ Client (useEffect):
 *       - React, useState, useEffect bundle gửi về client
 *       - JavaScript bundle lớn
 *       
 *    ✅ Server Component:
 *       - Code chỉ chạy trên server
 *       - Client nhận HTML nhỏ gọn
 * 
 * ============================================
 * NEXT.JS 15 COMPATIBILITY
 * ============================================
 * 
 * BREAKING CHANGE: searchParams là Promise
 * 
 * Next.js 14:
 * function Page({ searchParams }) {
 *   const search = searchParams.search; // ✅ OK
 * }
 * 
 * Next.js 15 (REQUIRED):
 * async function Page(props: { searchParams: Promise<...> }) {
 *   const searchParams = await props.searchParams; // ⚠️ MUST AWAIT
 *   const search = searchParams.search; // ✅ OK
 * }
 * 
 * Lý do:
 * - Next.js 15 optimize rendering bằng async params
 * - Cho phép streaming và parallel data fetching tốt hơn
 * - Tránh race conditions với URL state
 */

import React from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { eventService } from '@/services/api/event.service';
import { EventCard } from '@/components/events/EventCard';

/**
 * ============================================
 * TYPE DEFINITIONS (NEXT.JS 15 STRICT)
 * ============================================
 */
type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

interface HomePageProps {
  searchParams: SearchParams;
}

/**
 * ============================================
 * HOMEPAGE - ASYNC SERVER COMPONENT
 * ============================================
 */
export default async function HomePage(props: HomePageProps) {
  /**
   * STEP 1: AWAIT SEARCH PARAMS (NEXT.JS 15)
   * ⚠️ CRITICAL: Must await props.searchParams
   */
  const searchParams = await props.searchParams;

  console.log('🏠 Homepage loading...');

  /**
   * HOMEPAGE CHỈ FETCH FEATURED EVENTS (STATIC)
   * Không có search/pagination để tránh reload mỗi khi URL change
   */
  const featuredEvents = await eventService.getFeaturedEvents()
    .catch(error => {
      console.error('❌ Featured events failed:', error);
      return [];
    });

  console.log('✅ Homepage Data:', {
    featured: featuredEvents.length,
  });

  /**
   * ============================================
   * RENDER
   * ============================================
   */
  return (
    <div className="min-h-screen">
      {/* HERO SECTION - FEATURED EVENTS */}
      <section className="section bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="mb-4 text-5xl font-extrabold leading-tight lg:text-6xl">
              🎫 TicketFlow
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-blue-100 lg:text-2xl">
              Khám phá và đặt vé các sự kiện hấp dẫn nhất
            </p>
          </div>

          {/* Featured Events Grid */}
          {featuredEvents.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6 text-center">
                🔥 Sự kiện nổi bật
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
                {featuredEvents.slice(0, 5).map((event, index) => (
                  <EventCard 
                    key={event.id} 
                    event={event}
                    priority={index < 3}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SEARCH CTA SECTION - Navigate to /events */}
      <section className="section bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tìm kiếm sự kiện
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Khám phá hàng ngàn sự kiện đang chờ bạn
          </p>
          <Link href="/events">
            <Button type="primary" size="large" className="h-12 px-8">
              🔍 Tìm kiếm sự kiện
            </Button>
          </Link>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="section">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Tại sao chọn TicketFlow?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-blue-100 p-4">
                  <span className="text-3xl">⚡</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Đặt vé nhanh chóng</h3>
              <p className="text-gray-600">
                Quy trình đặt vé đơn giản, thanh toán an toàn trong vài phút
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-purple-100 p-4">
                  <span className="text-3xl">🎯</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Gợi ý thông minh</h3>
              <p className="text-gray-600">
                AI đề xuất sự kiện phù hợp với sở thích của bạn
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-100 p-4">
                  <span className="text-3xl">🔒</span>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">An toàn & bảo mật</h3>
              <p className="text-gray-600">
                Thông tin và thanh toán được mã hóa tối đa
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="mb-8 text-xl text-blue-100">
            Đăng ký ngay để nhận thông báo sự kiện mới nhất
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button type="primary" size="large" className="h-12 px-8 bg-white text-purple-600 hover:bg-gray-100 border-0">
                Đăng ký miễn phí
              </Button>
            </Link>
            <Link href="/events">
              <Button size="large" className="h-12 px-8" ghost>
                Khám phá sự kiện
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
