'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import { axiosClient } from '@/lib/axios-client';

/**
 * Google Identity Services - Type Definitions
 */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface CredentialResponse {
  credential: string;
  select_by?: string;
}

interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string | number;
}

/**
 * Google Login Button Props
 */
interface GoogleLoginBtnProps {
  text?: string;
  fullWidth?: boolean;
  onSuccess?: () => void;
}

/**
 * Google Login Button Component
 * 
 * Uses Google Identity Services (GIS) to get JWT Credential
 * 
 * Why GIS instead of OAuth2 Popup:
 * - OAuth2 implicit flow doesn't guarantee id_token
 * - GIS always returns JWT credential (ID Token)
 * - Backend requires ID Token for GoogleJsonWebSignature.ValidateAsync
 * 
 * Flow:
 * 1. Load Google Identity Services script
 * 2. Initialize with client_id and callback
 * 3. Render button
 * 4. User clicks → Google popup
 * 5. Google returns CredentialResponse with JWT credential
 * 6. Send credential to Backend
 * 7. Backend validates and returns app tokens
 */
export function GoogleLoginBtn({
  text = 'Đăng nhập với Google',
  fullWidth = true,
  onSuccess,
}: GoogleLoginBtnProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  /**
   * Initialize Google Identity Services
   */
  useEffect(() => {
    // Wait for Google script to load
    if (!window.google || !buttonRef.current) return;

    /**
     * Initialize Google Identity Services
     * 
     * callback: Called when user successfully signs in
     * - response.credential = JWT ID Token
     * - This is exactly what Backend needs!
     */
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    /**
     * Render Sign In Button
     * 
     * Google will render a styled button in buttonRef div
     */
    window.google.accounts.id.renderButton(
      buttonRef.current,
      {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: fullWidth ? buttonRef.current.offsetWidth : undefined,
      }
    );
  }, [fullWidth]);

  /**
   * Handle Google Identity Services Response
   * 
   * response.credential = JWT ID Token
   * Format: "eyJhbGciOiJSUzI1NiIs..."
   * 
   * This is what Backend GoogleAuthService expects!
   */
  const handleGoogleResponse = async (response: CredentialResponse) => {
    try {
      setIsLoading(true);

      console.log('✅ Google Identity Services Success:', {
        hasCredential: !!response.credential,
        credentialLength: response.credential?.length,
        credentialPreview: response.credential?.substring(0, 50) + '...',
      });

      const idToken = response.credential;

      if (!idToken) {
        throw new Error('No credential received from Google');
      }

      console.log('📤 Sending ID Token to Backend:', {
        endpoint: '/auth/google',
        tokenType: 'ID_TOKEN (JWT Credential)',
        tokenLength: idToken.length,
        provider: 1,
      });

      /**
       * Send ID Token to Backend
       * 
       * Backend will:
       * 1. GoogleJsonWebSignature.ValidateAsync(idToken)
       * 2. Verify signature with Google's public key
       * 3. Extract user info from JWT payload
       * 4. Find or create user in database
       * 5. Generate app JWT tokens (accessToken, refreshToken)
       */
      const apiResponse = await axiosClient.post('/auth/google', {
        token: idToken, // ✅ JWT Credential from Google Identity Services
        provider: 1, // Enum: 1 = Google
      });

      console.log('✅ Backend Response:', {
        rawResponse: apiResponse.data,
        responseType: typeof apiResponse.data,
        isString: typeof apiResponse.data === 'string',
        fullResponse: JSON.stringify(apiResponse.data, null, 2),
      });

      /**
       * Backend may return:
       * 1. { accessToken, refreshToken } - object format
       * 2. Direct string token - string format
       * 
       * Handle both cases
       */
      let accessToken: string;
      let refreshToken: string;

      if (typeof apiResponse.data === 'string') {
        // Backend returns raw JWT string (needs parsing)
        // This might be wrapped in quotes, so parse it
        const parsed = typeof apiResponse.data === 'string' 
          ? apiResponse.data.replace(/^"|"$/g, '') // Remove quotes if wrapped
          : apiResponse.data;
        
        console.log('⚠️ Backend returned string, using as accessToken:', parsed.substring(0, 50));
        accessToken = parsed;
        refreshToken = ''; // No refresh token in this format
      } else if (apiResponse.data.accessToken && apiResponse.data.refreshToken) {
        // Standard format
        accessToken = apiResponse.data.accessToken;
        refreshToken = apiResponse.data.refreshToken;
      } else {
        throw new Error('Invalid response format from backend');
      }

      console.log('🟢 Parsed tokens:', {
        accessTokenLength: accessToken?.length,
        refreshTokenLength: refreshToken?.length,
        accessTokenPreview: accessToken?.substring(0, 50) + '...',
      });

      /**
       * Save Tokens to Store
       * 
       * authStore.setTokens() will:
       * 1. Decode JWT to extract user info
       * 2. Save to localStorage (persist)
       * 3. Set isAuthenticated = true
       */
      const setTokens = useAuthStore.getState().setTokens;
      setTokens(accessToken, refreshToken);

      // Get user info from decoded JWT
      const user = useAuthStore.getState().user;

      // Success notification
      toast.success(`Chào mừng, ${user?.fullName || 'bạn'}!`);

      // Callback (if provided)
      if (onSuccess) {
        onSuccess();
      }

      // Redirect based on role
      if (user?.role === 'Admin' || user?.role === 'Organizer') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: unknown) {
      console.error('❌ Google Login Error:', error);

      const err = error as { response?: { data?: any; status?: number } };

      // Show error message from Backend or generic message
      const errorMessage =
        err.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.';

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Google Identity Services Button */}
      <div ref={buttonRef} className={fullWidth ? 'w-full' : ''} />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-10">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
}
