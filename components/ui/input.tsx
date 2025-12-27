'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/lib/utils/helpers';

/**
 * Reusable Input Component với React Hook Form integration
 * 
 * Features:
 * - Fully controlled by React Hook Form
 * - Error state styling
 * - Password toggle (show/hide)
 * - Focus states
 * - Accessible (aria-* attributes)
 * - Tailwind CSS styling
 * 
 * Usage:
 * ```tsx
 * const { register, formState: { errors } } = useForm();
 * 
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   registration={register('email')}
 *   error={errors.email?.message}
 * />
 * ```
 */

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /**
   * Label text hiển thị phía trên input (optional)
   * Nếu không truyền label, component sẽ render input standalone
   */
  label?: string;

  /**
   * Error message từ validation (react-hook-form)
   * Nếu có error, input sẽ chuyển sang error state (border đỏ)
   */
  error?: string;

  /**
   * React Hook Form registration object
   * Dùng spread operator: {...registration}
   */
  registration?: Partial<UseFormRegisterReturn>;

  /**
   * Helper text hiển thị dưới input (optional)
   * VD: "Chúng tôi sẽ không chia sẻ email của bạn"
   */
  helperText?: string;

  /**
   * Custom container className
   */
  containerClassName?: string;

  /**
   * Có bắt buộc không (hiển thị dấu * đỏ)
   */
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      type = 'text',
      error,
      registration,
      helperText,
      placeholder,
      containerClassName,
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    // State để toggle show/hide password
    const [showPassword, setShowPassword] = useState(false);

    // Determine input type (nếu là password và showPassword=true → chuyển thành text)
    const inputType = type === 'password' && showPassword ? 'text' : type;

    // Determine if input has error
    const hasError = !!error;

    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Label (chỉ render nếu có label prop) */}
        {label && (
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Input Container (để wrap input + icon) */}
        <div className="relative">
          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${registration?.name}-error` : undefined
            }
            className={cn(
              // Base styles
              'w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-all duration-200',
              'placeholder:text-gray-400',

              // Focus state
              'focus:ring-2 focus:ring-offset-1',

              // Normal state
              !hasError &&
                !disabled &&
                'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20',

              // Error state
              hasError &&
                'border-red-500 text-red-900 placeholder:text-red-400 focus:border-red-500 focus:ring-red-500/20',

              // Disabled state
              disabled && 'cursor-not-allowed bg-gray-100 text-gray-500',

              // Nếu là password field, thêm padding-right để không bị icon che chữ
              type === 'password' && 'pr-12'
            )}
            {...registration}
            {...props}
          />

          {/* Password Toggle Button */}
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition-colors',
                'hover:bg-gray-100',
                hasError ? 'text-red-500' : 'text-gray-500'
              )}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              tabIndex={-1} // Không focus vào button này khi tab
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Helper Text hoặc Error Message */}
        {(helperText || error) && (
          <div className="mt-1.5 min-h-[20px]">
            {error ? (
              <p
                id={`${registration?.name}-error`}
                className="text-xs text-red-600"
                role="alert"
              >
                {error}
              </p>
            ) : (
              helperText && (
                <p className="text-xs text-gray-500">{helperText}</p>
              )
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
