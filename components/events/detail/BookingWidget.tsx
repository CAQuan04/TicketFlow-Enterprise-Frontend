/**
 * ============================================
 * BOOKING WIDGET COMPONENT
 * ============================================
 * 
 * Component wrapper thông minh để quản lý các trạng thái bán vé:
 * - WAITING: Chờ thời gian bắt đầu bán vé → Hiển thị countdown
 * - OPEN: Đang bán vé → Hiển thị ticket selector
 * - ENDED: Đã kết thúc bán vé → Hiển thị thông báo
 * 
 * Features:
 * - Tự động chuyển đổi trạng thái dựa trên thời gian
 * - Xử lý hydration để tránh mismatch Server/Client
 * - Countdown tự động refresh UI khi hết giờ
 * - Timezone handling với dayjs
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tag } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  StopOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { EventDetailDto } from '@/types';
import SaleCountdown from './SaleCountdown';
import TicketSelector from './TicketSelector';

dayjs.extend(utc);
dayjs.extend(timezone);

interface BookingWidgetProps {
  event: EventDetailDto;
}

/**
 * Các trạng thái bán vé
 */
type SaleStatus = 'WAITING' | 'OPEN' | 'ENDED';

/**
 * Xác định trạng thái bán vé dựa trên thời gian
 */
const getSaleStatus = (
  saleStartTime: string,
  saleEndTime?: string
): SaleStatus => {
  const now = dayjs();
  const startTime = dayjs(saleStartTime);
  const endTime = saleEndTime ? dayjs(saleEndTime) : null;

  // Nếu chưa đến giờ bắt đầu
  if (now.isBefore(startTime)) {
    return 'WAITING';
  }

  // Nếu có thời gian kết thúc và đã qua giờ kết thúc
  if (endTime && now.isAfter(endTime)) {
    return 'ENDED';
  }

  // Đang trong thời gian bán vé
  return 'OPEN';
};

export default function BookingWidget({ event }: BookingWidgetProps) {
  // State để xử lý hydration
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<SaleStatus>('WAITING');

  /**
   * Cập nhật trạng thái bán vé
   */
  const updateStatus = useCallback(() => {
    const newStatus = getSaleStatus(
      event.ticketSaleStartTime,
      event.ticketSaleEndTime
    );
    setStatus(newStatus);
  }, [event.ticketSaleStartTime, event.ticketSaleEndTime]);

  /**
   * Effect: Set mounted và initial status
   * Tránh hydration mismatch giữa server và client
   */
  useEffect(() => {
    setMounted(true);
    updateStatus();
  }, [updateStatus]);

  /**
   * Callback khi countdown hoàn thành
   * Tự động chuyển sang trạng thái OPEN
   */
  const handleCountdownComplete = useCallback(() => {
    console.log('🎉 Countdown completed! Opening ticket sales...');
    setStatus('OPEN');
  }, []);

  /**
   * Render loading state khi chưa mount
   * Tránh hydration mismatch
   */
  if (!mounted) {
    return (
      <Card className="shadow-lg">
        <div className="text-center py-8">
          <ClockCircleOutlined className="text-4xl text-gray-400 animate-spin" />
          <div className="text-gray-500 mt-4">Đang tải...</div>
        </div>
      </Card>
    );
  }

  /**
   * Render WAITING state - Countdown
   */
  if (status === 'WAITING') {
    return (
      <Card className="shadow-lg" styles={{ body: { padding: 0 } }}>
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-2 mb-2">
            <ClockCircleOutlined className="text-purple-600 text-xl" />
            <h3 className="text-lg font-bold text-gray-900">
              Bán vé sắp bắt đầu
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Vé sẽ mở bán vào {dayjs(event.ticketSaleStartTime).format('HH:mm DD/MM/YYYY')}
          </p>
        </div>

        {/* Countdown */}
        <div className="p-6">
          <SaleCountdown
            targetDate={event.ticketSaleStartTime}
            onComplete={handleCountdownComplete}
            title="Bắt đầu sau"
          />
          
          {/* Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-2">💡 Lưu ý:</div>
              <ul className="space-y-1 text-xs">
                <li>• Chuẩn bị sẵn tài khoản để đặt vé nhanh</li>
                <li>• Refresh trang khi countdown kết thúc</li>
                <li>• Số lượng vé có hạn, đặt ngay khi mở bán</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  /**
   * Render ENDED state - Đã kết thúc
   */
  if (status === 'ENDED') {
    return (
      <Card className="shadow-lg">
        <div className="text-center py-8">
          <StopOutlined className="text-6xl text-gray-400 mb-4" />
          <Tag color="default" className="mb-3 text-base px-4 py-1">
            Đã kết thúc bán vé
          </Tag>
          <div className="text-gray-600 mb-2">
            Thời gian bán vé đã kết thúc
          </div>
          {event.ticketSaleEndTime && (
            <div className="text-sm text-gray-500">
              Kết thúc lúc: {dayjs(event.ticketSaleEndTime).format('HH:mm DD/MM/YYYY')}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              Vé đã ngừng bán. Vui lòng xem các sự kiện khác.
            </div>
          </div>
        </div>
      </Card>
    );
  }

  /**
   * Render OPEN state - Đang bán vé
   */
  return (
    <Card className="shadow-lg" styles={{ body: { padding: 0 } }}>
      {/* Header - Sale Status */}
      <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-green-600 text-xl" />
            <span className="font-semibold text-gray-900">Đang mở bán</span>
          </div>
          <Tag color="success" className="text-xs">
            <span className="animate-pulse">● </span>
            LIVE
          </Tag>
        </div>
        
        {/* Sale end time (nếu có) */}
        {event.ticketSaleEndTime && (
          <div className="text-xs text-gray-600 mt-2">
            Kết thúc: {dayjs(event.ticketSaleEndTime).format('HH:mm DD/MM/YYYY')}
          </div>
        )}
      </div>

      {/* Ticket Selector */}
      <div className="p-6">
        <TicketSelector event={event} />
      </div>

      {/* Footer - Trust Badges */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <CheckCircleOutlined className="text-green-600" />
            <span>Thanh toán an toàn</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircleOutlined className="text-green-600" />
            <span>Xác nhận ngay</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircleOutlined className="text-green-600" />
            <span>Hỗ trợ 24/7</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
