/**
 * ============================================
 * EVENT HERO COMPONENT
 * ============================================
 * 
 * Hiển thị:
 * - Full-width background với cover image (blurred)
 * - Title (H1)
 * - Date & Time (format đẹp với DayJS)
 * - Venue (Icon + Name + City)
 * 
 * Design:
 * - Hero section với gradient overlay
 * - Responsive: Mobile → Desktop
 * - Optimized image loading
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import { EventDetailDto } from '@/types';
import { getImageUrl } from '@/lib/utils';

// Enable plugins
dayjs.extend(relativeTime);
dayjs.locale('vi');

interface EventHeroProps {
  event: EventDetailDto;
}

export default function EventHero({ event }: EventHeroProps) {
  const startDate = dayjs(event.startDateTime);
  const endDate = dayjs(event.endDateTime);
  
  /**
   * Format date hiển thị
   * Examples:
   * - "Thứ 7, 30 Th12 2024"
   * - "Chủ nhật, 31 Th12 2024"
   */
  const formattedDate = startDate.format('dddd, DD [Th]MM YYYY');
  
  /**
   * Format time range
   * Examples:
   * - "19:00 - 23:00"
   * - "18:30 - 22:30"
   */
  const formattedTime = `${startDate.format('HH:mm')} - ${endDate.format('HH:mm')}`;
  
  /**
   * Relative time (Bao lâu nữa sự kiện diễn ra)
   * Examples:
   * - "2 ngày nữa"
   * - "1 tuần nữa"
   */
  const relativeTimeText = startDate.fromNow();

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gray-900">
      {/* Background Image với Blur Effect */}
      {event.coverImageUrl ? (
        <>
          {/* Blurred Background Layer */}
          <div className="absolute inset-0">
            <Image
              src={getImageUrl(event.coverImageUrl)}
              alt={event.name}
              fill
              className="object-cover opacity-40"
              style={{ filter: 'blur(30px)' }}
              priority
              unoptimized={process.env.NODE_ENV === 'development'}
            />
          </div>

          {/* Sharp Image Layer (Center, scaled down) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="relative w-full h-full max-w-2xl">
              <Image
                src={getImageUrl(event.coverImageUrl)}
                alt={event.name}
                fill
                className="object-contain"
                priority
                unoptimized={process.env.NODE_ENV === 'development'}
              />
            </div>
          </div>
        </>
      ) : (
        /* Fallback gradient nếu không có ảnh */
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900" />
      )}

      {/* Gradient Overlay cho text dễ đọc */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

      {/* Content */}
      <div className="relative h-full container mx-auto px-4">
        <div className="flex flex-col justify-end h-full pb-12 md:pb-16 max-w-4xl">
          {/* Event Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            {event.name}
          </h1>

          {/* Event Info Grid */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <CalendarOutlined className="text-2xl text-blue-400 mt-1" />
              <div>
                <div className="text-white text-lg font-semibold">
                  {formattedDate}
                </div>
                <div className="text-gray-300 text-sm flex items-center gap-2">
                  <ClockCircleOutlined />
                  {formattedTime}
                </div>
                <div className="text-blue-400 text-sm mt-1">
                  {relativeTimeText}
                </div>
              </div>
            </div>

            {/* Divider (Desktop only) */}
            <div className="hidden md:block w-px bg-gray-500" />

            {/* Venue */}
            <div className="flex items-start gap-3">
              <EnvironmentOutlined className="text-2xl text-red-400 mt-1" />
              <div>
                <div className="text-white text-lg font-semibold">
                  {event.venueName}
                </div>
                <div className="text-gray-300 text-sm">
                  {event.venueAddress}
                </div>
                <div className="text-gray-400 text-sm">
                  {event.venueCity}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
