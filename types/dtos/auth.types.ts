/**
 * Authentication DTOs
 * Mapped từ Backend: TicketBooking.Application.Features.Auth
 */

// Login Request/Response
export interface LoginRequest {
  email: string;
  password: string;
}

// AuthResponse được return từ Backend (cả login và register)
export interface AuthResponse {
  accessToken: string;  // Đổi từ 'token' thành 'accessToken' cho chuẩn
  refreshToken: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string; // ISO DateTime từ .NET
}

// Legacy support (alias)
export type LoginResponse = AuthResponse;

// JWT Payload (được decode từ accessToken)
export interface JwtPayload {
  sub: string;          // User ID
  email: string;
  name: string;         // Full name
  role: string;         // User role
  exp: number;          // Expiration timestamp
  iat: number;          // Issued at timestamp
  jti: string;          // JWT ID
}

// Register Request/Response
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber?: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  message: string;
}

// User Roles (từ Backend Enums)
export enum UserRole {
  Customer = "Customer",
  Organizer = "Organizer",
  Inspector = "Inspector",
  Admin = "Admin"
}

// Token Refresh
export interface RefreshTokenRequest {
  accessToken: string;  // Current access token
  refreshToken: string; // Current refresh token
}

export interface RefreshTokenResponse {
  accessToken: string;  // New access token
  refreshToken: string; // New refresh token
  expiresAt: string;    // New expiration time
}

// Auth State (cho Zustand Store)
export interface AuthState {
  accessToken: string | null;   // Đổi từ 'token' thành 'accessToken'
  refreshToken: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UserInfo {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}
