'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/lib/schemas/auth.schema';
import { getPasswordStrength } from '@/lib/schemas/auth.schema';
import { authService } from '@/services/api';
import { Input } from '@/components/ui/input';

/**
 * Register Page - Full Implementation
 * 
 * Features:
 * - Form validation với Zod schema (matching Backend regex)
 * - Real-time password strength indicator
 * - Password visibility toggle
 * - API integration với error handling
 * - Loading states
 * - Redirect flow: Success → /verify-email?email=...
 * 
 * Backend API:
 * POST /auth/register
 * Body: { email, password, fullName, phoneNumber?, dateOfBirth? }
 * Success: 200 { message: "User registered successfully" }
 * Error: 400 { errors: { Email: ["Email already exists"] } }
 * 
 * Form Fields:
 * - Email (required, email format)
 * - Password (required, 8-32 chars, uppercase, lowercase, digit, special)
 * - Confirm Password (required, must match)
 * - Full Name (required, 2-100 chars)
 * - Phone Number (optional, Vietnamese format)
 * - Date of Birth (optional)
 * 
 * Password Strength:
 * - Weak (score 0-1): Red
 * - Fair (score 2): Yellow
 * - Good (score 3): Blue
 * - Strong (score 4): Green
 */

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // React Hook Form với Zod validation
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur', // Validate khi blur ra khỏi field
  });

  // Watch password để hiển thị strength indicator
  const password = watch('password') || '';
  const passwordStrength = getPasswordStrength(password);

  /**
   * Submit Handler - Register User
   * 
   * Flow:
   * 1. Validate form với Zod
   * 2. Call Backend API POST /auth/register
   * 3. Success: Toast + redirect to /verify-email?email=...
   * 4. Error: Parse Backend errors và set vào field tương ứng
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);

      // Call Backend API
      await authService.register(data);

      // Success: Toast notification
      toast.success('Đăng ký thành công! Vui lòng xác thực email.');

      // Redirect to verify-email page với email query param
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      // Handle Backend validation errors
      if (error.response?.status === 400) {
        const backendErrors = error.response.data?.errors;

        if (backendErrors) {
          // Map Backend errors to form fields
          // Backend trả về: { errors: { Email: ["Email already exists"], Password: [...] } }
          Object.keys(backendErrors).forEach((field) => {
            const fieldName = field.toLowerCase() as keyof RegisterFormData;
            const messages = backendErrors[field];

            if (messages && messages.length > 0) {
              setError(fieldName, {
                type: 'server',
                message: messages[0], // Lấy error message đầu tiên
              });
            }
          });

          toast.error('Vui lòng kiểm tra lại thông tin đăng ký');
        } else {
          // Generic 400 error
          toast.error(error.response.data?.message || 'Đăng ký thất bại');
        }
      } else {
        // Network error hoặc 500
        toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Tạo tài khoản</h1>
        <p className="mt-2 text-gray-600">
          Đăng ký để bắt đầu đặt vé sự kiện yêu thích
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            autoComplete="email"
            disabled={isLoading}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-700">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <Input
            id="fullName"
            type="text"
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            disabled={isLoading}
            error={errors.fullName?.message}
            {...register('fullName')}
          />
        </div>

        {/* Phone Number Field (Optional) */}
        <div>
          <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-gray-700">
            Số điện thoại
          </label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="0912345678"
            autoComplete="tel"
            disabled={isLoading}
            error={errors.phoneNumber?.message}
            {...register('phoneNumber')}
          />
          <p className="mt-1 text-xs text-gray-500">Định dạng: 10 số, bắt đầu bằng 0</p>
        </div>

        {/* Date of Birth Field (Optional) */}
        <div>
          <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-medium text-gray-700">
            Ngày sinh
          </label>
          <Input
            id="dateOfBirth"
            type="date"
            disabled={isLoading}
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-gray-600">Độ mạnh mật khẩu:</span>
                <span className={`font-medium ${passwordStrength.color}`}>
                  {passwordStrength.message}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          <p className="mt-1 text-xs text-gray-500">
            8-32 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
          </p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Xác nhận mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" />
              <span>Đăng ký</span>
            </>
          )}
        </button>
      </form>

      {/* Terms & Privacy */}
      <p className="mt-4 text-center text-xs text-gray-600">
        Bằng việc đăng ký, bạn đồng ý với{' '}
        <Link href="/terms" className="text-blue-600 hover:underline">
          Điều khoản dịch vụ
        </Link>{' '}
        và{' '}
        <Link href="/privacy" className="text-blue-600 hover:underline">
          Chính sách bảo mật
        </Link>
      </p>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
