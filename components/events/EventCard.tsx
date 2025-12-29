'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import dayjs from 'dayjs';
import { EventListDto } from '@/types';
import { getImageUrl, formatCurrency } from '@/lib/utils';

/**
 * Event Card Component
 * 
 * Component hiển thị thông tin event trong dạng card
 * Dùng trong: Homepage, Event Browse, Search Results
 * 
 * Features:
 * ✅ Responsive image với next/image optimization
 * ✅ Hover effects (scale + shadow)
 * ✅ Format date với dayjs
 * ✅ Format price với Intl.NumberFormat
 * ✅ Click navigate to event detail page
 * 
 * @example
 * <EventCard event={eventData} />
 */

interface EventCardProps {
  event: EventListDto;
  priority?: boolean; // next/image priority (cho above-the-fold images)
}

export function EventCard({ event, priority = false }: EventCardProps) {
  /**
   * Format Event Date
   * Format: "15 Th01 2024, 19:00"
   * dayjs format: DD MMM YYYY, HH:mm
   */
  const formattedDate = dayjs(event.startDateTime).format('DD MMM YYYY, HH:mm');
  
  /**
   * Format Event Price
   * Format: "100.000 ₫" hoặc "Miễn phí" nếu price = 0
   */
  const formattedPrice = event.minPrice === 0 
    ? 'Miễn phí' 
    : formatCurrency(event.minPrice);

  /**
   * Image URL với fallback
   * getImageUrl xử lý:
   * - Full URL (http/https)
   * - Relative path từ Backend
   * - Placeholder nếu null
   */
  const imageUrl = getImageUrl(event.coverImageUrl);

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        {/* Event Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={event.name}
            fill
            priority={priority}
            unoptimized={process.env.NODE_ENV === 'development'} // Disable optimization in dev (HTTPS cert issue)
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <div className="rounded-lg bg-white/95 px-3 py-1.5 backdrop-blur-sm">
              <p className="text-sm font-bold text-blue-600">
                {formattedPrice}
              </p>
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="p-4 space-y-3">
          {/* Event Title */}
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.name}
          </h3>

          {/* Event Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>

          {/* Event Meta Info */}
          <div className="space-y-2 text-sm text-gray-500">
            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0 text-blue-500" />
              <span className="truncate">{formattedDate}</span>
            </div>

            {/* Venue */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 text-red-500" />
              <span className="truncate">{event.venueName}</span>
            </div>

            {/* Available Tickets (nếu Backend trả về) */}
            {event.availableTickets !== undefined && (
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 flex-shrink-0 text-green-500" />
                <span className="truncate">
                  {event.availableTickets > 0 
                    ? `Còn ${event.availableTickets} vé` 
                    : 'Hết vé'}
                </span>
              </div>
            )}
          </div>

          {/* CTA Hint */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600 font-medium group-hover:underline">
                Xem chi tiết
              </span>
              <svg
                className="h-5 w-5 text-blue-600 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Event Card Skeleton - Loading state
 * 
 * Dùng khi đang fetch data từ API
 * 
 * @example
 * {isLoading ? (
 *   <EventCardSkeleton />
 * ) : (
 *   <EventCard event={event} />
 * )}
 */
export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md">
      {/* Image Skeleton */}
      <div className="aspect-[4/3] w-full bg-gray-200 animate-pulse" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        </div>
        
        {/* Meta */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
