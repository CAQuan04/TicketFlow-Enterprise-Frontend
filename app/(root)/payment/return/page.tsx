/**
 * ============================================
 * PAYMENT RETURN PAGE (F6.3)
 * ============================================
 * 
 * VNPAY CALLBACK HANDLER
 * 
 * Flow:
 * 1. User thanh toán trên VNPay gateway
 * 2. VNPay redirect về URL này với query params:
 *    /payment/return?vnp_Amount=5000000&vnp_ResponseCode=00&vnp_SecureHash=...
 * 3. Frontend parse params → Verify với Backend
 * 4. Backend kiểm tra vnp_SecureHash (checksum) → Validate transaction
 * 5. Backend update wallet balance → Return result
 * 6. Frontend nhận result:
 *    - rspCode = "00" (Success) → Auto-pay pending order
 *    - rspCode khác → Show error message
 * 
 * VERIFICATION LOOP (Security):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Frontend                  Backend                    VNPay  │
 * ├─────────────────────────────────────────────────────────────┤
 * │ 1. Nhận redirect từ VNPay với query params                  │
 * │ 2. Parse searchParams → Convert to object                   │
 * │ 3. Call Backend: GET /payments/callback?vnp_...             │
 * │                   ↓                                          │
 * │              4. Nhận params từ Frontend                      │
 * │              5. Verify vnp_SecureHash (HMAC-SHA512)         │
 * │              6. Check if hash = expected hash                │
 * │              7. If valid → Update wallet DB                  │
 * │              8. Return { rspCode, message }                  │
 * │                   ↓                                          │
 * │ 9. Nhận result từ Backend                                   │
 * │ 10. If rspCode = "00" → Auto-pay order                      │
 * │ 11. Show SUCCESS/FAILED UI                                  │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * WHY VERIFICATION LOOP?
 * - Prevent URL tampering: User không thể tự sửa query params để fake payment
 * - Backend verify checksum với VNPay secret key (Frontend không có key này)
 * - Chỉ Backend mới có thể verify transaction hợp lệ
 * - Frontend chỉ hiển thị UI based on Backend response (trust Backend, not URL)
 * 
 * NEXT.JS SUSPENSE REQUIREMENT:
 * - useSearchParams() causes client-side de-optimization if not wrapped
 * - Next.js 15 requires Suspense boundary cho dynamic APIs
 * - Suspense fallback sẽ show loading state while params được parse
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Spin, Result, Button } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import toast from 'react-hot-toast';
import { paymentService } from '@/services/api';
import { useBookingStore } from '@/store';

/**
 * Payment verification states
 */
type VerificationStatus = 'VERIFYING' | 'SUCCESS' | 'FAILED';

/**
 * ============================================
 * PAYMENT RETURN CONTENT (Inner Component)
 * ============================================
 * Phải tách ra component riêng để wrap trong Suspense
 */
function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearBooking } = useBookingStore();

  // Component state
  const [status, setStatus] = useState<VerificationStatus>('VERIFYING');
  const [message, setMessage] = useState<string>('');
  const [orderId, setOrderId] = useState<string | null>(null);

  /**
   * ============================================
   * VERIFICATION LOGIC
   * ============================================
   * 
   * Flow:
   * 1. Parse searchParams from VNPay redirect
   * 2. Call Backend to verify vnp_SecureHash
   * 3. If verified (rspCode = "00"):
   *    - Get pendingOrderId from sessionStorage
   *    - Auto-pay order with wallet (vì VNPay deposit đã thành công)
   *    - Clear booking store
   *    - Show SUCCESS state
   * 4. If failed:
   *    - Show FAILED state with error message
   */
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log('🔍 Starting payment verification...');
        
        // Step 1: Parse query params từ VNPay
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          params.append(key, value);
        });

        console.log('📦 Query params from VNPay:', Object.fromEntries(params.entries()));

        // Step 2: Verify với Backend
        setMessage('Đang xác thực thanh toán với VNPay...');
        
        const result = await paymentService.verifyVnPayReturn(params);
        
        console.log('✅ Verification result:', result);

        // Step 3: Handle verification result
        if (result.rspCode === '00') {
          // ========================================
          // SUCCESS: VNPay payment verified
          // ========================================
          
          setMessage('Đang hoàn tất đơn hàng...');

          // Get pending order ID from sessionStorage
          const pendingOrderId = sessionStorage.getItem('pendingOrderId');
          
          console.log('💾 Retrieved pendingOrderId from sessionStorage:', pendingOrderId);

          if (pendingOrderId) {
            try {
              // Auto-pay order với wallet (vì đã nạp tiền thành công)
              console.log('💳 Auto-paying order with wallet...');
              
              await paymentService.payWithWallet(pendingOrderId);
              
              console.log('✅ Order payment successful');

              // Clear sessionStorage
              sessionStorage.removeItem('pendingOrderId');

              // Clear booking store
              clearBooking();

              // Set success state
              setStatus('SUCCESS');
              setMessage('Thanh toán thành công! Vé của bạn đã được gửi qua email.');
              setOrderId(pendingOrderId);

              // Show success toast
              toast.success('Đơn hàng đã được thanh toán! 🎉');

            } catch (payError: unknown) {
              console.error('❌ Auto-pay order failed:', payError);
              
              // Wallet payment failed (có thể do order đã paid, hoặc lỗi khác)
              const errorData = payError as { response?: { data?: { message?: string; title?: string } } };
              const errorMsg = errorData.response?.data?.message || errorData.response?.data?.title;

              if (errorMsg?.includes('already') || errorMsg?.includes('đã')) {
                // Order đã được thanh toán rồi
                setStatus('SUCCESS');
                setMessage('Đơn hàng đã được thanh toán trước đó. Vé của bạn có sẵn trong "Vé của tôi".');
                setOrderId(pendingOrderId);
              } else {
                // Lỗi khác
                setStatus('FAILED');
                setMessage(`Nạp tiền thành công nhưng thanh toán đơn hàng thất bại: ${errorMsg || 'Lỗi không xác định'}. Vui lòng thử lại trong "Đơn hàng của tôi".`);
              }
            }
          } else {
            // Không có pendingOrderId → Chỉ deposit thôi, không có order để pay
            console.warn('⚠️ No pendingOrderId found. This was a pure wallet deposit.');
            
            setStatus('SUCCESS');
            setMessage('Nạp tiền vào ví thành công! Bạn có thể sử dụng ví để thanh toán đơn hàng.');
            
            // Redirect to wallet page sau 3s
            setTimeout(() => {
              router.push('/profile/wallet');
            }, 3000);
          }

        } else {
          // ========================================
          // FAILED: VNPay payment verification failed
          // ========================================
          
          console.error('❌ Payment verification failed:', result);

          setStatus('FAILED');
          setMessage(result.message || 'Thanh toán thất bại. Vui lòng thử lại.');

          // Show error toast
          toast.error(result.message || 'Thanh toán thất bại');
        }

      } catch (error: unknown) {
        console.error('❌ Payment verification error:', error);

        setStatus('FAILED');
        setMessage('Không thể xác thực thanh toán. Vui lòng liên hệ support.');

        toast.error('Lỗi xác thực thanh toán');
      }
    };

    verifyPayment();
  }, [searchParams, router, clearBooking]);

  /**
   * ============================================
   * RENDER UI BASED ON STATUS
   * ============================================
   */

  // ========================================
  // STATE 1: VERIFYING
  // ========================================
  if (status === 'VERIFYING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin 
            size="large" 
            indicator={<LoadingOutlined style={{ fontSize: 64 }} spin />} 
          />
          <p className="mt-6 text-xl font-semibold text-gray-900">
            {message || 'Đang xác thực thanh toán...'}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Vui lòng không đóng trang này
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // STATE 2: SUCCESS
  // ========================================
  if (status === 'SUCCESS') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            status="success"
            title="Thanh toán thành công!"
            subTitle={message}
            extra={[
              <Button
                key="tickets"
                type="primary"
                size="large"
                icon={<SmileOutlined />}
                onClick={() => router.push('/my-tickets')}
              >
                Xem vé của tôi
              </Button>,
              <Button
                key="home"
                size="large"
                onClick={() => router.push('/events')}
              >
                Trang chủ
              </Button>,
            ]}
          />
          
          {orderId && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 text-center">
                Mã đơn hàng: <span className="font-mono font-semibold text-blue-600">{orderId}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================
  // STATE 3: FAILED
  // ========================================
  if (status === 'FAILED') {
    const pendingOrderId = sessionStorage.getItem('pendingOrderId');

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <Result
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            status="error"
            title="Thanh toán thất bại"
            subTitle={message}
            extra={[
              pendingOrderId ? (
                <Button
                  key="retry"
                  type="primary"
                  danger
                  size="large"
                  onClick={() => router.push(`/payment/${pendingOrderId}`)}
                >
                  Thử lại
                </Button>
              ) : (
                <Button
                  key="events"
                  type="primary"
                  size="large"
                  onClick={() => router.push('/events')}
                >
                  Quay lại trang chủ
                </Button>
              ),
              <Button
                key="support"
                size="large"
                onClick={() => router.push('/support')}
              >
                Liên hệ hỗ trợ
              </Button>,
            ]}
          />
        </div>
      </div>
    );
  }

  return null;
}

/**
 * ============================================
 * MAIN PAGE COMPONENT (With Suspense)
 * ============================================
 * 
 * NEXT.JS 15 REQUIREMENT:
 * - useSearchParams() must be wrapped in <Suspense>
 * - Without Suspense → Client-side de-optimization warning
 * - Suspense fallback shows while params are being parsed
 */
export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      }
    >
      <PaymentReturnContent />
    </Suspense>
  );
}
