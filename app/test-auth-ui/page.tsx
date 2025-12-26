'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  loginSchema,
  registerSchema,
  otpSchema,
  type LoginFormData,
  type RegisterFormData,
  type OtpFormData,
  getPasswordStrength,
  validatePasswordBackend,
} from '@/lib/schemas/auth.schema';
import { Input } from '@/components/ui/input';
import { GoogleLoginButton } from '@/components/ui/google-login-button';
import { useAuthStore } from '@/store';

/**
 * Test Page cho Auth UI Components
 * 
 * Trang này demo:
 * 1. Zod validation với react-hook-form
 * 2. Input component với show/hide password
 * 3. Google Login button
 * 4. Toast notifications
 * 5. Password strength checker
 * 
 * Test các scenarios:
 * - Valid form submission
 * - Validation errors
 * - Password strength indicator
 * - Google OAuth flow
 */

export default function TestAuthUIPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'otp'>('login');
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    message: string;
    color: 'red' | 'orange' | 'yellow' | 'lime' | 'green';
  }>({ score: 0, message: '', color: 'red' });
  const { login } = useAuthStore();

  // ============================================================
  // LOGIN FORM
  // ============================================================
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    console.log('Login data:', data);
    
    try {
      toast.loading('Đang đăng nhập...', { id: 'login' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Đăng nhập thành công!', { id: 'login' });
      
      // Nếu test với Backend thật:
      // await login(data);
      
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại', { id: 'login' });
    }
  };

  // ============================================================
  // REGISTER FORM
  // ============================================================
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
    },
  });

  // Watch password field để check strength
  const watchPassword = registerForm.watch('password');

  // Update password strength khi user type
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const strength = getPasswordStrength(password);
    setPasswordStrength(strength);
  };

  const handleRegister = async (data: RegisterFormData) => {
    console.log('Register data:', data);

    // Validate với Backend regex
    const validation = validatePasswordBackend(data.password);
    if (!validation.isValid) {
      toast.error(`Password không hợp lệ: ${validation.errors[0]}`);
      return;
    }

    try {
      toast.loading('Đang đăng ký...', { id: 'register' });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Đăng ký thành công! Vui lòng kiểm tra email.', { id: 'register' });

      // Reset form
      registerForm.reset();
      setPasswordStrength({ score: 0, message: '', color: 'red' });
    } catch (error: any) {
      toast.error(error.message || 'Đăng ký thất bại', { id: 'register' });
    }
  };

  // ============================================================
  // OTP FORM
  // ============================================================
  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const handleOtpSubmit = async (data: OtpFormData) => {
    console.log('OTP data:', data);

    try {
      toast.loading('Đang xác thực...', { id: 'otp' });

      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Xác thực thành công!', { id: 'otp' });

      otpForm.reset();
    } catch (error: any) {
      toast.error(error.message || 'OTP không hợp lệ', { id: 'otp' });
    }
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================
  const handleGoogleSuccess = (data: { accessToken: string; refreshToken: string }) => {
    console.log('Google login success:', data);
    toast.success('Google login thành công!');
    
    // Nếu test với Backend thật:
    // useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
  };

  const handleGoogleError = (error: any) => {
    console.error('Google login error:', error);
    toast.error('Google login thất bại');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            🧪 Auth UI Test Page
          </h1>
          <p className="text-lg text-gray-600">
            Test Form Validation, Zod Schemas & Google OAuth
          </p>
        </div>

        {/* Test Info */}
        <div className="mb-6 rounded-lg bg-blue-100 p-4 text-sm text-blue-900">
          <strong>📋 Test Checklist:</strong>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>✅ Zod validation (email format, password requirements)</li>
            <li>✅ Input component với show/hide password</li>
            <li>✅ Password strength indicator</li>
            <li>✅ Cross-field validation (password === confirmPassword)</li>
            <li>✅ Toast notifications (loading, success, error)</li>
            <li>✅ Google OAuth button (cần config GOOGLE_CLIENT_ID)</li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Forms */}
          <div className="space-y-6">
            {/* Tab Selector */}
            <div className="flex gap-2 rounded-lg bg-white p-2 shadow">
              {(['login', 'register', 'otp'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab === 'login' && 'Login'}
                  {tab === 'register' && 'Register'}
                  {tab === 'otp' && 'OTP Verify'}
                </button>
              ))}
            </div>

            {/* Forms Container */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              {/* LOGIN FORM */}
              {activeTab === 'login' && (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <h2 className="mb-4 text-2xl font-bold">Login Form</h2>

                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    registration={loginForm.register('email')}
                    error={loginForm.formState.errors.email?.message}
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    registration={loginForm.register('password')}
                    error={loginForm.formState.errors.password?.message}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loginForm.formState.isSubmitting}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loginForm.formState.isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-500">Hoặc</span>
                    </div>
                  </div>

                  {/* Google Login */}
                  <GoogleLoginButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                  />
                </form>
              )}

              {/* REGISTER FORM */}
              {activeTab === 'register' && (
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <h2 className="mb-4 text-2xl font-bold">Register Form</h2>

                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    registration={registerForm.register('email')}
                    error={registerForm.formState.errors.email?.message}
                    required
                  />

                  <Input
                    label="Họ và tên"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    registration={registerForm.register('fullName')}
                    error={registerForm.formState.errors.fullName?.message}
                    required
                  />

                  <Input
                    label="Số điện thoại"
                    type="tel"
                    placeholder="0912345678"
                    registration={registerForm.register('phoneNumber')}
                    error={registerForm.formState.errors.phoneNumber?.message}
                    helperText="Số điện thoại Việt Nam (optional)"
                  />

                  <div>
                    <Input
                      label="Mật khẩu"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      registration={registerForm.register('password', {
                        onChange: handlePasswordChange,
                      })}
                      error={registerForm.formState.errors.password?.message}
                      required
                    />

                    {/* Password Strength Indicator */}
                    {watchPassword && (
                      <div className="mt-2">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-gray-600">Độ mạnh mật khẩu:</span>
                          <span
                            className={`font-medium ${
                              passwordStrength.color === 'red'
                                ? 'text-red-600'
                                : passwordStrength.color === 'orange'
                                ? 'text-orange-600'
                                : passwordStrength.color === 'yellow'
                                ? 'text-yellow-600'
                                : passwordStrength.color === 'lime'
                                ? 'text-lime-600'
                                : 'text-green-600'
                            }`}
                          >
                            {passwordStrength.message}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength.color === 'red'
                                ? 'bg-red-500'
                                : passwordStrength.color === 'orange'
                                ? 'bg-orange-500'
                                : passwordStrength.color === 'yellow'
                                ? 'bg-yellow-500'
                                : passwordStrength.color === 'lime'
                                ? 'bg-lime-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Input
                    label="Xác nhận mật khẩu"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    registration={registerForm.register('confirmPassword')}
                    error={registerForm.formState.errors.confirmPassword?.message}
                    required
                  />

                  <button
                    type="submit"
                    disabled={registerForm.formState.isSubmitting}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {registerForm.formState.isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                  </button>
                </form>
              )}

              {/* OTP FORM */}
              {activeTab === 'otp' && (
                <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
                  <h2 className="mb-4 text-2xl font-bold">OTP Verification</h2>

                  <p className="text-sm text-gray-600">
                    Nhập mã OTP 6 số đã được gửi đến email của bạn.
                  </p>

                  <Input
                    label="Mã OTP"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    registration={otpForm.register('otp')}
                    error={otpForm.formState.errors.otp?.message}
                    required
                  />

                  <button
                    type="submit"
                    disabled={otpForm.formState.isSubmitting}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {otpForm.formState.isSubmitting ? 'Đang xác thực...' : 'Xác thực'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Info & Instructions */}
          <div className="space-y-6">
            {/* Test Instructions */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-bold">🧪 Test Instructions</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">1. Test Login Form:</h4>
                  <ul className="ml-4 list-disc space-y-1 text-gray-600">
                    <li>Để trống email → "Email là bắt buộc"</li>
                    <li>Nhập email sai format → "Email không hợp lệ"</li>
                    <li>Để trống password → "Mật khẩu là bắt buộc"</li>
                    <li>Nhập đúng → Submit thành công</li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">2. Test Register Form:</h4>
                  <ul className="ml-4 list-disc space-y-1 text-gray-600">
                    <li>Password &lt; 8 chars → Error</li>
                    <li>Password không có chữ hoa → Error</li>
                    <li>Password không có chữ thường → Error</li>
                    <li>Password không có số → Error</li>
                    <li>Password không có ký tự đặc biệt → Error</li>
                    <li>confirmPassword không khớp → Error</li>
                    <li>Xem password strength indicator thay đổi</li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">3. Test OTP Form:</h4>
                  <ul className="ml-4 list-disc space-y-1 text-gray-600">
                    <li>Nhập &lt; 6 số → Error</li>
                    <li>Nhập chữ → Error</li>
                    <li>Nhập đúng 6 số → Success</li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">4. Test Google Login:</h4>
                  <ul className="ml-4 list-disc space-y-1 text-gray-600">
                    <li>Click "Đăng nhập với Google"</li>
                    <li>Popup Google OAuth (nếu đã config CLIENT_ID)</li>
                    <li>Xem console log cho response data</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-bold">🔐 Password Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-blue-600">✓</span>
                  <span>Tối thiểu 8 ký tự, tối đa 32 ký tự</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-blue-600">✓</span>
                  <span>Ít nhất 1 chữ hoa (A-Z)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-blue-600">✓</span>
                  <span>Ít nhất 1 chữ thường (a-z)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-blue-600">✓</span>
                  <span>Ít nhất 1 số (0-9)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-blue-600">✓</span>
                  <span>Ít nhất 1 ký tự đặc biệt (!@#$%^&*...)</span>
                </li>
              </ul>

              <div className="mt-4 rounded-md bg-green-50 p-3 text-xs text-green-800">
                <strong>Valid example:</strong> MyPass123!
              </div>
            </div>

            {/* Tech Stack */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-bold">🛠️ Tech Stack</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>react-hook-form:</strong> Form state management</li>
                <li><strong>zod:</strong> Schema validation</li>
                <li><strong>@hookform/resolvers:</strong> Zod + RHF integration</li>
                <li><strong>react-hot-toast:</strong> Toast notifications</li>
                <li><strong>@react-oauth/google:</strong> Google OAuth 2.0</li>
                <li><strong>lucide-react:</strong> Icons (Eye, EyeOff)</li>
                <li><strong>tailwind-merge + clsx:</strong> Conditional classes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
