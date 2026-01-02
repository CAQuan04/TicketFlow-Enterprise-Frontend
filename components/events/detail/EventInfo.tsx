/**
 * ============================================
 * EVENT INFO COMPONENT
 * ============================================
 * 
 * Hiển thị thông tin chi tiết về event:
 * - Description (Full text, có thể là rich text)
 * - Map placeholder (Google Maps embed - optional)
 * - Additional info (organizer, tags, etc.)
 * 
 * Design:
 * - Clean typography
 * - Whitespace cân đối
 * - Responsive layout
 */

'use client';

import React from 'react';
import { Card, Divider } from 'antd';
import { 
  InfoCircleOutlined, 
  EnvironmentOutlined,
  CalendarOutlined,
  TagOutlined 
} from '@ant-design/icons';
import { EventDetailDto } from '@/types';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

interface EventInfoProps {
  event: EventDetailDto;
}

export default function EventInfo({ event }: EventInfoProps) {
  const startDate = dayjs(event.startDateTime);
  const endDate = dayjs(event.endDateTime);

  /**
   * Calculate event duration
   * Example: "4 giờ" hoặc "2 ngày"
   */
  const duration = endDate.diff(startDate, 'hour');
  const durationText = duration < 24 
    ? `${duration} giờ` 
    : `${Math.floor(duration / 24)} ngày`;

  return (
    <div className="space-y-8">
      {/* ============================================
          ABOUT THIS EVENT
          ============================================ */}
      <Card className="shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <InfoCircleOutlined className="text-2xl text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Giới thiệu sự kiện
            </h2>
          </div>

          <Divider className="my-4" />

          {/* Event Description */}
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {event.description}
          </div>
        </div>
      </Card>

      {/* ============================================
          EVENT DETAILS (META INFO)
          ============================================ */}
      <Card className="shadow-sm">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TagOutlined className="text-blue-600" />
            Chi tiết
          </h3>

          <Divider className="my-4" />

          <div className="space-y-4">
            {/* Date & Duration */}
            <div className="flex items-start gap-3">
              <CalendarOutlined className="text-lg text-blue-600 mt-1" />
              <div>
                <div className="font-semibold text-gray-900">
                  Thời gian
                </div>
                <div className="text-gray-600">
                  {startDate.format('dddd, DD MMMM YYYY')}
                </div>
                <div className="text-gray-600">
                  {startDate.format('HH:mm')} - {endDate.format('HH:mm')} ({durationText})
                </div>
              </div>
            </div>

            {/* Venue */}
            <div className="flex items-start gap-3">
              <EnvironmentOutlined className="text-lg text-red-600 mt-1" />
              <div>
                <div className="font-semibold text-gray-900">
                  Địa điểm
                </div>
                <div className="text-gray-600">
                  {event.venueName}
                </div>
                <div className="text-gray-600">
                  {event.venueAddress}
                </div>
                <div className="text-gray-600">
                  {event.venueCity}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ============================================
          MAP SECTION (GOOGLE MAPS EMBED)
          ============================================ 
          
          Note: Cần Google Maps API key để embed map
          
          For now: Show placeholder với link Google Maps
      */}
      <Card className="shadow-sm">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <EnvironmentOutlined className="text-red-600" />
            Bản đồ
          </h3>

          <Divider className="my-4" />

          {/* Google Maps Embed */}
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                `${event.venueName} ${event.venueAddress} ${event.venueCity}`
              )}&output=embed`}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Bản đồ ${event.venueName}`}
            />
          </div>
          
          {/* Link to open in Google Maps */}
          <div className="text-center">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${event.venueName} ${event.venueAddress} ${event.venueCity}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
            >
              Xem trên Google Maps →
            </a>
          </div>
        </div>
      </Card>

      {/* ============================================
          ADDITIONAL INFO
          ============================================ */}
      <Card className="shadow-sm bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <InfoCircleOutlined className="text-2xl text-blue-600 mt-1" />
          <div>
            <div className="font-semibold text-gray-900 mb-2">
              Lưu ý quan trọng
            </div>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Vui lòng mang theo giấy tờ tùy thân khi tham dự sự kiện</li>
              <li>• Vé đã mua không thể hoàn trả hoặc đổi lại</li>
              <li>• Khách tham dự vui lòng có mặt trước giờ diễn ra sự kiện 30 phút</li>
              <li>• Không mang đồ uống, thực phẩm từ bên ngoài vào địa điểm</li>
              <li>• Tuân thủ các quy định an toàn và hướng dẫn của ban tổ chức</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
