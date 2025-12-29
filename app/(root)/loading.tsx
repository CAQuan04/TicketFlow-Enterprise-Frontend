/**
 * ============================================
 * LOADING UI - STREAMING SKELETON
 * ============================================
 * 
 * File: app/(root)/loading.tsx
 * 
 * ============================================
 * TẠI SAO CẦN LOADING UI?
 * ============================================
 * 
 * Next.js Streaming Architecture:
 * 
 * 1. Traditional Loading:
 *    - User request → Server fetch ALL data → Send HTML
 *    - User thấy màn hình trắng trong lúc đợi
 *    - TTFB (Time to First Byte) cao → UX kém
 * 
 * 2. Streaming with Suspense:
 *    - User request → Server send HTML shell NGAY (loading.tsx)
 *    - User thấy skeleton → Cảm giác app nhanh
 *    - Server fetch data → Stream chunks → Replace skeleton
 *    - TTFB thấp → UX tốt hơn
 * 
 * ============================================
 * NEXT.JS AUTOMATIC SUSPENSE BOUNDARY
 * ============================================
 * 
 * Khi có loading.tsx trong folder:
 * - Next.js tự động wrap page.tsx trong <Suspense>
 * - Khi page.tsx đang await data → Show loading.tsx
 * - Khi data ready → Replace loading.tsx bằng page.tsx
 * 
 * Folder Structure:
 * app/
 *   (root)/
 *     loading.tsx  ← Hiển thị khi page.tsx đang fetch
 *     page.tsx     ← Server Component với await
 * 
 * Flow:
 * 1. User visit / → Next.js render loading.tsx NGAY
 * 2. Server bắt đầu fetch data trong page.tsx (await)
 * 3. User thấy skeleton (smooth UX)
 * 4. Data ready → Next.js replace loading.tsx bằng page.tsx
 * 5. User thấy content thật
 * 
 * ============================================
 * SKELETON UI BEST PRACTICES
 * ============================================
 * 
 * 1. Match Layout:
 *    - Skeleton phải giống layout thật
 *    - Cùng số lượng columns, spacing
 *    - User không bị "jump" khi content load
 * 
 * 2. Visual Hierarchy:
 *    - Skeleton phải có visual priority giống content
 *    - Hero section → Search bar → Grid
 *    - Giúp user biết content sẽ xuất hiện ở đâu
 * 
 * 3. Animation:
 *    - Pulse/shimmer animation → Cảm giác "đang load"
 *    - Không animation → User nghĩ app bị treo
 * 
 * 4. Performance:
 *    - Skeleton phải render NHANH (< 100ms)
 *    - Không fetch data trong loading.tsx
 *    - Chỉ là pure UI component
 * 
 * ============================================
 * TAILWIND SKELETON UTILITIES
 * ============================================
 * 
 * animate-pulse: Built-in Tailwind animation
 * - Tự động fade in/out
 * - Smooth, không gây chói mắt
 * 
 * bg-gray-200/300: Neutral colors
 * - Không quá sáng, không quá tối
 * - Contrast vừa phải với background
 * 
 * rounded-*: Match real component borders
 * - Card có rounded-xl → Skeleton cũng rounded-xl
 * - Consistency = Better UX
 */

import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* ============================================
          HERO SECTION SKELETON
          ============================================
          
          Match: Hero section trong page.tsx
          - Gradient background
          - Centered title + subtitle
          - Featured events grid
      */}
      <section className="section bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto">
          {/* Title Skeleton */}
          <div className="text-center mb-12">
            <div className="h-16 w-2/3 mx-auto bg-white/20 rounded-lg animate-pulse mb-4" />
            <div className="h-8 w-1/2 mx-auto bg-white/20 rounded-lg animate-pulse" />
          </div>

          {/* Featured Events Title Skeleton */}
          <div className="mt-8">
            <div className="h-8 w-64 mx-auto bg-white/20 rounded-lg animate-pulse mb-6" />
            
            {/* Featured Events Grid Skeleton - 5 cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SEARCH SECTION SKELETON
          ============================================
          
          Match: Search section trong page.tsx
          - Search title
          - Search bar
          - Events grid (4x3 = 12 cards)
      */}
      <section className="section bg-gray-50">
        <div className="container mx-auto">
          {/* Search Title Skeleton */}
          <div className="text-center mb-8">
            <div className="h-10 w-64 mx-auto bg-gray-300 rounded-lg animate-pulse mb-4" />
            
            {/* Search Bar Skeleton */}
            <div className="w-full max-w-2xl mx-auto">
              <div className="h-12 w-full bg-white border border-gray-300 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Events Grid Skeleton - 12 cards (3 rows x 4 cols) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="h-10 w-32 bg-gray-300 rounded-lg animate-pulse" />
              <div className="h-10 w-40 bg-gray-300 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-gray-300 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES SECTION SKELETON
          ============================================
      */}
      <section className="section">
        <div className="container mx-auto">
          {/* Section Title Skeleton */}
          <div className="h-10 w-96 mx-auto bg-gray-300 rounded-lg animate-pulse mb-12" />
          
          {/* Features Grid - 3 cards */}
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                {/* Icon Skeleton */}
                <div className="mb-4 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
                </div>
                
                {/* Title Skeleton */}
                <div className="h-6 w-48 mx-auto bg-gray-300 rounded animate-pulse mb-2" />
                
                {/* Description Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 mx-auto bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION SKELETON
          ============================================
      */}
      <section className="section bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto text-center">
          <div className="h-10 w-80 mx-auto bg-white/20 rounded-lg animate-pulse mb-4" />
          <div className="h-8 w-96 mx-auto bg-white/20 rounded-lg animate-pulse mb-8" />
          
          {/* Buttons Skeleton */}
          <div className="flex justify-center gap-4">
            <div className="h-12 w-40 bg-white/30 rounded-lg animate-pulse" />
            <div className="h-12 w-40 bg-white/30 rounded-lg animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * ============================================
 * EVENT CARD SKELETON COMPONENT
 * ============================================
 * 
 * Reusable skeleton cho EventCard
 * Match layout của EventCard.tsx
 */
function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md">
      {/* Image Skeleton - aspect-[4/3] */}
      <div className="relative aspect-[4/3] w-full bg-gray-300 animate-pulse" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title (2 lines) */}
        <div className="space-y-2">
          <div className="h-5 w-full bg-gray-300 rounded animate-pulse" />
          <div className="h-5 w-3/4 bg-gray-300 rounded animate-pulse" />
        </div>
        
        {/* Date & Location */}
        <div className="space-y-2">
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Price */}
        <div className="pt-2 border-t border-gray-200">
          <div className="h-6 w-24 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * ============================================
 * USAGE & TESTING
 * ============================================
 * 
 * 1. Automatic Usage:
 *    - Next.js tự động show loading.tsx khi page.tsx đang await
 *    - Không cần import hoặc config gì
 * 
 * 2. Manual Testing:
 *    - Thêm delay vào page.tsx để test skeleton
 *    ```ts
 *    // Trong page.tsx
 *    await new Promise(r => setTimeout(r, 3000)); // 3s delay
 *    const data = await fetchData();
 *    ```
 * 
 * 3. Network Throttling:
 *    - Chrome DevTools → Network → Slow 3G
 *    - Refresh trang → Thấy skeleton hiển thị lâu hơn
 * 
 * 4. Visual Regression Testing:
 *    - So sánh layout skeleton vs content thật
 *    - Không có "jump" khi content load
 *    - Spacing, columns match chính xác
 * 
 * ============================================
 * PERFORMANCE METRICS
 * ============================================
 * 
 * With loading.tsx:
 * - FCP (First Contentful Paint): < 1s
 * - LCP (Largest Contentful Paint): < 2.5s
 * - CLS (Cumulative Layout Shift): < 0.1
 * 
 * Without loading.tsx:
 * - FCP: 2-3s (phụ thuộc API)
 * - LCP: 3-4s
 * - CLS: 0.2-0.3 (content "nhảy")
 */
