import { z } from 'zod';

/**
 * Auth Validation Schemas với Zod
 * 
 * Tại sao dùng Zod thay vì if-else validation?
 * 
 * 1. TYPE SAFETY ✅
 *    - Zod tự động infer TypeScript types từ schema
 *    - Không cần define types riêng
 *    - Type inference: const user = loginSchema.parse(data) → user có type { email: string, password: string }
 * 
 * 2. DECLARATIVE ✅
 *    - Schema rõ ràng, dễ đọc, dễ maintain
 *    - Không cần if-else nested phức tạp
 *    - Example: .min(8) thay vì if (password.length < 8) { throw... }
 * 
 * 3. REUSABLE ✅
 *    - Schema có thể dùng ở nhiều nơi: Frontend validation, Backend validation
 *    - Compose schemas: RegisterSchema extends LoginSchema
 *    - Transform & preprocess data
 * 
 * 4. RICH ERROR MESSAGES ✅
 *    - Custom error messages cho từng rule
 *    - Multi-language support
 *    - Field-specific errors
 * 
 * 5. CROSS-FIELD VALIDATION ✅
 *    - .refine() cho complex validation (password === confirmPassword)
 *    - .superRefine() cho advanced use cases
 * 
 * 6. INTEGRATION ✅
 *    - React Hook Form: @hookform/resolvers/zod
 *    - Backend: Dùng cùng schema với zod-to-json-schema
 *    - API: Validate request body
 * 
 * So sánh:
 * 
 * ❌ Manual Validation:
 *    if (!email) throw "Email required"
 *    if (!email.includes('@')) throw "Invalid email"
 *    if (password.length < 8) throw "Password too short"
 *    if (!/[A-Z]/.test(password)) throw "Need uppercase"
 *    ... 20 more lines
 * 
 * ✅ Zod:
 *    z.object({
 *      email: z.string().email("Invalid email"),
 *      password: z.string().min(8, "Too short").regex(/[A-Z]/, "Need uppercase")
 *    })
 */

// ============================================================
// LOGIN SCHEMA
// ============================================================

/**
 * Login Schema - Đơn giản nhất
 * Chỉ validate format cơ bản, Backend sẽ check credential
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .toLowerCase() // Normalize email thành lowercase
    .trim(),       // Remove whitespace

  password: z
    .string()
    .min(1, 'Mật khẩu là bắt buộc'),
});

// Type inference từ schema
export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================
// REGISTER SCHEMA (STRICT - MATCH BACKEND)
// ============================================================

/**
 * Password Regex Requirements (PHẢI MATCH BACKEND .NET)
 * 
 * Backend Regex: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,32}$
 * 
 * Requirements:
 * - Min 8 characters, Max 32
 * - At least 1 lowercase letter (a-z)
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 digit (0-9)
 * - At least 1 special character (!@#$%^&*...)
 * 
 * Zod Implementation:
 * - Dùng .min(8).max(32) cho length
 * - Dùng .regex() cho từng requirement riêng biệt (better error messages)
 */

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email là bắt buộc')
      .email('Email không hợp lệ')
      .toLowerCase()
      .trim(),

    fullName: z
      .string()
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ tên không được quá 100 ký tự')
      .trim()
      .regex(
        /^[a-zA-ZÀ-ỹ\s]+$/,
        'Họ tên chỉ được chứa chữ cái và khoảng trắng'
      ),

    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .max(32, 'Mật khẩu không được quá 32 ký tự')
      // Check uppercase
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
      // Check lowercase
      .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
      // Check digit
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số')
      // Check special character
      .regex(
        /[\W_]/,
        'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)'
      ),

    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),

    phoneNumber: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true; // Optional field
          return /^(0|\+84)[0-9]{9,10}$/.test(val);
        },
        { message: 'Số điện thoại không hợp lệ (VD: 0912345678)' }
      ),

    dateOfBirth: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true; // Optional field
          const date = new Date(val);
          const today = new Date();
          const age = today.getFullYear() - date.getFullYear();
          return age >= 13 && age <= 120; // Phải từ 13 tuổi trở lên
        },
        { message: 'Bạn phải từ 13 tuổi trở lên' }
      ),
  })
  /**
   * Cross-field validation: confirmPassword phải match password
   * 
   * .refine() cho phép validate dựa trên nhiều fields
   * Không thể làm điều này với if-else thông thường một cách clean
   */
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'], // Error sẽ hiển thị ở field confirmPassword
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================================
// OTP SCHEMA
// ============================================================

/**
 * OTP Schema - Verify email/phone
 * Backend gửi 6-digit OTP code
 */
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP phải có đúng 6 số')
    .regex(/^[0-9]{6}$/, 'OTP chỉ được chứa số'),
});

export type OtpFormData = z.infer<typeof otpSchema>;

// ============================================================
// FORGOT PASSWORD SCHEMA
// ============================================================

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ============================================================
// RESET PASSWORD SCHEMA
// ============================================================

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token không hợp lệ'),

    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .max(32, 'Mật khẩu không được quá 32 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
      .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số')
      .regex(
        /[\W_]/,
        'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)'
      ),

    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================================
// CHANGE PASSWORD SCHEMA (User đã login)
// ============================================================

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),

    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .max(32, 'Mật khẩu mới không được quá 32 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
      .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số')
      .regex(
        /[\W_]/,
        'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)'
      ),

    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ============================================================
// HELPER: PASSWORD STRENGTH CHECKER
// ============================================================

/**
 * Check password strength
 * Return score 0-4 và feedback message
 * 
 * Usage:
 *   const { score, message } = getPasswordStrength("MyPass123!")
 *   // score: 4, message: "Mật khẩu mạnh"
 */
export function getPasswordStrength(password: string): {
  score: number; // 0 (very weak) to 4 (very strong)
  message: string;
  color: 'red' | 'orange' | 'yellow' | 'lime' | 'green';
} {
  if (!password) {
    return { score: 0, message: 'Nhập mật khẩu', color: 'red' };
  }

  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety check
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[\W_]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const messages = [
    { message: 'Rất yếu', color: 'red' as const },
    { message: 'Yếu', color: 'orange' as const },
    { message: 'Trung bình', color: 'yellow' as const },
    { message: 'Khá', color: 'lime' as const },
    { message: 'Mạnh', color: 'green' as const },
  ];

  return { score, ...messages[score] };
}

// ============================================================
// HELPER: VALIDATE PASSWORD MATCH BACKEND
// ============================================================

/**
 * Validate password có match Backend regex không
 * Dùng để pre-check trước khi submit
 * 
 * Backend Regex: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,32}$
 */
export function validatePasswordBackend(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }

  if (password.length > 32) {
    errors.push('Mật khẩu không được quá 32 ký tự');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số');
  }

  if (!/[\W_]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
