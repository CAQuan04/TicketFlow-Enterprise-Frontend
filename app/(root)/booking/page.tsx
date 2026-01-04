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
  Radio,
  Alert,
  Space
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
  LoadingOutlined,
  BankOutlined,
  CreditCardOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useBookingStore, useAuthStore } from '@/store';
import { orderService, paymentService, walletService } from '@/services/api';
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
  const { items, getTotalAmount, getTotalQuantity, isValidBooking, clearBooking, updateQuantity, removeItem } = useBookingStore();
  const { user, isAuthenticated } = useAuthStore();
  
  // Component state
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'VNPAY'>('WALLET');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
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
   * HYDRATION & AUTHENTICATION CHECK
   * ============================================
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * ============================================
   * REDIRECT IF NOT AUTHENTICATED
   * ============================================
   */
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      router.push('/login?returnUrl=/booking');
    }
  }, [mounted, isAuthenticated, router]);

  /**
   * ============================================
   * REDIRECT IF EMPTY CART
   * ============================================
   */
  useEffect(() => {
    if (mounted && (items.length === 0 || !isValidBooking())) {
      toast.error('Giỏ hàng trống. Vui lòng chọn vé trước.');
      router.push('/events');
    }
  }, [mounted, items, isValidBooking, router]);

  /**
   * ============================================
   * FETCH WALLET BALANCE
   * ============================================
   */

  useEffect(() => {
    const fetchWallet = async () => {
      if (!mounted || !isAuthenticated) return;

      try {
        setLoadingWallet(true);
        const response = await walletService.getMyWallet();
        
        // Backend /wallets/balance có thể trả về:
        // 1. Trực tiếp number: 50000
        // 2. Object: { balance: 50000 }
        // 3. WalletDto: { walletId, userId, balance, ... }
        const balance = typeof response === 'number' 
          ? response 
          : (response as any)?.balance ?? 0;
        
        setWalletBalance(balance);
      } catch (err: any) {
        // Nếu API 404 (chưa có wallet) → set balance 0 (bình thường cho user mới)
        // 404 = User chưa có wallet record trong database, KHÔNG phải vì không có tiền
        // Wallet có balance = 0 vẫn trả về 200 OK
        const status = err?.response?.status;
        
        if (status !== 404) {
          // Chỉ log các lỗi khác 404 (500, 401, network error, etc.)
          console.error('❌ Wallet API error:', status, err?.message);
        }
        
        setWalletBalance(0);
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWallet();
  }, [mounted, isAuthenticated]);

  /**
   * ============================================
   * HANDLE PAYMENT
   * ============================================
   * 
   * FLOW:
   * 1. Validate payment method và số dư ví (nếu dùng Wallet)
   * 2. Create Order với backend (POST /api/order)
   * 3. Nếu payment method = WALLET → gọi payWithWallet API
   * 4. Nếu payment method = VNPAY → redirect đến VNPay URL
   * 5. Clear booking store và redirect đến success page
   * 
   * ERROR HANDLING:
   * - 409 Conflict: Vé đã bán hết (race condition - nhiều người mua cùng lúc)
   * - 400 Bad Request: Vượt quá giới hạn mua vé hoặc số dư không đủ
   * - 500 Server Error: Lỗi hệ thống
   * 
   * RACE CONDITION SCENARIO:
   * - Nếu Order được tạo (status = Pending) nhưng Payment thất bại
   * - User sẽ thấy Order trong "My Orders" với trạng thái "Pending"
   * - User có thể "Retry Payment" từ trang đó
   */
  const handlePayment = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    // Validate wallet balance if using wallet
    if (paymentMethod === 'WALLET') {
      if (walletBalance === null || walletBalance < getTotalAmount()) {
        toast.error('Số dư ví không đủ. Vui lòng chọn phương thức thanh toán khác.');
        return;
      }
    }

    setIsLoading(true);

    try {
      /**
       * ========================================
       * STEP 1: CREATE ORDER (with toast.promise)
       * ========================================
       */
      const orderPayload = {
        eventId: items[0].eventId,
        items: items.map(item => ({  // ✅ Backend expect 'items' (camelCase - viết thường chữ i)
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
        })),
        paymentMethod: paymentMethod === 'WALLET' ? PaymentMethod.Wallet : PaymentMethod.VNPay,
      };
      
      console.log('📦 Creating order with payload:', JSON.stringify(orderPayload, null, 2));
      
      const createOrderPromise = orderService.createOrder(orderPayload);

      const order = await toast.promise(
        createOrderPromise,
        {
          loading: 'Đang tạo đơn hàng...',
          success: 'Đơn hàng đã được tạo thành công! 🎫',
          error: (err) => {
            // 409 Conflict: Vé đã bán hết (race condition)
            if (err.response?.status === 409) {
              return 'Vé đã bán hết! Vui lòng chọn loại vé khác. 😢';
            }
            // 400 Bad Request: Vượt giới hạn hoặc invalid payload
            if (err.response?.status === 400) {
              const errorMsg = err.response?.data?.message || err.response?.data?.title;
              return errorMsg || 'Vượt quá giới hạn mua vé cho sự kiện này.';
            }
            // Generic error
            return 'Không thể tạo đơn hàng. Vui lòng thử lại.';
          },
        }
      );

      // Backend trả về OrderDto, cần extract orderId
      console.log('🔍 Order object received:', order);
      console.log('🔍 Order keys:', order ? Object.keys(order) : 'null');
      
      const orderId = order?.orderId || order?.id;
      if (!orderId) {
        console.error('❌ Cannot find orderId. Order object:', order);
        throw new Error('Order ID not found in response');
      }
      
      console.log('✅ Order created:', orderId);

      /**
       * ========================================
       * STEP 2: PROCESS PAYMENT
       * ========================================
       */
      if (paymentMethod === 'WALLET') {
        // ===== WALLET PAYMENT =====
        const paymentPromise = paymentService.payWithWallet(orderId);

        await toast.promise(
          paymentPromise,
          {
            loading: 'Đang xử lý thanh toán từ ví... 💳',
            success: 'Thanh toán thành công! Vé đã được gửi tới email 🎉',
            error: (err) => {
              // 400/500: Insufficient funds hoặc server error
              if (err.response?.status === 400 || err.response?.status === 500) {
                return 'Số dư ví không đủ hoặc có lỗi xảy ra. Đơn hàng đã được tạo, bạn có thể thanh toán lại sau trong "My Orders".';
              }
              return 'Thanh toán thất bại. Vui lòng thử lại.';
            },
          }
        );

        console.log('✅ Payment successful for order:', orderId);

        /**
         * STEP 3: CLEAR BOOKING & REDIRECT TO MY TICKETS
         */
        clearBooking();

        setTimeout(() => {
          router.push('/my-tickets');
        }, 1000);

      } else {
        // ===== VNPAY PAYMENT =====
        // Redirect đến trang /payment/[id] để user chọn phương thức thanh toán
        // Trang đó sẽ xử lý cả Wallet và VNPay
        console.log('🔀 Redirecting to payment page:', orderId);
        
        // Không clear booking ngay, để user có thể quay lại
        router.push(`/payment/${orderId}`);
      }

    } catch (error: unknown) {
      console.error('❌ Payment error:', error);

      // Parse error message with type guard
      const errorData = error as { response?: { data?: { title?: string; message?: string; errors?: any }; status?: number }; message?: string };
      
      // ============================================
      // 🚨 HIỂN THỊ LỖI BUSINESSRULE LÊN MÀN HÌNH
      // ============================================
      if (errorData.response?.data?.errors) {
        const backendErrors = errorData.response.data.errors;
        
        // 1. Kiểm tra lỗi nghiệp vụ (BusinessRule)
        if (backendErrors.BusinessRule && Array.isArray(backendErrors.BusinessRule)) {
          console.error('🚨 BusinessRule Errors:', backendErrors.BusinessRule);
          
          // Lấy thông báo đầu tiên và hiển thị toast
          const businessRuleMessage = backendErrors.BusinessRule[0];
          toast.error(businessRuleMessage, {
            duration: 5000,
            icon: '🚨',
          });
          
          // Log tất cả lỗi ra console để debug
          backendErrors.BusinessRule.forEach((rule: string, index: number) => {
            console.error(`  ${index + 1}. ${rule}`);
          });
          
          return; // Dừng lại, không hiện modal chung chung
        }
        
        // 2. Kiểm tra các lỗi Validation khác (Ví dụ: Quantity < 0, EventId invalid)
        const firstErrorKey = Object.keys(backendErrors)[0];
        if (firstErrorKey) {
          const firstErrorMessage = Array.isArray(backendErrors[firstErrorKey])
            ? backendErrors[firstErrorKey][0]
            : backendErrors[firstErrorKey];
          
          toast.error(`${firstErrorKey}: ${firstErrorMessage}`, {
            duration: 5000,
          });
          
          console.error(`❌ Validation Error (${firstErrorKey}):`, firstErrorMessage);
          return;
        }
      }
      
      // Log chi tiết để debug (giữ nguyên)
      if (errorData.response?.status === 400) {
        console.error('❌ 400 Bad Request Details:');
        console.error('Status:', errorData.response.status);
        console.error('Title:', errorData.response.data?.title);
        console.error('Message:', errorData.response.data?.message);
        console.error('Errors:', JSON.stringify(errorData.response.data?.errors, null, 2));
        console.error('Full Response:', JSON.stringify(errorData.response.data, null, 2));
      }
      
      const errorMessage = errorData.response?.data?.title || 
                          errorData.response?.data?.message || 
                          errorData.message ||
                          'Đã xảy ra lỗi khi thanh toán';

      // Handle 409 Conflict (sold out) - redirect back to event page
      if (errorData.response?.status === 409 && items[0]?.eventId) {
        toast.error('Vé đã bán hết! Đang chuyển về trang sự kiện...', {
          icon: '😢',
        });
        setTimeout(() => {
          router.push(`/events/${items[0].eventId}`);
        }, 2000);
        return;
      }

      // Specific error cases with modal (giữ nguyên)
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
        // Fallback: Hiện modal chung chung nếu không match case nào
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
   * RENDER LOADING STATE (HYDRATION)
   * ============================================
   */
  if (!mounted || items.length === 0 || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  // Get event info from first item (all items are from same event)
  const eventInfo = items[0];
  const totalAmount = getTotalAmount();
  const totalQuantity = getTotalQuantity();
  
  // Check if wallet has sufficient balance
  const hasInsufficientBalance = walletBalance !== null && walletBalance < totalAmount;

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
            Xác nhận đặt vé
          </h1>
          <div className="text-gray-600">
            Kiểm tra thông tin và hoàn tất thanh toán
          </div>
        </div>

        {/* Main Grid: Left (Customer + Payment) + Right (Order Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* ============================================
              LEFT COLUMN: CUSTOMER INFO + PAYMENT METHOD
              ============================================ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Info Card */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  <span>Thông tin khách hàng</span>
                </div>
              }
              className="shadow-md"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Họ và tên</div>
                    <div className="font-semibold text-gray-900">{user.fullName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <div className="font-semibold text-gray-900">{user.email}</div>
                  </div>
                </div>
                
                <Alert
                  title="Vé điện tử sẽ được gửi đến email của bạn"
                  type="info"
                  showIcon
                  icon={<MailOutlined />}
                />
              </div>
            </Card>

            {/* Payment Method Card */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <CreditCardOutlined />
                  <span>Phương thức thanh toán</span>
                </div>
              }
              className="shadow-md"
            >
              <Radio.Group 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full"
              >
                <Space orientation="vertical" className="w-full" size="middle">
                  {/* Wallet Option */}
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'WALLET' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    } ${hasInsufficientBalance ? 'opacity-60' : ''}`}
                    onClick={() => !hasInsufficientBalance && setPaymentMethod('WALLET')}
                  >
                    <Radio value="WALLET" disabled={hasInsufficientBalance}>
                      <div className="flex items-start gap-3 ml-2">
                        <WalletOutlined className="text-2xl text-blue-600 mt-1" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-base">
                            Ví TicketFlow
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Thanh toán nhanh và an toàn với ví nội bộ
                          </div>
                          {loadingWallet ? (
                            <div className="text-sm text-gray-500 mt-2">
                              <Spin size="small" /> Đang tải số dư...
                            </div>
                          ) : (
                            <div className="mt-2">
                              <div className="text-sm">
                                <span className="text-gray-600">Số dư hiện tại: </span>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(walletBalance || 0)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Radio>
                    
                    {/* Insufficient Balance Warning */}
                    {hasInsufficientBalance && (
                      <Alert
                        title="Số dư không đủ. Vui lòng nạp thêm tiền hoặc chọn phương thức khác."
                        type="error"
                        showIcon
                        className="mt-3 ml-8"
                      />
                    )}
                  </div>

                  {/* VNPay Option */}
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'VNPAY' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setPaymentMethod('VNPAY')}
                  >
                    <Radio value="VNPAY">
                      <div className="flex items-start gap-3 ml-2">
                        <BankOutlined className="text-2xl text-red-600 mt-1" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-base">
                            Cổng thanh toán VNPay
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Thanh toán qua thẻ ATM, thẻ tín dụng, ví điện tử
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Tag color="blue">ATM</Tag>
                            <Tag color="green">Visa/Master</Tag>
                            <Tag color="orange">QR Code</Tag>
                          </div>
                        </div>
                      </div>
                    </Radio>
                  </div>
                </Space>
              </Radio.Group>
            </Card>
          </div>

          {/* ============================================
              RIGHT COLUMN: ORDER SUMMARY (STICKY)
              ============================================ */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Card 
                title={
                  <div className="flex items-center justify-between">
                    <span>Tóm tắt đơn hàng</span>
                    <Tag color="blue">{totalQuantity} vé</Tag>
                  </div>
                }
                className="shadow-md"
              >
                <div className="space-y-4">
                  {/* Event Header */}
                  <div className="flex gap-3 pb-4 border-b">
                    {eventInfo.eventCoverImage && (
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={getImageUrl(eventInfo.eventCoverImage)}
                          alt={eventInfo.eventName}
                          fill
                          className="object-cover"
                          priority
                          unoptimized={process.env.NODE_ENV === 'development'}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2">
                        {eventInfo.eventName}
                      </h3>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <CalendarOutlined />
                          <span className="truncate">
                            {dayjs(eventInfo.eventDate).format('DD/MM/YYYY HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <EnvironmentOutlined />
                          <span className="truncate">{eventInfo.eventVenue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
{/* Items List */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.ticketTypeId} className="border rounded-lg p-3 bg-gray-50">
                        {/* Ticket Name & Price */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {item.ticketTypeName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(item.price)}/vé
                            </div>
                          </div>
                          <div className="font-semibold text-gray-900 ml-2">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              type="default"
                              size="small"
                              icon={<MinusOutlined />}
                              disabled={item.quantity <= 1}
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.ticketTypeId, item.quantity - 1);
                                  toast.success(`Giảm xuống ${item.quantity - 1} vé`);
                                }
                              }}
                            />
                            <span className="font-medium text-gray-900 min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              type="default"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => {
                                updateQuantity(item.ticketTypeId, item.quantity + 1);
                                toast.success(`Tăng lên ${item.quantity + 1} vé`);
                              }}
                            />
                          </div>
                          
                          {/* Delete Button */}
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              removeItem(item.ticketTypeId);
                              toast.success(`Đã xóa ${item.ticketTypeName}`);
                              
                              // Nếu giỏ hàng trống -> redirect về events
                              if (items.length === 1) {
                                setTimeout(() => {
                                  router.push('/events');
                                }, 1000);
                              }
                            }}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <Divider className="my-4 border-t-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">
                      Tổng cộng:
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>

                  {/* Payment Button */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={isLoading ? <LoadingOutlined /> : <CheckCircleOutlined />}
                    onClick={handlePayment}
                    disabled={isLoading || (paymentMethod === 'WALLET' && hasInsufficientBalance)}
                    className="font-semibold text-base h-12 mt-6"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Xác nhận & Thanh toán'}
                  </Button>

                  {/* Terms */}
                  <div className="text-xs text-gray-500 text-center mt-4">
                    Bằng việc nhấn thanh toán, bạn đồng ý với{' '}
                    <a href="/terms" className="text-blue-600 hover:underline">
                      Điều khoản dịch vụ
                    </a>
                  </div>

                  {/* Back Link */}
                  <Button
                    block
                    onClick={handleGoBackToEvent}
                    disabled={isLoading}
                    className="mt-2"
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
                    <span>Thanh toán được bảo mật SSL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-600" />
                    <span>Xác nhận vé ngay lập tức</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-600" />
                    <span>Hỗ trợ khách hàng 24/7</span>
                  </div>
                </div>
              </Card>
            </div>
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
