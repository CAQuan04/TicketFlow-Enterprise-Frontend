import { axiosClient } from '@/lib/axios-client';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ApiResponse,
} from '@/types';

/**
 * Authentication Service
 * Xử lý tất cả API calls liên quan đến authentication
 */

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  ME: '/auth/me',
};

export const authService = {
  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await axiosClient.post<ApiResponse<LoginResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      data
    );
    return response.data.data!;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await axiosClient.post<ApiResponse<RegisterResponse>>(
      AUTH_ENDPOINTS.REGISTER,
      data
    );
    return response.data.data!;
  },

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await axiosClient.post<ApiResponse<RefreshTokenResponse>>(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      data
    );
    return response.data.data!;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await axiosClient.post(AUTH_ENDPOINTS.LOGOUT);
  },

  /**
   * Get current user info
   */
  async getCurrentUser() {
    const response = await axiosClient.get<ApiResponse<any>>(AUTH_ENDPOINTS.ME);
    return response.data.data!;
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    await axiosClient.post(`${AUTH_ENDPOINTS.VERIFY_EMAIL}?token=${token}`);
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    await axiosClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await axiosClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
      token,
      newPassword,
    });
  },

  /**
   * Change password (authenticated user)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await axiosClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },
};
