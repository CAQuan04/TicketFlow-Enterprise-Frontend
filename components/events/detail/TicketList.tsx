/**
 * ============================================
 * TICKET LIST COMPONENT
 * ============================================
 * 
 * Hiển thị danh sách loại vé (TicketTypes) của event
 * 
 * Features:
 * - Card layout responsive
 * - Price Display:
 *   - Nếu có originalPrice > price → Show strikethrough (discount)
 *   - Format currency chuẩn Intl.NumberFormat (vi-VN)
 * - Description: Show below ticket name
 * - Buy Button: Click → Console.log (sẽ implement Booking sau)
 * - Sold Out state: Disable button nếu availableQuantity = 0
 * 
 * Design:
 * - Grid layout: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
 * - Card với hover effect
 * - Highlight best deal (nếu có discount lớn nhất)
 */

'use client';

import React from 'react';
import { Button, Card, Tag, Space } from 'antd';
import { ShoppingCartOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { TicketTypeDto } from '@/types';

interface TicketListProps {
  ticketTypes: TicketTypeDto[];
  eventName: string; // Để log khi click Buy
}

/**
 * Format currency theo chuẩn VN
 * Example: 500000 → "500.000 ₫"
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Calculate discount percentage
 * Example: price=400000, originalPrice=500000 → "20%"
 */
const calculateDiscount = (price: number, originalPrice?: number): string | null => {
  if (!originalPrice || originalPrice <= price) return null;
  
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  return `-${discount}%`;
};

export default function TicketList({ ticketTypes, eventName }: TicketListProps) {
  /**
   * Handle Buy Ticket
   * 
   * TODO (F5): Navigate to Booking Page
   * Route: /booking?eventId=xxx&ticketTypeId=yyy
   * 
   * For now: Just console.log
   */
  const handleBuyTicket = (ticketType: TicketTypeDto) => {
    console.log('🎫 Buy Ticket:', {
      eventName,
      ticketTypeName: ticketType.name,
      ticketTypeId: ticketType.id,
      price: ticketType.price,
    });

    // TODO F5: Implement booking flow
    // router.push(`/booking?eventId=${eventId}&ticketTypeId=${ticketType.id}`);
  };

  if (!ticketTypes || ticketTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">
          Chưa có loại vé nào
        </div>
        <div className="text-gray-500 text-sm">
          Vui lòng quay lại sau
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Chọn Loại Vé
        </h2>
        <div className="text-sm text-gray-500">
          {ticketTypes.length} loại vé
        </div>
      </div>

      {/* Ticket Cards - Vertical Stack */}
      <div className="space-y-4">
        {ticketTypes.map((ticket) => {
          const discount = calculateDiscount(ticket.price, ticket.originalPrice);
          const isSoldOut = ticket.availableQuantity === 0;

          return (
            <Card
              key={ticket.id}
              className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400"
              hoverable={!isSoldOut}
            >
              <div className="space-y-4">
                {/* Ticket Name & Tags */}
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">
                    {ticket.name}
                  </h3>
                  
                  {/* Discount Tag */}
                  {discount && !isSoldOut && (
                    <Tag color="red" className="text-base font-semibold">
                      {discount}
                    </Tag>
                  )}

                  {/* Sold Out Tag */}
                  {isSoldOut && (
                    <Tag color="default" className="text-base">
                      Hết vé
                    </Tag>
                  )}
                </div>

                {/* Ticket Description */}
                {ticket.description && (
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {ticket.description}
                  </div>
                )}

                {/* Available Quantity */}
                {!isSoldOut && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircleOutlined className="text-green-600" />
                    <span className="text-gray-600">
                      Còn <strong className="text-green-600">{ticket.availableQuantity}</strong> vé
                    </span>
                  </div>
                )}

                {/* Price Display */}
                <div className="border-t pt-4">
                  <Space orientation="vertical" size={4} className="w-full">
                    {/* Original Price (nếu có discount) */}
                    {ticket.originalPrice && ticket.originalPrice > ticket.price && (
                      <div className="text-sm text-gray-400 line-through">
                        {formatCurrency(ticket.originalPrice)}
                      </div>
                    )}

                    {/* Current Price */}
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(ticket.price)}
                    </div>
                  </Space>
                </div>

                {/* Buy Button */}
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ShoppingCartOutlined />}
                  disabled={isSoldOut}
                  onClick={() => handleBuyTicket(ticket)}
                  className="font-semibold"
                >
                  {isSoldOut ? 'Hết vé' : 'Mua ngay'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
