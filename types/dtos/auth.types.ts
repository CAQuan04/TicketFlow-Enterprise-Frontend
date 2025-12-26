/**
 * Authentication DTOs
 * Mapped từ Backend: TicketBooking.Application.Features.Auth
 */

// Login Request/Response
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string; // ISO DateTime từ .NET
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
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
}

// Auth State (cho Zustand Store)
export interface AuthState {
  token: string | null;
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
