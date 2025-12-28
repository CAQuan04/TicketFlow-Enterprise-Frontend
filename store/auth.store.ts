import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/services/api';
import { signalRConnection } from '@/lib/signalr-connection';
import type { 
  AuthState, 
  UserInfo, 
  LoginRequest, 
  RegisterRequest,
  JwtPayload,
  AuthResponse 
} from '@/types';

/**
 * Auth Store (Zustand) với JWT Refresh Token Support
 * 
 * Features:
 * - JWT Decode: Extract user info từ accessToken
 * - Persist accessToken & refreshToken vào localStorage
 * - Auto-connect SignalR khi login
 * - Auto-disconnect SignalR khi logout
 * - setTokens(): Được gọi bởi Axios Interceptor khi refresh token thành công
 * 
 * Flow:
 * 1. User login → Backend trả về { accessToken, refreshToken }
 * 2. Decode accessToken → Extract UserInfo (id, email, name, role)
 * 3. Save tokens vào Store (auto-persist to localStorage)
 * 4. Connect SignalR với accessToken
 * 5. Khi API call 401 → Axios Interceptor tự động refresh → gọi setTokens()
 */

/**
 * Helper: Decode JWT và extract UserInfo
 * JWT payload structure từ Backend .NET:
 * {
 *   sub: "user-id",
 *   email: "user@example.com",
 *   name: "Full Name",
 *   role: "Customer",
 *   exp: 1735308000,
 *   iat: 1735221600
 * }
 */
function decodeToken(accessToken: string): UserInfo | null {
  try {
    console.log('🔍 Decoding token:', {
      tokenLength: accessToken?.length,
      tokenPreview: accessToken?.substring(0, 50) + '...',
    });
    
    const decoded = jwtDecode<JwtPayload>(accessToken);
    
    console.log('🔍 Decoded JWT:', {
      decoded,
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      fullName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      givenName: decoded.given_name,
      role: decoded.role,
      allKeys: Object.keys(decoded),
    });
    
    // Backend may use different claim names for fullName
    const fullName = 
      decoded.name || 
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      decoded.given_name ||
      decoded.email?.split('@')[0] || // Fallback: use email username
      'User';
    
    return {
      userId: decoded.sub,
      email: decoded.email,
      fullName: fullName,
      role: decoded.role as any, // Backend trả về string, cast về enum
    };
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserInfo | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void; // ✅ Đổi tên từ setToken
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Login
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true });

          const response = await authService.login(credentials);

          // Decode JWT để lấy user info
          const user = decodeToken(response.accessToken);

          if (!user) {
            throw new Error('Invalid JWT token');
          }

          // Lưu tokens vào store (auto-persist to localStorage)
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Connect SignalR với accessToken mới
          await signalRConnection.connect(response.accessToken);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Register
      register: async (data: RegisterRequest) => {
        try {
          set({ isLoading: true });

          await authService.register(data);

          // Sau khi register thành công, tự động login
          await get().login({
            email: data.email,
            password: data.password,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          // Call logout API
          await authService.logout();
        } catch (error) {
          console.error('Logout API failed:', error);
        } finally {
          // Disconnect SignalR
          await signalRConnection.disconnect();

          // Clear store
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Set user
      setUser: (user: UserInfo | null) => {
        set({ user });
      },

      /**
       * setTokens: Được gọi bởi Axios Interceptor khi refresh token thành công
       * 
       * Flow:
       * 1. API call bị 401
       * 2. Axios Interceptor call /api/Auth/Refresh
       * 3. Backend return { accessToken, refreshToken }
       * 4. Interceptor gọi useAuthStore.getState().setTokens(newAccessToken, newRefreshToken)
       * 5. Store update tokens + decode user info từ new accessToken
       * 6. Axios retry original request với new accessToken
       */
      setTokens: (accessToken: string, refreshToken: string) => {
        console.log('🔵 setTokens called:', {
          accessTokenType: typeof accessToken,
          refreshTokenType: typeof refreshToken,
          accessTokenStringified: JSON.stringify(accessToken),
          refreshTokenStringified: JSON.stringify(refreshToken),
          accessTokenIsString: typeof accessToken === 'string',
          refreshTokenIsString: typeof refreshToken === 'string',
        });
        
        const user = decodeToken(accessToken);

        if (!user) {
          console.error('Failed to decode new access token');
          return;
        }

        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
        });
      },

      // Initialize: Verify token khi app start
      initialize: async () => {
        const { accessToken } = get();

        if (!accessToken) {
          set({ isLoading: false });
          return;
        }

        try {
          set({ isLoading: true });

          // Decode token để lấy user info
          const user = decodeToken(accessToken);

          if (!user) {
            throw new Error('Invalid token');
          }

          // Check token expiration
          const decoded = jwtDecode<JwtPayload>(accessToken);
          const isExpired = decoded.exp * 1000 < Date.now();

          if (isExpired) {
            // Token expired, cần refresh (sẽ được handle bởi Axios Interceptor)
            console.warn('Token expired, will refresh on next API call');
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Connect SignalR
          await signalRConnection.connect(accessToken);
        } catch (error) {
          console.error('Initialize auth failed:', error);
          // Token invalid, clear store
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist những fields cần thiết
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
