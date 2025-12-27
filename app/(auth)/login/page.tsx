'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth.schema';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store';
import { Input } from '@/components/ui/input';
import { GoogleLoginBtn } from '@/components/auth/GoogleLoginBtn';

/**
 * Login Page - Full Implementation
 * 
 * Features:
 * - Google OAuth login (primary method)
 * - Standard email/password login (fallback)
 * - Form validation với Zod schema
 * - Password visibility toggle
 * - API integration với error handling
 * - Loading states
 * - Redirect flow: Success → /
 * 
 * Backend API:
 * 
 * 1. Google OAuth:
 *    POST /auth/google-login
 *    Body: { credential: "google_auth_code" }
 *    Success: 200 { accessToken, refreshToken }
 * 
 * 2. Standard Login:
 *    POST /auth/login
 *    Body: { email, password }
 *    Success: 200 { accessToken, refreshToken }
 *    Error: 400 { message: "Invalid email or password" }
 * 
 * Form Fields:
 * - Email (required, email format)
 * - Password (required, 6+ chars)
 * 
 * Auth Flow:
 * 1. User nhập email + password (hoặc click Google button)
 * 2. Call Backend API
 * 3. Nhận accessToken + refreshToken
 * 4. Save tokens to Zustand store (tự động decode JWT)
 * 5. SignalR connection established
 * 6. Toast "Welcome back, {name}!"
 * 7. Redirect to home page (/)
 */

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // React Hook Form với Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate khi blur ra khỏi field
  });

  /**
   * Submit Handler - Standard Login
   * 
   * Flow:
   * 1. Validate form với Zod
   * 2. Call authStore.login() → gọi Backend API
   * 3. Store tự động decode JWT, save tokens, connect SignalR
   * 4. Toast success → redirect
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);

      // Call Zustand store login (tự động call Backend API + decode JWT + SignalR)
      await login(data);

      // Success toast
      const user = useAuthStore.getState().user;
      toast.success(`Chào mừng trở lại, ${user?.fullName || 'bạn'}!`);

      // Redirect to home
      router.push('/');
    } catch (error: any) {
      // Handle Backend errors
      if (error.response?.status === 400) {
        const message =
          error.response.data?.message || 'Email hoặc mật khẩu không chính xác';

        // Set error vào email field (vì Backend không chỉ rõ field nào sai)
        setError('email', {
          type: 'server',
          message,
        });

        toast.error(message);
      } else if (error.response?.status === 401) {
        toast.error('Email hoặc mật khẩu không chính xác');
      } else {
        // Network error hoặc 500
        toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Google OAuth Success Handler
   * 
   * Flow:
   * 1. User click Google button → OAuth popup
   * 2. User authorize → nhận auth code
   * 3. GoogleLoginButton component call Backend API
   * 4. Backend verify với Google → trả về tokens
   * 5. Save tokens → decode → redirect
   * 
   * Note: Logic này đã được implement trong GoogleLoginButton component
   */

  return (
    <div>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Đăng nhập</h1>
        <p className="mt-2 text-gray-600">Chào mừng bạn trở lại với TicketFlow</p>
      </div>

      {/* Google Login Button */}
      <div className="mb-6">
        <GoogleLoginBtn />
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">Hoặc đăng nhập với email</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            autoComplete="email"
            disabled={isLoading}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
            Ghi nhớ đăng nhập
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              <span>Đăng nhập</span>
            </>
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>

      {/* Help Center */}
      <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Cần trợ giúp?</h3>
            <p className="mt-1 text-sm text-blue-700">
              Liên hệ{' '}
              <Link href="/support" className="font-medium underline">
                bộ phận hỗ trợ
              </Link>{' '}
              nếu bạn gặp vấn đề khi đăng nhập.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

