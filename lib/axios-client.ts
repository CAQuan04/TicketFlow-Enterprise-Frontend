import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '@/types';
import { useAuthStore } from '@/store';

/**
 * Smart Axios Client với JWT Refresh Token Logic
 * 
 * Features:
 * - Auto-attach JWT token vào mọi request
 * - Auto-refresh khi 401 (token expired)
 * - Queue concurrent requests during refresh
 * - Auto-logout khi refresh token expired
 * 
 * Flow khi 401:
 * 1. Request A bị 401 → Trigger refresh
 * 2. Request B, C cũng bị 401 → Add vào queue (chờ A refresh xong)
 * 3. A call /api/Auth/Refresh với { accessToken, refreshToken }
 * 4. Backend return { accessToken, refreshToken } mới
 * 5. A update Store → Zustand update accessToken
 * 6. A retry request với new token
 * 7. Process queue: B, C retry với new token
 * 8. Nếu refresh fail → Logout user → Redirect /login
 */

class AxiosClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    /**
     * REQUEST INTERCEPTOR
     * Tự động gắn Authorization header với accessToken từ Zustand Store
     */
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const { accessToken } = useAuthStore.getState();
        
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    /**
     * RESPONSE INTERCEPTOR
     * Xử lý 401 với Smart Refresh Token Logic
     */
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Kiểm tra: Lỗi 401 + chưa retry + không phải request /auth/refresh-token
        const isUnauthorized = error.response?.status === 401;
        const isNotRetried = !originalRequest._retry;
        const isNotRefreshEndpoint = !originalRequest.url?.includes('/auth/refresh-token');

        if (isUnauthorized && isNotRetried && isNotRefreshEndpoint) {
          // Nếu đang refresh, add request vào queue
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((accessToken) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                return this.instance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          // Mark request là đã retry
          originalRequest._retry = true;
          this.isRefreshing = true;

          const { accessToken, refreshToken } = useAuthStore.getState();

          if (!refreshToken) {
            // Không có refresh token → Logout ngay
            this.handleLogout();
            return Promise.reject(error);
          }

          try {
            // Gọi API refresh token
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
              {
                accessToken,  // Current access token
                refreshToken, // Current refresh token
              }
            );

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
              response.data.data;

            // Update Store với tokens mới (Zustand sẽ persist to localStorage)
            useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

            // Process queue: Retry tất cả failed requests với new token
            this.processQueue(null, newAccessToken);

            // Retry original request với new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Refresh token failed → Logout user
            this.processQueue(refreshError, null);
            this.handleLogout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  /**
   * Process Queue: Retry tất cả failed requests trong queue
   * @param error - Nếu có error, reject tất cả requests
   * @param token - New access token để retry requests
   */
  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Handle Logout: Clear store + redirect to login
   * Được gọi khi:
   * - Refresh token không tồn tại
   * - Refresh token expired/invalid
   */
  private handleLogout() {
    if (typeof window === 'undefined') return;

    // Clear Zustand store (sẽ tự động clear localStorage)
    useAuthStore.getState().logout();

    // Redirect to login
    window.location.href = '/login';
  }

  private normalizeError(error: AxiosError<ApiErrorResponse>): ApiErrorResponse {
    if (error.response?.data) {
      return error.response.data;
    }

    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
    };
  }

  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

// Export singleton instance
export const axiosClient = new AxiosClient().getAxiosInstance();

// Export types
export type { AxiosError, AxiosResponse } from 'axios';
