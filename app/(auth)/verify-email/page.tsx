'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from 'antd';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { axiosClient } from '@/lib/axios-client';

/**
 * OTP Verification Page - HOÀN CHỈNH
 * 
 * ====================================
 * FLOW DIAGRAM
 * ====================================
 * 
 * 1. User Register
 *    ↓
 * 2. Backend gửi OTP qua email (6 digits)
 *    ↓
 * 3. Redirect to /verify-email?email=user@example.com
 *    ↓
 * 4. User nhập 6 chữ số
 *    ↓
 * 5. Auto-submit khi nhập đủ 6 số
 *    ↓
 * 6. POST /auth/verify { email, otp }
 *    ↓
 * 7. Success → Toast + Redirect to /login
 *    Error → Show error message
 * 
 * ====================================
 * FEATURES
 * ====================================
 * 
 * ✅ Ant Design Input.OTP (6 digits)
 * ✅ Auto-focus first input
 * ✅ Auto-submit when complete
 * ✅ Resend OTP button với countdown (60s)
 * ✅ Loading states
 * ✅ Error handling
 * ✅ Email display từ query params
 * ✅ Back to login link
 * 
 * ====================================
 * BACKEND API
 * ====================================
 * 
 * 1. Verify OTP:
 *    POST /auth/verify
 *    {
 *      "email": "user@example.com",
 *      "otp": "123456"
 *    }
 *    Response: { message: "Email verified successfully" }
 * 
 * 2. Resend OTP:
 *    POST /auth/resend-otp
 *    {
 *      "email": "user@example.com"
 *    }
 *    Response: { message: "OTP sent successfully" }
 * 
 * ====================================
 * TESTING
 * ====================================
 * 
 * Test Case 1: Happy Path
 * 1. Register new account
 * 2. Check email inbox (hoặc console log ở Backend)
 * 3. Nhập 6 chữ số OTP
 * 4. Should auto-submit
 * 5. Toast: "Email verified! Please login."
 * 6. Redirect to /login
 * 
 * Test Case 2: Wrong OTP
 * 1. Nhập OTP sai: "999999"
 * 2. Backend trả về 400: "Invalid or expired OTP"
 * 3. Error message hiển thị
 * 4. OTP input cleared
 * 5. Can enter again
 * 
 * Test Case 3: Resend OTP
 * 1. Click "Resend OTP" button
 * 2. Button disabled, countdown: 59, 58, 57...
 * 3. Backend gửi OTP mới
 * 4. Toast: "OTP sent successfully"
 * 5. After 60s, button enabled lại
 * 
 * Test Case 4: Expired OTP
 * 1. Wait > 5 minutes (Backend OTP expiry)
 * 2. Enter correct OTP
 * 3. Backend: "OTP has expired"
 * 4. Click Resend to get new OTP
 * 
 * ====================================
 * SECURITY NOTES
 * ====================================
 * 
 * 1. OTP Format: 6 digits (000000 - 999999)
 * 2. Expiry: 5 minutes (Backend config)
 * 3. Rate Limiting: Max 5 attempts (Backend)
 * 4. Resend Cooldown: 60 seconds (Frontend + Backend)
 * 5. Email validation: Must match registered email
 */

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  /**
   * Handle OTP Change
   * 
   * Ant Design Input.OTP onChange trả về string value
   * Khi user nhập đủ 6 số → auto-submit
   */
  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(''); // Clear error khi user nhập

    // Auto-submit khi nhập đủ 6 số
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  /**
   * Verify OTP API Call
   * 
   * POST /auth/verify
   * { email, otp }
   * 
   * Success: Toast + redirect to /login
   * Error: Show error message + clear OTP
   */
  const handleVerify = async (otpValue: string) => {
    if (!email) {
      toast.error('Email không hợp lệ');
      return;
    }

    if (otpValue.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      await axiosClient.post('/auth/verify', {
        email,
        otp: otpValue,
      });

      // Success
      toast.success('Email đã được xác thực! Vui lòng đăng nhập.', {
        duration: 4000,
        icon: '✅',
      });

      // Redirect to login sau 1.5s
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: unknown) {
      console.error('❌ Verify OTP Error:', err);

      // Handle Backend errors
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error.response?.status === 400) {
        const message = error.response.data?.message || 'OTP không hợp lệ hoặc đã hết hạn';
        setError(message);
        toast.error(message);
      } else if (error.response?.status === 404) {
        setError('Email không tồn tại trong hệ thống');
        toast.error('Email không tồn tại');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }

      // Clear OTP để user nhập lại
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resend OTP API Call
   * 
   * POST /auth/resend-otp
   * { email }
   * 
   * Success: Start countdown 60s
   * During countdown: Button disabled
   */
  const handleResend = async () => {
    if (!email) {
      toast.error('Email không hợp lệ');
      return;
    }

    if (resendCountdown > 0) {
      return; // Still in cooldown
    }

    try {
      setIsResending(true);

      await axiosClient.post('/auth/resend-otp', {
        email,
      });

      toast.success('OTP mới đã được gửi đến email của bạn');

      // Start countdown
      setResendCountdown(60);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      console.error('❌ Resend OTP Error:', err);

      const error = err as { response?: { status?: number } };
      if (error.response?.status === 429) {
        toast.error('Vui lòng đợi trước khi gửi lại OTP');
      } else {
        toast.error('Không thể gửi lại OTP. Vui lòng thử lại sau.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-2xl shadow-blue-500/10">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <Mail className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Xác thực email</h1>
            <p className="mt-3 text-gray-600">
              Chúng tôi đã gửi mã xác thực đến email:
            </p>
            <p className="mt-2 font-semibold text-blue-600">{email || 'N/A'}</p>
          </div>

          {/* Instructions */}
          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              Vui lòng kiểm tra hộp thư email (bao gồm cả thư mục spam) và nhập mã xác thực 6 số
              để hoàn tất đăng ký.
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="mb-3 block text-center text-sm font-medium text-gray-700">
              Nhập mã OTP
            </label>
            <div className="flex justify-center">
              <Input.OTP
                length={6}
                value={otp}
                onChange={handleOtpChange}
                disabled={isLoading}
                size="large"
                variant="filled"
                style={{
                  display: 'flex',
                  gap: '8px',
                }}
                formatter={(str) => str.toUpperCase()} // Convert to uppercase
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-center">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Đang xác thực...</span>
              </div>
            )}
          </div>

          {/* Resend Button */}
          <div className="mb-6 text-center">
            <p className="mb-2 text-sm text-gray-600">Không nhận được mã?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCountdown > 0 || isResending}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
            >
              {isResending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </span>
              ) : resendCountdown > 0 ? (
                `Gửi lại sau ${resendCountdown}s`
              ) : (
                'Gửi lại mã OTP'
              )}
            </button>
          </div>

          {/* Manual Verify Button (Backup) */}
          <button
            type="button"
            onClick={() => handleVerify(otp)}
            disabled={otp.length !== 6 || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span>Xác thực</span>
              </>
            )}
          </button>

          {/* Back to Login */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại trang đăng nhập
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Nếu bạn gặp vấn đề, vui lòng{' '}
          <Link href="/support" className="font-medium text-blue-600 hover:underline">
            liên hệ hỗ trợ
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

/**
 * Main Page Component với Suspense Boundary
 * 
 * useSearchParams() yêu cầu Suspense boundary
 * để tránh error trong production build
 */
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
