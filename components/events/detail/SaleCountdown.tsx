/**
 * ============================================
 * SALE COUNTDOWN COMPONENT
 * ============================================
 * 
 * Hiển thị đếm ngược thời gian cho Flash Sale
 * 
 * Features:
 * - Đếm ngược theo định dạng: DD Days : HH Hours : MM Mins : SS Secs
 * - Tự động update mỗi giây
 * - Gọi callback khi hết thời gian
 * - UI đẹp mắt với font Monospace
 * - Responsive design
 * 
 * Props:
 * - targetDate: Thời gian mục tiêu (ISO string)
 * - onComplete: Callback khi countdown kết thúc
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

interface SaleCountdownProps {
  targetDate: string; // ISO DateTime string
  onComplete: () => void; // Callback khi hết thời gian
  title?: string; // Tiêu đề tùy chỉnh (mặc định: "Bắt đầu sau")
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function SaleCountdown({ 
  targetDate, 
  onComplete,
  title = 'Bắt đầu sau'
}: SaleCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    /**
     * Tính toán thời gian còn lại
     */
    const calculateTimeRemaining = (): TimeRemaining | null => {
      const now = dayjs();
      const target = dayjs(targetDate);
      const diff = target.diff(now);

      // Nếu đã quá thời gian
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const durationObj = dayjs.duration(diff);

      return {
        days: Math.floor(durationObj.asDays()),
        hours: durationObj.hours(),
        minutes: durationObj.minutes(),
        seconds: durationObj.seconds(),
      };
    };

    // Set thời gian ban đầu
    const initial = calculateTimeRemaining();
    setTimeRemaining(initial);

    // Kiểm tra nếu đã hết thời gian ngay từ đầu
    if (initial && initial.days === 0 && initial.hours === 0 && initial.minutes === 0 && initial.seconds === 0) {
      setIsComplete(true);
      onComplete();
      return;
    }

    // Tạo interval để update mỗi giây
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // Kiểm tra nếu đã hết thời gian
      if (remaining && remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        clearInterval(interval);
        setIsComplete(true);
        onComplete();
      }
    }, 1000);

    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  // Nếu chưa có dữ liệu (loading)
  if (!timeRemaining) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-center gap-2">
          <ClockCircleOutlined className="text-2xl animate-spin" />
          <span className="text-lg font-semibold">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Nếu đã hoàn thành
  if (isComplete) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-6 text-white">
        <div className="text-center">
          <ClockCircleOutlined className="text-4xl mb-3" />
          <div className="text-2xl font-bold">Đã bắt đầu!</div>
          <div className="text-sm mt-2 opacity-90">Bạn có thể đặt vé ngay bây giờ</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white shadow-xl">
      {/* Title */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ClockCircleOutlined className="text-2xl" />
          <span className="text-lg font-semibold">{title}</span>
        </div>
        <div className="h-px bg-white/30 w-20 mx-auto"></div>
      </div>

      {/* Countdown Display */}
      <div className="grid grid-cols-4 gap-3">
        {/* Days */}
        <div className="text-center">
          <div 
            className="bg-white/20 rounded-lg p-3 backdrop-blur-sm"
            style={{ fontFamily: 'monospace' }}
          >
            <div className="text-3xl md:text-4xl font-bold">
              {String(timeRemaining.days).padStart(2, '0')}
            </div>
          </div>
          <div className="text-xs mt-2 opacity-90 font-medium">Ngày</div>
        </div>

        {/* Hours */}
        <div className="text-center">
          <div 
            className="bg-white/20 rounded-lg p-3 backdrop-blur-sm"
            style={{ fontFamily: 'monospace' }}
          >
            <div className="text-3xl md:text-4xl font-bold">
              {String(timeRemaining.hours).padStart(2, '0')}
            </div>
          </div>
          <div className="text-xs mt-2 opacity-90 font-medium">Giờ</div>
        </div>

        {/* Minutes */}
        <div className="text-center">
          <div 
            className="bg-white/20 rounded-lg p-3 backdrop-blur-sm"
            style={{ fontFamily: 'monospace' }}
          >
            <div className="text-3xl md:text-4xl font-bold">
              {String(timeRemaining.minutes).padStart(2, '0')}
            </div>
          </div>
          <div className="text-xs mt-2 opacity-90 font-medium">Phút</div>
        </div>

        {/* Seconds */}
        <div className="text-center">
          <div 
            className="bg-white/20 rounded-lg p-3 backdrop-blur-sm animate-pulse"
            style={{ fontFamily: 'monospace' }}
          >
            <div className="text-3xl md:text-4xl font-bold">
              {String(timeRemaining.seconds).padStart(2, '0')}
            </div>
          </div>
          <div className="text-xs mt-2 opacity-90 font-medium">Giây</div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-center mt-4 text-sm opacity-90">
        Đặt vé ngay khi mở bán để có giá tốt nhất!
      </div>
    </div>
  );
}
