/**
 * ============================================
 * TICKET SELECTOR COMPONENT
 * ============================================
 * 
 * Component cho phép chọn số lượng vé với các giới hạn logic:
 * - Giới hạn tổng số vé theo maxTicketsPerUser
 * - Giới hạn số lượng khả dụng của từng loại vé
 * - Giới hạn tối đa 10 vé mỗi loại
 * - Hiển thị giá và tính tổng tiền
 * 
 * Logic quan trọng:
 * - Nút "+" bị disable khi đạt bất kỳ giới hạn nào
 * - Hiển thị thông báo rõ ràng về giới hạn
 * - Tính tổng tiền real-time
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Button, Card, Tag, message } from 'antd';
import { 
  PlusOutlined, 
  MinusOutlined, 
  ShoppingCartOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { EventDetailDto, TicketTypeDto } from '@/types';

interface TicketSelectorProps {
  event: EventDetailDto;
  onCheckout?: (selections: Record<string, number>) => void;
}

/**
 * Format currency theo chuẩn VN
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Tính phần trăm giảm giá
 */
const calculateDiscount = (price: number, originalPrice?: number): string | null => {
  if (!originalPrice || originalPrice <= price) return null;
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  return `-${discount}%`;
};

export default function TicketSelector({ event, onCheckout }: TicketSelectorProps) {
  // State: Record<ticketTypeId, quantity>
  const [selections, setSelections] = useState<Record<string, number>>({});

  /**
   * Tính tổng số vé đã chọn (tất cả loại vé)
   */
  const totalTicketsSelected = useMemo(() => {
    return Object.values(selections).reduce((sum, qty) => sum + qty, 0);
  }, [selections]);

  /**
   * Tính tổng tiền
   */
  const totalAmount = useMemo(() => {
    return event.ticketTypes.reduce((sum, ticket) => {
      const qty = selections[ticket.id] || 0;
      return sum + (ticket.price * qty);
    }, 0);
  }, [selections, event.ticketTypes]);

  /**
   * Xử lý tăng số lượng
   */
  const handleIncrease = (ticket: TicketTypeDto) => {
    const currentQty = selections[ticket.id] || 0;

    // Kiểm tra các giới hạn
    const hasUserLimit = event.maxTicketsPerUser > 0;
    const reachedUserLimit = hasUserLimit && totalTicketsSelected >= event.maxTicketsPerUser;
    const reachedRowLimit = currentQty >= ticket.availableQuantity || currentQty >= 10;

    if (reachedUserLimit) {
      message.warning(`Bạn chỉ có thể mua tối đa ${event.maxTicketsPerUser} vé cho sự kiện này`);
      return;
    }

    if (reachedRowLimit) {
      if (currentQty >= ticket.availableQuantity) {
        message.warning(`Chỉ còn ${ticket.availableQuantity} vé loại "${ticket.name}"`);
      } else {
        message.warning(`Mỗi loại vé chỉ được mua tối đa 10 vé`);
      }
      return;
    }

    // Tăng số lượng
    setSelections(prev => ({
      ...prev,
      [ticket.id]: currentQty + 1,
    }));
  };

  /**
   * Xử lý giảm số lượng
   */
  const handleDecrease = (ticket: TicketTypeDto) => {
    const currentQty = selections[ticket.id] || 0;
    
    if (currentQty > 0) {
      setSelections(prev => ({
        ...prev,
        [ticket.id]: currentQty - 1,
      }));
    }
  };

  /**
   * Kiểm tra nút "+" có nên bị disable không
   */
  const isPlusDisabled = (ticket: TicketTypeDto): boolean => {
    const currentQty = selections[ticket.id] || 0;
    
    // Hết vé
    if (ticket.availableQuantity === 0) return true;
    
    // Đạt giới hạn user (nếu có)
    if (event.maxTicketsPerUser > 0 && totalTicketsSelected >= event.maxTicketsPerUser) {
      return true;
    }
    
    // Đạt số lượng khả dụng hoặc hard limit 10
    if (currentQty >= ticket.availableQuantity || currentQty >= 10) {
      return true;
    }
    
    return false;
  };

  /**
   * Xử lý thanh toán
   */
  const handleCheckoutClick = () => {
    if (totalTicketsSelected === 0) {
      message.warning('Vui lòng chọn ít nhất 1 vé');
      return;
    }

    console.log('🛒 Proceeding to checkout:', {
      eventId: event.id,
      eventName: event.name,
      selections,
      totalAmount,
    });

    // Gọi callback nếu có
    if (onCheckout) {
      onCheckout(selections);
    }

    // Hiện thông báo thành công
    message.success('Đang chuyển đến trang thanh toán...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Chọn Loại Vé
        </h2>
        <div className="text-sm text-gray-500">
          {event.ticketTypes.length} loại vé
        </div>
      </div>

      {/* Giới hạn mua vé (nếu có) */}
      {event.maxTicketsPerUser > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <WarningOutlined />
            <span className="text-sm font-medium">
              Giới hạn: Tối đa <strong>{event.maxTicketsPerUser}</strong> vé/người
            </span>
          </div>
          {totalTicketsSelected > 0 && (
            <div className="text-xs text-yellow-700 mt-1 ml-6">
              Đã chọn: {totalTicketsSelected}/{event.maxTicketsPerUser} vé
            </div>
          )}
        </div>
      )}

      {/* Danh sách loại vé */}
      <div className="space-y-4">
        {event.ticketTypes.map((ticket) => {
          const currentQty = selections[ticket.id] || 0;
          const discount = calculateDiscount(ticket.price, ticket.originalPrice);
          const isSoldOut = ticket.availableQuantity === 0;
          const isMaxed = isPlusDisabled(ticket);

          return (
            <Card
              key={ticket.id}
              className={`${
                currentQty > 0 
                  ? 'border-2 border-blue-400 bg-blue-50' 
                  : 'border border-gray-200'
              } transition-all duration-200`}
            >
              <div className="space-y-3">
                {/* Tên vé & Tags */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {ticket.name}
                    </h3>
                    {ticket.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {ticket.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Discount hoặc Sold Out Tag */}
                  {isSoldOut ? (
                    <Tag color="default">Hết vé</Tag>
                  ) : discount ? (
                    <Tag color="red" className="text-sm font-semibold">
                      {discount}
                    </Tag>
                  ) : null}
                </div>

                {/* Số lượng còn lại */}
                {!isSoldOut && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircleOutlined className="text-green-600" />
                    <span className="text-gray-600">
                      Còn <strong className="text-green-600">{ticket.availableQuantity}</strong> vé
                    </span>
                  </div>
                )}

                {/* Giá */}
                <div className="flex items-center gap-2">
                  {ticket.originalPrice && ticket.originalPrice > ticket.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(ticket.originalPrice)}
                    </span>
                  )}
                  <span className="text-xl font-bold text-red-600">
                    {formatCurrency(ticket.price)}
                  </span>
                </div>

                {/* Quantity Selector */}
                {!isSoldOut && (
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-3">
                      {/* Minus Button */}
                      <Button
                        type="default"
                        shape="circle"
                        icon={<MinusOutlined />}
                        disabled={currentQty === 0}
                        onClick={() => handleDecrease(ticket)}
                        size="large"
                      />
                      
                      {/* Quantity Display */}
                      <div 
                        className="text-2xl font-bold text-gray-900 w-12 text-center"
                        style={{ fontFamily: 'monospace' }}
                      >
                        {currentQty}
                      </div>
                      
                      {/* Plus Button */}
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        disabled={isMaxed}
                        onClick={() => handleIncrease(ticket)}
                        size="large"
                      />
                    </div>

                    {/* Subtotal */}
                    {currentQty > 0 && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Tạm tính</div>
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(ticket.price * currentQty)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sold Out Message */}
                {isSoldOut && (
                  <div className="text-center py-2 text-gray-500 text-sm">
                    Loại vé này đã hết
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Checkout Summary */}
      {totalTicketsSelected > 0 && (
        <Card className="bg-gray-50 border-2 border-blue-400 shadow-lg">
          <div className="space-y-4">
            {/* Tổng số vé */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Tổng số vé:</span>
              <span className="text-xl font-bold text-gray-900">
                {totalTicketsSelected} vé
              </span>
            </div>

            {/* Tổng tiền */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-gray-300">
              <span className="text-gray-900 font-semibold text-lg">Tổng tiền:</span>
              <span className="text-2xl font-bold text-red-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {/* Checkout Button */}
            <Button
              type="primary"
              size="large"
              block
              icon={<ShoppingCartOutlined />}
              onClick={handleCheckoutClick}
              className="font-semibold text-lg h-12"
            >
              Thanh toán ngay
            </Button>

            {/* Info text */}
            <div className="text-xs text-gray-500 text-center">
              Bạn sẽ được chuyển đến trang thanh toán
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
