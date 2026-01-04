/**
 * ============================================
 * TICKET CARD - F7.3 SPEC (PHYSICAL TICKET)
 * ============================================
 * 
 * Stylish card mimicking a physical concert ticket
 * 
 * RESPONSIVE LAYOUT:
 * ==================
 * Mobile: Vertical Card
 *  - Image Top
 *  - Info Middle
 *  - Button Bottom
 * 
 * Desktop: Horizontal "Stub" Design
 *  - Image Left
 *  - Info Middle
 *  - Dashed Line (perforation effect)
 *  - QR Button Right (detachable stub)
 * 
 * DATE FORMAT:
 * ============
 * Big Bold Day: "20"
 * Small Month: "DEC"
 * 
 * CONTENT:
 * ========
 * - Thumbnail: coverImageUrl (object-cover)
 * - Date: Prominent display
 * - Event Name: Truncate 2 lines
 * - Venue: Full name
 * - Seat/Type: Highlighted badge
 * - Action: "View QR Code" button → Opens QrModal
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { TicketDto } from '@/types';
import { getImageUrl } from '@/lib/utils';
import QrModal from './QrModal';

dayjs.locale('vi');

interface TicketCardProps {
  ticket: TicketDto;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const [qrModalOpen, setQrModalOpen] = useState(false);

  /**
   * Parse Date Components
   */
  const eventDate = dayjs(ticket.startDateTime);
  const day = eventDate.format('DD'); // "20"
  const month = eventDate.format('MMM').toUpperCase(); // "DEC"
  const time = eventDate.format('HH:mm'); // "19:00"
  const weekday = eventDate.format('dddd'); // "Thứ Sáu"

  /**
   * Format Currency VND
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  /**
   * Handle View QR Code
   */
  const handleViewQR = () => {
    setQrModalOpen(true);
  };

  return (
    <>
      {/* 
        PHYSICAL TICKET CARD
        ====================
        Desktop: Horizontal layout với dashed line giữa
        Mobile: Vertical layout
      */}
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200">
        {/* Mobile: Vertical Layout */}
        <div className="flex flex-col md:hidden">
          {/* Image Top */}
          <div className="relative h-48 w-full bg-gradient-to-br from-purple-500 to-pink-500">
            {ticket.coverImageUrl ? (
              <Image
                src={getImageUrl(ticket.coverImageUrl)}
                alt={ticket.eventName}
                fill
                className="object-cover"
                unoptimized={process.env.NODE_ENV === 'development'}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                🎵
              </div>
            )}
          </div>

          {/* Info Middle */}
          <div className="p-6">
            {/* Date Badge */}
            <div className="inline-flex items-center gap-2 mb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-black leading-none">{day}</div>
                <div className="text-xs font-medium tracking-wider">{month}</div>
              </div>
              <div className="border-l border-white/30 pl-2">
                <div className="text-sm capitalize">{weekday}</div>
                <div className="text-lg font-bold">{time}</div>
              </div>
            </div>

            {/* Event Name */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {ticket.eventName}
            </h3>

            {/* Venue */}
            <p className="text-sm text-gray-600 mb-3 truncate">
              📍 {ticket.venueName}
            </p>

            {/* Ticket Type & Price */}
            <div className="flex items-center justify-between mb-4">
              <div className="px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-lg border-2 border-yellow-300">
                🎫 {ticket.ticketTypeName}
              </div>
              <div className="text-xl font-black text-gray-900">
                {formatCurrency(ticket.price)}
              </div>
            </div>

            {/* Button */}
            <Button
              type="primary"
              size="large"
              block
              icon={<QrcodeOutlined />}
              onClick={handleViewQR}
              className="font-bold"
            >
              Xem QR Code
            </Button>
          </div>
        </div>

        {/* Desktop: Horizontal "Stub" Layout */}
        <div className="hidden md:flex min-h-[280px]">
          {/* LEFT: Image */}
          <div className="relative w-64 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
            {ticket.coverImageUrl ? (
              <Image
                src={getImageUrl(ticket.coverImageUrl)}
                alt={ticket.eventName}
                fill
                className="object-cover"
                unoptimized={process.env.NODE_ENV === 'development'}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-7xl">
                🎵
              </div>
            )}
          </div>

          {/* MIDDLE: Info */}
          <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
            {/* Top Section */}
            <div>
              {/* Event Name */}
              <h3 className="text-2xl font-black text-gray-900 mb-3 line-clamp-2">
                {ticket.eventName}
              </h3>

              {/* Date & Time */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
                  <div className="text-center border-r border-white/30 pr-3">
                    <div className="text-3xl font-black leading-none">{day}</div>
                    <div className="text-xs font-medium tracking-wider">{month}</div>
                  </div>
                  <div>
                    <div className="text-sm capitalize">{weekday}</div>
                    <div className="text-lg font-bold">{time}</div>
                  </div>
                </div>
              </div>

              {/* Venue */}
              <p className="text-sm text-gray-600 mb-3">
                📍 {ticket.venueName}, {ticket.venueAddress}
              </p>
            </div>

            {/* Bottom Section */}
            <div className="flex items-center gap-4">
              {/* Ticket Type (Highlighted) */}
              <div className="px-4 py-2 bg-yellow-100 text-yellow-800 text-base font-bold rounded-lg border-2 border-yellow-300 inline-flex items-center gap-2">
                <span>🎫</span>
                <span>{ticket.ticketTypeName}</span>
              </div>

              {/* Price */}
              <div className="text-2xl font-black text-gray-900">
                {formatCurrency(ticket.price)}
              </div>
            </div>
          </div>

          {/* DASHED LINE (Perforation Effect) */}
          <div className="relative w-0 border-l-2 border-dashed border-gray-300">
            {/* Top Circle */}
            <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gray-50 border-2 border-gray-300"></div>
            {/* Bottom Circle */}
            <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-gray-50 border-2 border-gray-300"></div>
          </div>

          {/* RIGHT: QR Button Stub (Detachable) */}
          <div className="w-48 bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex flex-col items-center justify-center gap-4">
            <div className="text-6xl">🎫</div>
            <p className="text-xs text-gray-600 text-center font-medium">
              Scan QR tại cổng vào
            </p>
            <Button
              type="primary"
              size="large"
              icon={<QrcodeOutlined />}
              onClick={handleViewQR}
              className="w-full font-bold"
            >
              Xem QR
            </Button>
          </div>
        </div>
      </div>

      {/* QR Modal Integration */}
      <QrModal
        ticket={ticket}
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </>
  );
}
