/**
 * ============================================
 * CHECKOUT PAGE
 * ============================================
 * 
 * Trang thanh toán cho đơn đặt vé
 * 
 * Features:
 * - Hiển thị order summary (event info + items)
 * - User info từ Auth Store
 * - Payment với Wallet hoặc VNPay
 * - Error handling chặt chẽ
 * - Loading state để prevent double-click
 * - Auto-redirect nếu giỏ hàng trống
 * 
 * Flow:
 * 1. Check giỏ hàng có items không → Không thì redirect về /events
 * 2. Hiển thị order summary
 * 3. User click "Thanh toán"
 * 4. Tạo order → Pay với wallet
 * 5. Success → Clear booking → Redirect /success
 * 6. Error → Show modal, cho phép quay lại điều chỉnh
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Card, 
  Button, 
  Divider, 
  Tag, 
  Modal, 
  Spin,
  message
} from 'antd';
import {
  ShoppingCartOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  MailOutlined,
  WalletOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useBookingStore, useAuthStore } from '@/store';
import { orderService, paymentService } from '@/services/api';
import { getImageUrl } from '@/lib/utils';
import { PaymentMethod } from '@/types';

dayjs.locale('vi');

/**
 * Format currency
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export default function CheckoutPage() {
  const router = useRouter();
  
  // Store state
  const { items, getTotalAmount, getTotalQuantity, isValidBooking, clearBooking } = useBookingStore();
  const { user } = useAuthStore();
  
  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  /**
   * ============================================
   * REDIRECT IF EMPTY CART
   * ============================================
   */
  useEffect(() => {
    if (items.length === 0 || !isValidBooking()) {
      message.warning('Giỏ hàng trống. Vui lòng chọn vé trước.');
      router.push('/events');
    }
  }, [items, isValidBooking, router]);

  /**
   * Nếu chưa login → Redirect to login
   */
  useEffect(() => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để tiếp tục');
      router.push('/login?redirect=/booking');
    }
  }, [user, router]);

  /**
   * ============================================
   * HANDLE PAYMENT
   * ============================================
   * 
   * Step 1: Create Order
   * Step 2: Pay with Wallet
   * Step 3: Success → Clear booking → Redirect
   */
  const handlePayment = async () => {
    if (!user) {
      message.error('Vui lòng đăng nhập');
      return;
    }

    setIsLoading(true);

    try {
      /**
       * STEP 1: CREATE ORDER
       */
      console.log('📦 Creating order...', {
        eventId: items[0].eventId,
        tickets: items.map(item => ({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
        })),
      });

      const order = await orderService.createOrder({
        eventId: items[0].eventId,
        tickets: items.map(item => ({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
        })),
        paymentMethod: PaymentMethod.Wallet,
      });

      console.log('✅ Order created:', order.orderId);

      /**
       * STEP 2: PAY WITH WALLET
       */
      console.log('💳 Processing payment...');

      const payment = await paymentService.payWithWallet(order.orderId);

      console.log('✅ Payment successful:', payment.paymentId);

      /**
       * STEP 3: SUCCESS
       */
      message.success('Thanh toán thành công!');
      
      // Clear booking
      clearBooking();

      // Redirect to success page
      setTimeout(() => {
        router.push(`/success?orderId=${order.orderId}`);
      }, 500);

    } catch (error: unknown) {
      console.error('❌ Payment error:', error);

      // Parse error message with type guard
      const errorData = error as { response?: { data?: { title?: string; message?: string } }; message?: string };
      const errorMessage = errorData.response?.data?.title || 
                          errorData.response?.data?.message || 
                          errorData.message ||
                          'Đã xảy ra lỗi khi thanh toán';

      // Specific error cases
      if (errorMessage.includes('not enough') || errorMessage.includes('insufficient')) {
        setErrorModal({
          visible: true,
          title: 'Không đủ số lượng vé',
          message: 'Số lượng vé bạn chọn đã hết. Vui lòng quay lại và điều chỉnh số lượng.',
        });
      } else if (errorMessage.includes('limit') || errorMessage.includes('maximum')) {
        setErrorModal({
          visible: true,
          title: 'Vượt quá giới hạn',
          message: 'Bạn đã vượt quá số lượng vé tối đa được phép. Vui lòng điều chỉnh.',
        });
      } else if (errorMessage.includes('balance') || errorMessage.includes('không đủ')) {
        setErrorModal({
          visible: true,
          title: 'Số dư không đủ',
          message: 'Số dư ví của bạn không đủ để thanh toán. Vui lòng nạp thêm tiền.',
        });
      } else {
        setErrorModal({
          visible: true,
          title: 'Lỗi thanh toán',
          message: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle error modal close
   */
  const handleErrorModalClose = () => {
    setErrorModal({ visible: false, title: '', message: '' });
  };

  /**
   * Handle go back to event detail
   */
  const handleGoBackToEvent = () => {
    if (items.length > 0) {
      router.push(`/events/${items[0].eventId}`);
    } else {
      router.push('/events');
    }
  };

  /**
   * ============================================
   * RENDER LOADING
   * ============================================
   */
  if (items.length === 0 || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Get event info from first item (all items are from same event)
  const eventInfo = items[0];
  const totalAmount = getTotalAmount();
  const totalQuantity = getTotalQuantity();

  /**
   * ============================================
   * RENDER PAGE
   * ============================================
   */
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <ShoppingCartOutlined className="mr-3" />
            Thanh toán
          </h1>
          <div className="text-gray-600">
            Hoàn tất đơn hàng của bạn
          </div>
        </div>

        {/* Main Grid: Left (Order Summary) + Right (Payment) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* ============================================
              LEFT COLUMN: ORDER SUMMARY
              ============================================ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Event Info Card */}
            <Card className="shadow-md">
              <div className="flex gap-4">
                {/* Event Image */}
                {eventInfo.eventCoverImage && (
                  <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={getImageUrl(eventInfo.eventCoverImage)}
                      alt={eventInfo.eventName}
                      fill
                      className="object-cover"
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </div>
                )}

                {/* Event Details */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {eventInfo.eventName}
                  </h2>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-blue-600" />
                      <span>{dayjs(eventInfo.eventDate).format('dddd, DD/MM/YYYY HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnvironmentOutlined className="text-red-600" />
                      <span>{eventInfo.eventVenue}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Items List Card */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <ShoppingCartOutlined />
                  <span>Chi tiết đơn hàng</span>
                  <Tag color="blue">{totalQuantity} vé</Tag>
                </div>
              }
              className="shadow-md"
            >
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.ticketTypeId}>
                    {index > 0 && <Divider className="my-4" />}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg">
                          {item.ticketTypeName}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatCurrency(item.price)} x {item.quantity}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <Divider className="my-6 border-t-2" />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Tổng cộng:
                  </span>
                  <span className="text-3xl font-bold text-red-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* ============================================
              RIGHT COLUMN: PAYMENT INFO
              ============================================ */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* User Info Card */}
            <Card 
              title="Thông tin người mua"
              className="shadow-md"
            >
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <UserOutlined className="text-blue-600" />
                  <span className="font-medium">{user.fullName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MailOutlined className="text-blue-600" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
              </div>
            </Card>

            {/* Payment Action Card */}
            <Card 
              title="Phương thức thanh toán"
              className="shadow-md"
            >
              <div className="space-y-4">
                {/* Payment Method */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <WalletOutlined className="text-2xl text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Ví TicketFlow</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Thanh toán nhanh và an toàn
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pay Button */}
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={isLoading ? <LoadingOutlined /> : <CheckCircleOutlined />}
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="font-semibold text-lg h-12"
                >
                  {isLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </Button>

                {/* Info text */}
                <div className="text-xs text-gray-500 text-center space-y-1">
                  <div>Bằng việc nhấn thanh toán, bạn đồng ý với</div>
                  <div>
                    <a href="/terms" className="text-blue-600 hover:underline">
                      Điều khoản dịch vụ
                    </a>
                    {' và '}
                    <a href="/privacy" className="text-blue-600 hover:underline">
                      Chính sách bảo mật
                    </a>
                  </div>
                </div>

                {/* Back button */}
                <Button
                  block
                  onClick={handleGoBackToEvent}
                  disabled={isLoading}
                >
                  Quay lại sự kiện
                </Button>
              </div>
            </Card>

            {/* Trust Badges */}
            <Card className="bg-gray-50 border-0 shadow-sm">
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-600" />
                  <span>Thanh toán được mã hóa SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-600" />
                  <span>Xác nhận ngay lập tức</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-600" />
                  <span>Hỗ trợ 24/7</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <Modal
        open={errorModal.visible}
        onCancel={handleErrorModalClose}
        footer={[
          <Button key="back" onClick={handleGoBackToEvent}>
            Quay lại sự kiện
          </Button>,
          <Button key="close" type="primary" onClick={handleErrorModalClose}>
            Đóng
          </Button>,
        ]}
        centered
      >
        <div className="text-center py-6">
          <ExclamationCircleOutlined 
            className="text-6xl text-orange-500 mb-4" 
          />
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {errorModal.title}
          </h3>
          <p className="text-gray-600">
            {errorModal.message}
          </p>
        </div>
      </Modal>
    </div>
  );
}
