# 🚀 AUTH UI - QUICK START GUIDE

## 📦 Packages đã cài

```bash
✅ react-hook-form       # Form management
✅ zod                   # Schema validation
✅ @hookform/resolvers   # Zod + RHF integration
✅ react-hot-toast       # Notifications
✅ lucide-react          # Icons
✅ @react-oauth/google   # Google OAuth
✅ clsx + tailwind-merge # Class merging
```

---

## ⚙️ Setup Environment

### `.env.local`

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Lấy Google Client ID:**
1. https://console.cloud.google.com/apis/credentials
2. Tạo OAuth 2.0 Client ID
3. Authorized origins: `http://localhost:3000`
4. Copy Client ID

---

## 🧪 TEST NGAY

### **1. Start Server**

```bash
npm run dev
```

### **2. Mở Test Page**

```
http://localhost:3000/test-auth-ui
```

### **3. Test Scenarios**

#### ✅ **Login Form**
- Để trống email → "Email là bắt buộc"
- Nhập "abc" → "Email không hợp lệ"
- Để trống password → "Mật khẩu là bắt buộc"
- Nhập đúng → Toast success

#### ✅ **Register Form**
- Password: "weak" → Strength indicator "Rất yếu" (red)
- Password: "Password123!" → Strength "Mạnh" (green)
- confirmPassword khác → "Mật khẩu xác nhận không khớp"
- Xem password strength bar thay đổi màu

#### ✅ **OTP Form**
- Nhập "12345" → "OTP phải có đúng 6 số"
- Nhập "123456" → Success

#### ✅ **Google OAuth**
- Click "Đăng nhập với Google"
- Popup Google OAuth (cần config CLIENT_ID)

---

## 💻 CODE SNIPPETS

### **1. Simple Login Form**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth.schema';
import { useAuthStore } from '@/store';

export default function LoginPage() {
  const { login } = useAuthStore();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success('Đăng nhập thành công!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        label="Email"
        registration={form.register('email')}
        error={form.formState.errors.email?.message}
        required
      />

      <Input
        label="Password"
        type="password"
        registration={form.register('password')}
        error={form.formState.errors.password?.message}
        required
      />

      <button type="submit">Đăng nhập</button>
    </form>
  );
}
```

---

### **2. Register với Password Strength**

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import {
  registerSchema,
  type RegisterFormData,
  getPasswordStrength,
} from '@/lib/schemas/auth.schema';

export default function RegisterPage() {
  const [strength, setStrength] = useState({ score: 0, message: '', color: 'red' as const });
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = form.watch('password');

  return (
    <form>
      <Input
        label="Mật khẩu"
        type="password"
        registration={form.register('password', {
          onChange: (e) => setStrength(getPasswordStrength(e.target.value)),
        })}
        error={form.formState.errors.password?.message}
      />

      {/* Password Strength Bar */}
      {password && (
        <div className="mt-2">
          <span className={`text-${strength.color}-600`}>
            {strength.message}
          </span>
          <div className="h-2 bg-gray-200 rounded">
            <div
              className={`h-full bg-${strength.color}-500`}
              style={{ width: `${(strength.score / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      <Input
        label="Xác nhận mật khẩu"
        type="password"
        registration={form.register('confirmPassword')}
        error={form.formState.errors.confirmPassword?.message}
      />
    </form>
  );
}
```

---

### **3. Google Login Button**

```typescript
import { GoogleLoginButton } from '@/components/ui/google-login-button';
import { useAuthStore } from '@/store';

function LoginPage() {
  const { setTokens } = useAuthStore();

  return (
    <GoogleLoginButton
      onSuccess={(data) => {
        setTokens(data.accessToken, data.refreshToken);
        window.location.href = '/';
      }}
      onError={(error) => {
        console.error('Google login failed:', error);
      }}
    />
  );
}
```

---

## 📐 ZOD SCHEMAS

### **Login Schema**
```typescript
import { z } from 'zod';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth.schema';

// Auto type inference
const data: LoginFormData = {
  email: 'test@mail.com',
  password: 'password123'
};

// Validate
const result = loginSchema.safeParse(data);
if (result.success) {
  console.log('Valid!', result.data);
} else {
  console.log('Errors:', result.error.errors);
}
```

---

### **Register Schema (STRICT)**

**Password Requirements:**
- ✅ Min 8, Max 32 chars
- ✅ At least 1 uppercase (A-Z)
- ✅ At least 1 lowercase (a-z)
- ✅ At least 1 digit (0-9)
- ✅ At least 1 special char (!@#$%...)

**Valid example:** `MyPass123!`

```typescript
import { registerSchema } from '@/lib/schemas/auth.schema';

registerSchema.parse({
  email: 'test@mail.com',
  fullName: 'Nguyễn Văn A',
  password: 'MyPass123!',
  confirmPassword: 'MyPass123!',
  phoneNumber: '0912345678' // Optional
});
```

---

## 🎨 INPUT COMPONENT

### **Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | string | ✅ | Label text |
| `registration` | UseFormRegisterReturn | ✅ | RHF registration |
| `error` | string | ❌ | Error message |
| `type` | string | ❌ | Input type (default: "text") |
| `helperText` | string | ❌ | Helper text below input |
| `required` | boolean | ❌ | Show red asterisk |
| `disabled` | boolean | ❌ | Disable input |

### **Features:**
- ✅ Password toggle (Eye icon)
- ✅ Error state (red border + text)
- ✅ Focus ring (blue)
- ✅ Accessible (aria-* attributes)
- ✅ Tailwind CSS

---

## 🔐 PASSWORD HELPERS

### **Check Strength**

```typescript
import { getPasswordStrength } from '@/lib/schemas/auth.schema';

const strength = getPasswordStrength('MyPass123!');
console.log(strength);
// {
//   score: 4,          // 0-4
//   message: "Mạnh",
//   color: "green"
// }
```

### **Validate Backend Regex**

```typescript
import { validatePasswordBackend } from '@/lib/schemas/auth.schema';

const result = validatePasswordBackend('weak');
console.log(result);
// {
//   isValid: false,
//   errors: [
//     "Mật khẩu phải có ít nhất 8 ký tự",
//     "Mật khẩu phải có ít nhất 1 chữ hoa",
//     ...
//   ]
// }
```

---

## 📱 TOAST NOTIFICATIONS

```typescript
import toast from 'react-hot-toast';

// Success
toast.success('Đăng nhập thành công!');

// Error
toast.error('Email hoặc mật khẩu không đúng');

// Loading
toast.loading('Đang xử lý...', { id: 'login' });

// Update loading toast
toast.success('Thành công!', { id: 'login' });

// Custom duration
toast.success('Message', { duration: 5000 });
```

---

## ⚠️ QUAN TRỌNG

### **1. Google OAuth Provider**

**PHẢI wrap app với `GoogleOAuthProvider`:**

```typescript
// providers/index.tsx
export function Providers({ children }) {
  return (
    <AntdProvider>
      <GoogleAuthProvider>  {/* ← REQUIRED */}
        {children}
      </GoogleAuthProvider>
    </AntdProvider>
  );
}
```

### **2. Environment Variables**

```env
# MUST match Backend .NET
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### **3. Password Regex**

**Frontend Zod validation PHẢI match Backend .NET regex:**

```csharp
// Backend .NET
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,32}$
```

```typescript
// Frontend Zod
z.string()
  .min(8).max(32)
  .regex(/[A-Z]/, "Need uppercase")
  .regex(/[a-z]/, "Need lowercase")
  .regex(/[0-9]/, "Need digit")
  .regex(/[\W_]/, "Need special char")
```

---

## 📊 FILES CREATED

| File | Purpose |
|------|---------|
| `lib/schemas/auth.schema.ts` | Zod validation schemas |
| `components/ui/input.tsx` | Reusable input component |
| `components/ui/google-login-button.tsx` | Google OAuth button |
| `providers/google-auth-provider.tsx` | Google OAuth provider wrapper |
| `app/test-auth-ui/page.tsx` | Interactive test page |

---

## 🎯 NEXT STEPS

1. **Config Google Client ID** trong `.env.local`
2. **Test tất cả forms** tại `/test-auth-ui`
3. **Integrate với Login/Register pages**
4. **Connect với Backend API**
5. **Add email verification flow**
6. **Add forgot password flow**

---

## 📚 FULL DOCUMENTATION

Chi tiết: [AUTH_UI_COMPLETE.md](./AUTH_UI_COMPLETE.md)

---

**Status: ✅ READY TO USE**

Server running: `http://localhost:3000/test-auth-ui`
