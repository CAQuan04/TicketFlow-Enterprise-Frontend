'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

/**
 * Google OAuth Provider Wrapper
 * 
 * ⚠️ QUAN TRỌNG:
 * - Component này PHẢI wrap toàn bộ app hoặc auth pages
 * - Google Client ID phải match với Backend .NET
 * - Lấy Client ID từ: https://console.cloud.google.com/apis/credentials
 * 
 * Setup:
 * 1. Tạo OAuth 2.0 Client ID trên Google Cloud Console
 * 2. Add Authorized JavaScript origins: http://localhost:3000
 * 3. Add Authorized redirect URIs: http://localhost:3000/login
 * 4. Copy Client ID → .env.local
 * 
 * Usage:
 * Wrap vào layout.tsx hoặc auth pages:
 * 
 * ```tsx
 * export default function AuthLayout({ children }) {
 *   return (
 *     <GoogleAuthProvider>
 *       {children}
 *     </GoogleAuthProvider>
 *   );
 * }
 * ```
 */

interface GoogleAuthProviderProps {
  children: React.ReactNode;
}

export function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error(
      '❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in .env.local'
    );
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
