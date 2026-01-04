/**
 * ============================================
 * PAYMENT SELECTION PAGE (F6.2)
 * ============================================
 * 
 * Flow:
 * 1. User tạo Order thành công (status = Pending)
 * 2. Redirect đến trang này: /payment/{orderId}
 * 3. Hiển thị 2 payment options:
 *    - Option A: TicketFlow Wallet (nhanh, không fee)
 *    - Option B: VNPay Gateway (ATM/QR/Banking app)
 * 4. Wallet Check:
 *    - Đủ tiền → "Pay Now" button
 *    - Không đủ → Warning + "Top-up via VNPay" button
 * 5. Payment handlers:
 *    - Wallet: Gọi API payWithWallet → Success → /my-tickets
 *    - VNPay: Save orderId → createDepositLink → Redirect VNPay URL
 * 6. Validation:
 *    - Nếu order.status = 'Paid' → Redirect /my-tickets
 *    - Countdown: Order expires in 10 minutes
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Spin, Alert, Tag, Divider } from 'antd';
import {
  WalletOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { orderService, walletService, paymentService } from '@/services/api';
import { OrderDto } from '@/types';

dayjs.extend(duration);

/**
 * Format currency VND
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export default function PaymentSelectionPage() {
  const params = useParams();
  const router = useRouter();
  
  // Extract orderId from params
  const orderId = params?.id as string;
  
  // Component state
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>('');

  /**
   * ============================================
   * FETCH ORDER & WALLET DATA (Parallel)
   * ============================================
   */
  useEffect(() => {
    if (!orderId) {
      toast.error('Order ID không hợp lệ');
      router.push('/events');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch order and wallet in parallel
        const [orderData, walletData] = await Promise.all([
          orderService.getOrderById(orderId),
          walletService.getMyWallet().catch(() => ({ balance: 0 })), // Fallback nếu chưa có wallet
        ]);

        console.log('✅ Order fetched:', orderData);
        console.log('✅ Wallet balance:', walletData);

        // Validate order data
        if (!orderData || typeof orderData !== 'object') {
          throw new Error('Invalid order data received');
        }

        setOrder(orderData);
        
        // Handle wallet response (có thể là number hoặc object)
        const balance = typeof walletData === 'number' 
          ? walletData 
          : (walletData as { balance?: number })?.balance ?? 0;
        setWalletBalance(balance);

        // Validation: Nếu order đã paid → redirect
        if (orderData.status === 'Completed' || orderData.paymentStatus === 'Completed') {
          toast.success('Đơn hàng đã được thanh toán!');
          setTimeout(() => {
            router.push('/my-tickets');
          }, 1500);
          return;
        }

        // Validation: Nếu order cancelled hoặc expired
        if (orderData.status === 'Cancelled' || orderData.status === 'Expired') {
          toast.error('Đơn hàng đã bị hủy hoặc hết hạn');
          setTimeout(() => {
            router.push('/events');
          }, 2000);
          return;
        }

      } catch (error: unknown) {
        console.error('❌ Failed to fetch data:', error);
        
        // Log chi tiết hơn để debug
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          console.error('❌ API Error Details:', {
            status: axiosError.response?.status,
            data: axiosError.response?.data,
            message: axiosError.message,
          });
        }
        
        toast.error('Không thể tải thông tin đơn hàng');
        setTimeout(() => {
          router.push('/events');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, router]);

  /**
   * ============================================
   * COUNTDOWN TIMER (Order expiration)
   * ============================================
   * Order expires after 10 minutes from createdAt
   */
  useEffect(() => {
    if (!order) return;

    const interval = setInterval(() => {
      const expiresAt = dayjs(order.createdAt).add(10, 'minute');
      const now = dayjs();
      const diff = expiresAt.diff(now);

      if (diff <= 0) {
        setTimeLeft('Đã hết hạn');
        clearInterval(interval);
        toast.error('Đơn hàng đã hết hạn thanh toán');
        setTimeout(() => {
          router.push('/events');
        }, 2000);
      } else {
        const duration = dayjs.duration(diff);
        const minutes = Math.floor(duration.asMinutes());
        const seconds = duration.seconds();
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order, router]);

  /**
   * ============================================
   * HANDLE WALLET PAYMENT
   * ============================================
   * 
   * Flow:
   * 1. Show loading overlay
   * 2. Call API: orderService.payWithWallet(orderId)
   * 3. Success → Redirect to /my-tickets
   * 4. Error → Show toast error
   */
  const handleWalletPayment = async () => {
    if (!order) return;

    setProcessing(true);

    try {
      const paymentPromise = paymentService.payWithWallet(orderId);

      await toast.promise(
        paymentPromise,
        {
          loading: 'Đang xử lý thanh toán từ ví... 💳',
          success: 'Thanh toán thành công! 🎉',
          error: (err: unknown) => {
            const errorData = err as { response?: { data?: { message?: string; title?: string } } };
            const errorMsg = errorData.response?.data?.message || errorData.response?.data?.title;
            return errorMsg || 'Thanh toán thất bại. Vui lòng thử lại.';
          },
        }
      );

      console.log('✅ Wallet payment successful');

      // Redirect to my tickets page
      setTimeout(() => {
        router.push('/my-tickets');
      }, 1000);

    } catch (error: unknown) {
      console.error('❌ Wallet payment failed:', error);
      // Toast đã hiển thị error từ toast.promise
    } finally {
      setProcessing(false);
    }
  };

  /**
   * ============================================
   * HANDLE VNPAY PAYMENT
   * ============================================
   * 
   * Flow:
   * 1. Show loading overlay "Redirecting to Payment Gateway..."
   * 2. CRITICAL: Save orderId to sessionStorage
   *    → Khi user quay lại từ VNPay, callback page sẽ dùng orderId này
   * 3. Call API: paymentService.createDepositLink(order.totalAmount)
   * 4. Redirect: window.location.href = vnpayUrl
   * 
   * NOTE: VNPay flow hiện tại là DEPOSIT (nạp tiền vào ví)
   * Nếu backend có endpoint riêng cho order payment, cần update
   */
  const handleVnPayPayment = async () => {
    if (!order) return;

    setProcessing(true);

    try {
      toast.loading('Đang chuyển đến cổng thanh toán VNPay... 🏦', { duration: 3000 });

      // CRITICAL: Save orderId to sessionStorage
      // Callback page sẽ dùng để tự động thanh toán order sau khi nạp tiền thành công
      sessionStorage.setItem('pendingOrderId', orderId);
      
      console.log('💾 Saved pendingOrderId to sessionStorage:', orderId);

      // Call API to get VNPay URL
      const vnpayUrl = await paymentService.createDepositLink(order.totalAmount);
      
      console.log('✅ VNPay URL received:', vnpayUrl);

      // Redirect to VNPay gateway
      setTimeout(() => {
        window.location.href = vnpayUrl;
      }, 1000);

    } catch (error: unknown) {
      console.error('❌ VNPay redirect failed:', error);
      toast.error('Không thể kết nối đến VNPay. Vui lòng thử lại.');
      setProcessing(false);
    }
  };

  /**
   * ============================================
   * LOADING STATE
   * ============================================
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <p className="mt-4 text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  /**
   * ============================================
   * ERROR STATE (No order data)
   * ============================================
   */
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert
          title="Không tìm thấy đơn hàng"
          description="Vui lòng kiểm tra lại hoặc liên hệ support."
          type="error"
          showIcon
        />
      </div>
    );
  }

  /**
   * ============================================
   * CALCULATE WALLET STATUS
   * ============================================
   */
  const isWalletSufficient = walletBalance >= order.totalAmount;
  const walletDifference = order.totalAmount - walletBalance;

  /**
   * ============================================
   * RENDER PAYMENT SELECTION UI
   * ============================================
   */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chọn phương thức thanh toán
          </h1>
          <p className="text-gray-600">
            Hoàn tất thanh toán để nhận vé của bạn
          </p>
        </div>

        {/* Order Expiration Warning */}
        {timeLeft && timeLeft !== 'Đã hết hạn' && (
          <Alert
            title={
              <div className="flex items-center justify-center gap-2">
                <ClockCircleOutlined />
                <span>Đơn hàng sẽ hết hạn sau: <strong>{timeLeft}</strong></span>
              </div>
            }
            type="warning"
            showIcon={false}
            className="mb-6"
          />
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: Payment Options */}
          <div className="lg:col-span-2 space-y-4">
            {/* ========================================
                OPTION A: TICKETFLOW WALLET
                ======================================== */}
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isWalletSufficient ? 'border-2 border-green-500' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <WalletOutlined className="text-2xl text-blue-600" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      Ví TicketFlow
                    </h3>
                    {isWalletSufficient && (
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Được khuyên dùng
                      </Tag>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    Số dư hiện tại: <strong className="text-blue-600">{formatCurrency(walletBalance)}</strong>
                  </p>

                  {/* Case 1: Đủ tiền */}
                  {isWalletSufficient ? (
                    <>
                      <Alert
                        title="Số dư đủ để thanh toán đơn hàng này"
                        type="success"
                        showIcon
                        className="mb-3"
                      />
                      <Button
                        type="primary"
                        size="large"
                        block
                        icon={<CheckCircleOutlined />}
                        onClick={handleWalletPayment}
                        loading={processing}
                        disabled={processing}
                      >
                        Thanh toán ngay
                      </Button>
                    </>
                  ) : (
                    /* Case 2: Không đủ tiền */
                    <>
                      <Alert
                        title={
                          <>
                            Số dư không đủ (Thiếu <strong>{formatCurrency(walletDifference)}</strong>)
                          </>
                        }
                        type="error"
                        showIcon
                        icon={<WarningOutlined />}
                        className="mb-3"
                      />
                      <Button
                        size="large"
                        block
                        disabled
                        className="opacity-50"
                      >
                        Không đủ số dư
                      </Button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Vui lòng nạp tiền qua VNPay bên dưới
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Card>

            <Divider>hoặc</Divider>

            {/* ========================================
                OPTION B: VNPAY GATEWAY
                ======================================== */}
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <CreditCardOutlined className="text-2xl text-orange-600" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Cổng thanh toán VNPay
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    Thanh toán qua ATM, QR Code, Mobile Banking
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Tag>ATM Card</Tag>
                    <Tag>QR Pay</Tag>
                    <Tag>Mobile Banking</Tag>
                    <Tag>Visa/Master</Tag>
                  </div>

                  <Button
                    type="default"
                    size="large"
                    block
                    icon={<CreditCardOutlined />}
                    onClick={handleVnPayPayment}
                    loading={processing}
                    disabled={processing}
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    Thanh toán với VNPay
                  </Button>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Bạn sẽ được chuyển đến cổng thanh toán VNPay
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-1">
            <Card title="Thông tin đơn hàng" className="sticky top-24">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sự kiện</p>
                  <p className="font-medium text-gray-900">{order.eventTitle}</p>
                </div>

                <Divider className="my-3" />

                <div>
                  <p className="text-xs text-gray-500 mb-1">Mã đơn hàng</p>
                  <p className="font-mono text-sm text-gray-900">{order.orderNumber}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                  <Tag color="orange">{order.status}</Tag>
                </div>

                <Divider className="my-3" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tổng tiền:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                {/* Security badges */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircleOutlined className="text-green-500" />
                    <span>Thanh toán được bảo mật SSL</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircleOutlined className="text-green-500" />
                    <span>Xác nhận vé ngay lập tức</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircleOutlined className="text-green-500" />
                    <span>Hỗ trợ khách hàng 24/7</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
