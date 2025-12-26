import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@/services/api';
import { signalRConnection } from '@/lib/signalr-connection';
import type { AuthState, UserInfo, LoginRequest, RegisterRequest } from '@/types';

/**
 * Auth Store (Zustand)
 * Quản lý trạng thái authentication toàn cục
 * 
 * Features:
 * - Persist token & user vào localStorage
 * - Auto-connect SignalR khi login
 * - Auto-disconnect SignalR khi logout
 */

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserInfo | null) => void;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Login
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true });

          const response = await authService.login(credentials);

          // Lưu token vào store
          set({
            token: response.token,
            refreshToken: response.refreshToken,
            user: {
              userId: response.userId,
              email: response.email,
              fullName: response.fullName,
              role: response.role,
            },
            isAuthenticated: true,
            isLoading: false,
          });

          // Connect SignalR với token mới
          await signalRConnection.connect(response.token);
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
            token: null,
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

      // Set token (dùng cho refresh token)
      setToken: (token: string | null, refreshToken?: string | null) => {
        set({
          token,
          refreshToken: refreshToken || get().refreshToken,
          isAuthenticated: !!token,
        });
      },

      // Initialize: Load user từ token khi app start
      initialize: async () => {
        const { token } = get();

        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          set({ isLoading: true });

          // Fetch current user info
          const user = await authService.getCurrentUser();

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Connect SignalR
          await signalRConnection.connect(token);
        } catch (error) {
          console.error('Initialize auth failed:', error);
          // Token invalid, clear store
          set({
            token: null,
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
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
