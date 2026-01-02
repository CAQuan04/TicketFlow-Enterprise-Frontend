/**
 * ============================================
 * SUCCESS PAGE
 * ============================================
 * 
 * Trang hiển thị sau khi thanh toán thành công
 * 
 * Features:
 * - Success animation/icon
 * - Order confirmation
 * - Email notification message
 * - Navigation buttons (My Tickets, Home)
 * - Confetti effect (optional)
 * 
 * Query params:
 * - orderId: ID của order vừa tạo
 */

'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Result } from 'antd';
import {
  CheckCircleOutlined,
  HomeOutlined,
  FileTextOutlined,
  MailOutlined,
} from '@ant-design/icons';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

/**
 * Success Content Component
 */
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { width, height } = useWindowSize();

  /**
   * Show confetti for 5 seconds
   */
  const [showConfetti, setShowConfetti] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      {/* Success Card */}
      <Card className="max-w-2xl w-full shadow-2xl">
        <Result
          status="success"
          icon={
            <div className="animate-bounce">
              <CheckCircleOutlined 
                className="text-green-500" 
                style={{ fontSize: 100 }}
              />
            </div>
          }
          title={
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">
                Thanh toán thành công!
              </div>
              <div className="text-lg text-gray-600 font-normal">
                Cảm ơn bạn đã đặt vé với TicketFlow
              </div>
            </div>
          }
          subTitle={
            <div className="space-y-4 mt-6">
              {orderId && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Mã đơn hàng:</div>
                  <div className="font-mono text-lg font-semibold text-gray-900">
                    {orderId}
                  </div>
                </div>
              )}

              {/* Email Notification */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MailOutlined className="text-2xl text-blue-600 mt-1" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 mb-1">
                      Kiểm tra email của bạn
                    </div>
                    <div className="text-sm text-gray-600">
                      Chúng tôi đã gửi xác nhận đơn hàng và vé điện tử đến email của bạn. 
                      Vui lòng kiểm tra hộp thư đến (hoặc spam) để xem chi tiết.
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left">
                <div className="font-semibold text-gray-900 mb-2">
                  📋 Tiếp theo bạn cần:
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Kiểm tra email xác nhận và vé điện tử</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Lưu vé hoặc in ra để sử dụng khi tham gia sự kiện</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Mang theo CMND/CCCD khi đến địa điểm sự kiện</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Đến trước giờ diễn ra sự kiện 30-60 phút</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button
                  type="primary"
                  size="large"
                  icon={<FileTextOutlined />}
                  onClick={() => router.push('/my-tickets')}
                  className="flex-1 h-12 font-semibold"
                >
                  Xem vé của tôi
                </Button>
                <Button
                  size="large"
                  icon={<HomeOutlined />}
                  onClick={() => router.push('/')}
                  className="flex-1 h-12 font-semibold"
                >
                  Về trang chủ
                </Button>
              </div>

              {/* Support Info */}
              <div className="text-center text-sm text-gray-500 mt-6 pt-6 border-t">
                Có thắc mắc? Liên hệ{' '}
                <a href="mailto:support@ticketflow.com" className="text-blue-600 hover:underline">
                  support@ticketflow.com
                </a>
                {' '}hoặc hotline{' '}
                <a href="tel:1900123456" className="text-blue-600 hover:underline">
                  1900 123 456
                </a>
              </div>
            </div>
          }
        />
      </Card>
    </div>
  );
}

/**
 * Main Success Page with Suspense
 */
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-2xl">
          <Result
            status="success"
            title="Đang tải..."
          />
        </Card>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
