'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import { axiosClient } from '@/lib/axios-client';

/**
 * Google Login Button Component
 * 
 * ====================================
 * ARCHITECTURE & SECURITY EXPLANATION
 * ====================================
 * 
 * 1. IMPLICIT FLOW vs AUTHORIZATION CODE FLOW:
 * 
 *    Implicit Flow (flow: 'implicit'):
 *    ✅ Trực tiếp nhận ID Token từ Google
 *    ✅ Frontend có thể decode để hiển thị user info ngay
 *    ❌ Access Token exposed trên URL hash
 *    ❌ Không có Refresh Token
 * 
 *    Authorization Code Flow (flow: 'auth-code'):
 *    ✅ Nhận auth code → Backend exchange với Google
 *    ✅ Backend lưu Access Token + Refresh Token (secure)
 *    ✅ Best practice cho OAuth 2.0
 *    ❌ Cần thêm 1 network round-trip
 * 
 *    → Chúng ta dùng IMPLICIT để đơn giản, vì:
 *       - Token chỉ dùng 1 lần để verify
 *       - Backend tự generate JWT tokens của riêng mình
 * 
 * 2. ID TOKEN vs ACCESS TOKEN:
 * 
 *    ID Token (JWT):
 *    {
 *      "iss": "accounts.google.com",
 *      "sub": "google-user-id-123",
 *      "email": "user@gmail.com",
 *      "name": "John Doe",
 *      "picture": "https://...",
 *      "aud": "YOUR_CLIENT_ID",
 *      "exp": 1735308000
 *    }
 *    → Backend verify signature với Google's public key
 *    → Extract user info an toàn
 * 
 *    Access Token (Opaque String):
 *    "ya29.a0AfH6SMBx..."
 *    → Chỉ dùng để call Google APIs (Gmail, Drive, etc.)
 *    → Backend không thể verify được
 * 
 * 3. BACKEND VALIDATION FLOW:
 * 
 *    POST /auth/google
 *    {
 *      "token": "eyJhbGciOiJSUzI1NiIs...",  // ID Token
 *      "provider": 1                         // Enum: Google = 1
 *    }
 * 
 *    Backend .NET:
 *    1. GoogleJsonWebSignature.ValidateAsync(token)
 *    2. Check issuer = "accounts.google.com"
 *    3. Check audience = YOUR_CLIENT_ID
 *    4. Check expiry
 *    5. Extract email, name, picture
 *    6. Find or create user in database
 *    7. Generate JWT tokens (accessToken, refreshToken)
 *    8. Return { accessToken, refreshToken }
 * 
 * ====================================
 * USAGE
 * ====================================
 * 
 * Import vào Login Page:
 * 
 * ```tsx
 * import { GoogleLoginBtn } from '@/components/auth/GoogleLoginBtn';
 * 
 * export default function LoginPage() {
 *   return (
 *     <div>
 *       <GoogleLoginBtn />
 *       <p>Hoặc đăng nhập với email</p>
 *       <form>...</form>
 *     </div>
 *   );
 * }
 * ```
 * 
 * ====================================
 * ERROR HANDLING
 * ====================================
 * 
 * - User closes popup → Silent fail (không hiển thị error)
 * - Network error → Toast: "Có lỗi xảy ra"
 * - Backend error → Toast: "Đăng nhập Google thất bại"
 * - Invalid token → Backend trả về 400/401
 * 
 * ====================================
 * TESTING
 * ====================================
 * 
 * 1. Setup Google OAuth:
 *    - Google Cloud Console → APIs & Services → Credentials
 *    - Create OAuth 2.0 Client ID
 *    - Authorized JavaScript origins: http://localhost:3000
 *    - Copy Client ID → .env.local
 * 
 * 2. Test Flow:
 *    - Click button → Popup opens
 *    - Select Google account
 *    - Authorize → Popup closes
 *    - Check console: "ID Token:", "Backend response:"
 *    - Should redirect to home page
 *    - Check localStorage: accessToken, refreshToken
 * 
 * 3. Test Errors:
 *    - Close popup immediately → No error shown
 *    - Turn off Backend → Toast error
 *    - Invalid Client ID → OAuth error
 */

interface GoogleLoginBtnProps {
  /**
   * Custom text for button
   * Default: "Đăng nhập với Google"
   */
  text?: string;

  /**
   * Full width button
   * Default: true
   */
  fullWidth?: boolean;

  /**
   * Callback on success (optional)
   */
  onSuccess?: () => void;
}

export function GoogleLoginBtn({
  text = 'Đăng nhập với Google',
  fullWidth = true,
  onSuccess,
}: GoogleLoginBtnProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Google OAuth Login Hook
   * 
   * Flow: implicit (nhận ID Token trực tiếp)
   * Scope: openid email profile (default)
   * 
   * onSuccess: Nhận tokenResponse chứa:
   * - access_token: Google Access Token (dùng để call Google APIs)
   * - id_token: JWT chứa user info (GỬI CÁI NÀY CHO BACKEND)
   * - expires_in: Token expiry (seconds)
   * - scope: Permissions được granted
   * - token_type: "Bearer"
   */
  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);

        console.log('✅ Google OAuth Success:', {
          hasAccessToken: !!tokenResponse.access_token,
          expiresIn: tokenResponse.expires_in,
          scope: tokenResponse.scope,
        });

        // ⚠️ CRITICAL: Check if we have access_token
        // Note: With implicit flow, we might not get id_token directly
        // We need to use access_token to fetch user info from Google
        if (!tokenResponse.access_token) {
          throw new Error('No access token received from Google');
        }

        /**
         * Backend API Call
         * 
         * Endpoint: POST /auth/google
         * Payload: { token, provider }
         * 
         * Backend sẽ:
         * 1. Dùng access_token để call Google UserInfo API
         * 2. Lấy email, name, picture
         * 3. Find or create user
         * 4. Generate JWT tokens
         */
        const response = await axiosClient.post<{
          accessToken: string;
          refreshToken: string;
        }>('/auth/google', {
          token: tokenResponse.access_token, // Gửi access_token
          provider: 1, // Enum: 1 = Google
        });

        console.log('✅ Backend Response:', {
          hasAccessToken: !!response.data.accessToken,
          hasRefreshToken: !!response.data.refreshToken,
        });

        /**
         * Save Tokens to Store
         * 
         * authStore.login() sẽ:
         * 1. Call Backend API để verify credentials (nhưng ở đây ta đã có tokens rồi)
         * 2. Decode JWT để extract user info
         * 3. Save vào localStorage (persist)
         * 4. Connect SignalR
         * 
         * → Vì ta đã có tokens, ta dùng setTokens() trực tiếp
         */
        const setTokens = useAuthStore.getState().setTokens;
        setTokens(response.data.accessToken, response.data.refreshToken);

        // Get user info from decoded JWT
        const user = useAuthStore.getState().user;

        // Success notification
        toast.success(`Chào mừng, ${user?.fullName || 'bạn'}!`);

        // Callback (if provided)
        if (onSuccess) {
          onSuccess();
        }

        // Redirect to home
        router.push('/');
      } catch (error: any) {
        console.error('❌ Google Login Error:', error);

        // Handle specific error types
        if (error.response?.status === 400) {
          toast.error('Token Google không hợp lệ');
        } else if (error.response?.status === 401) {
          toast.error('Không thể xác thực tài khoản Google');
        } else {
          toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
        }
      } finally {
        setIsLoading(false);
      }
    },

    /**
     * onError: User đóng popup hoặc OAuth failed
     * 
     * Không hiển thị error vì user có thể:
     * - Đóng popup cố ý (không phải lỗi)
     * - Chọn account khác
     * - Quay lại để dùng email/password
     */
    onError: (errorResponse) => {
      console.log('⚠️ Google OAuth Error:', errorResponse);
      // Silent fail - user might have closed popup intentionally
      setIsLoading(false);
    },

    /**
     * onNonOAuthError: Network errors, SDK errors
     */
    onNonOAuthError: (nonOAuthError) => {
      console.error('❌ Google OAuth Non-OAuth Error:', nonOAuthError);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
      setIsLoading(false);
    },
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-white px-4 py-3
        font-medium text-gray-700 shadow-sm transition-all
        hover:border-gray-400 hover:bg-gray-50 hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-gray-300
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          {/* Google Logo SVG */}
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
          <span>{text}</span>
        </>
      )}
    </button>
  );
}
