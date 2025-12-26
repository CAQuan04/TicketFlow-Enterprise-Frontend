'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState } from 'react';

/**
 * Google Login Button Component
 * 
 * Features:
 * - Google OAuth 2.0 login
 * - Call Backend API để verify Google token
 * - Save JWT tokens vào Store
 * - Redirect to home sau khi login thành công
 * 
 * Flow:
 * 1. User click "Login with Google"
 * 2. Google OAuth popup → User chọn account
 * 3. Google return authorization code
 * 4. Component call Backend: POST /api/Auth/GoogleLogin { code }
 * 5. Backend verify với Google → Return JWT tokens
 * 6. Save tokens → Redirect to home
 * 
 * Backend endpoint:
 * POST /api/Auth/GoogleLogin
 * Body: { code: "4/0AbUR2VN..." }
 * Response: { accessToken, refreshToken, userId, email, ... }
 */

interface GoogleLoginButtonProps {
  /**
   * Callback sau khi login thành công
   * Nhận accessToken và refreshToken từ Backend
   */
  onSuccess?: (data: { accessToken: string; refreshToken: string }) => void;

  /**
   * Callback khi có lỗi
   */
  onError?: (error: any) => void;

  /**
   * Custom text cho button
   */
  text?: string;

  /**
   * Custom className
   */
  className?: string;
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  text = 'Đăng nhập với Google',
  className,
}: GoogleLoginButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Google Login Hook
   * flow: 'auth-code' → Nhận authorization code → Gửi cho Backend
   */
  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      try {
        setIsLoading(true);

        // Call Backend API để verify Google code
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: codeResponse.code,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Google login failed');
        }

        const data = await response.json();

        // Extract tokens từ response
        const { accessToken, refreshToken } = data.data;

        // Call onSuccess callback (sẽ save tokens vào Store)
        if (onSuccess) {
          onSuccess({ accessToken, refreshToken });
        }

        toast.success('Đăng nhập thành công!');

        // Redirect to home
        router.push('/');
      } catch (error: any) {
        console.error('Google login error:', error);
        toast.error(error.message || 'Đăng nhập Google thất bại');

        if (onError) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      toast.error('Đăng nhập Google thất bại');

      if (onError) {
        onError(error);
      }
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={isLoading}
      className={
        className ||
        `flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`
      }
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      <span>{isLoading ? 'Đang đăng nhập...' : text}</span>
    </button>
  );
}
