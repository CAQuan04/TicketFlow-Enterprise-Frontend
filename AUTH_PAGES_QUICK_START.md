# 🚀 AUTH PAGES - QUICK START

**TL;DR**: Login, Register, Verify Email pages đã hoàn thành. Google OAuth ready. Test ngay!

---

## 📍 Routes

- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Verify Email**: http://localhost:3000/verify-email?email=test@example.com
- **Test Page**: http://localhost:3000/test-auth-ui

---

## ⚡ Quick Test

### Test Register (1 phút):

```bash
# 1. Go to register page
http://localhost:3000/register

# 2. Fill form:
Email: test@example.com
Full Name: Nguyen Van A
Password: Test@123
Confirm: Test@123

# 3. Click "Đăng ký"
# Expected: Toast success → Redirect to /verify-email?email=test@example.com
```

### Test Login (1 phút):

```bash
# 1. Go to login page
http://localhost:3000/login

# 2. Option A: Google OAuth
Click "Đăng nhập với Google" → OAuth popup → Authorize

# 3. Option B: Email/Password
Email: user@example.com
Password: Password@123
Click "Đăng nhập"

# Expected: Toast "Chào mừng trở lại!" → Redirect to /
```

---

## 🎨 Features Overview

### 1. Auth Layout
- ✅ Split screen (Image + Form)
- ✅ Responsive (mobile hides image)
- ✅ GoogleOAuthProvider wrapper
- ✅ Global Toaster

### 2. Register Page
- ✅ 6 fields (email, fullName, phone, dateOfBirth, password, confirmPassword)
- ✅ Zod validation matching Backend regex
- ✅ Password strength indicator (real-time)
- ✅ Password visibility toggle
- ✅ Backend error mapping
- ✅ Success → `/verify-email?email=...`

### 3. Login Page
- ✅ Google OAuth button (primary)
- ✅ Email/password form (fallback)
- ✅ Password visibility toggle
- ✅ "Remember me" checkbox
- ✅ "Forgot password?" link
- ✅ Zustand store: auto JWT decode + SignalR
- ✅ Success → Toast + redirect to `/`

### 4. Verify Email Page
- ✅ Display email from query param
- ✅ Instructions box
- ⏳ OTP form (coming soon)

---

## 🛠️ Files Changed

```
app/(auth)/
  ├── layout.tsx           (180 lines) ← Split screen + GoogleOAuthProvider
  ├── login/page.tsx       (270 lines) ← Google OAuth + Standard login
  ├── register/page.tsx    (290 lines) ← Full validation + API
  └── verify-email/page.tsx (110 lines) ← Placeholder

components/ui/
  └── input.tsx            (188 lines) ← Optional label support

lib/schemas/
  └── auth.schema.ts       (370 lines) ← Added dateOfBirth field
```

**Total**: 6 files, ~1,408 lines

---

## ✅ Build Status

```bash
npm run build
# ✓ Compiled successfully in 4.4s
# ✓ Running TypeScript
# ✓ Generating static pages (5/5)

npm run dev
# ✓ Ready in 825ms
# Local: http://localhost:3000
```

---

## 🔍 Key Code Snippets

### Register Submit Handler:

```tsx
const onSubmit = async (data: RegisterFormData) => {
  try {
    await authService.register(data); // POST /auth/register
    toast.success('Đăng ký thành công!');
    router.push(`/verify-email?email=${data.email}`);
  } catch (error) {
    // Map Backend errors to fields
    Object.keys(backendErrors).forEach(field => {
      setError(field.toLowerCase(), { message: errors[field][0] });
    });
  }
};
```

### Login with Zustand Store:

```tsx
const onSubmit = async (data: LoginFormData) => {
  try {
    await login(data); // Auto: API call + decode JWT + SignalR
    const user = useAuthStore.getState().user;
    toast.success(`Chào mừng trở lại, ${user?.fullName}!`);
    router.push('/');
  } catch (error) {
    toast.error('Email hoặc mật khẩu không chính xác');
  }
};
```

### Password Strength Indicator:

```tsx
const passwordStrength = getPasswordStrength(password);
// Returns: { score: 0-4, message: "Weak/Strong", color: "red/green" }

<div className="h-1.5 rounded-full bg-gray-200">
  <div 
    className={passwordStrength.color}
    style={{ width: `${(score / 4) * 100}%` }}
  />
</div>
```

---

## 🐛 Common Issues

### Issue: "Property 'name' does not exist"
**Fix**: Use `user?.fullName` instead of `user?.name`

### Issue: "Missing label prop"
**Fix**: Label is now optional. You can use external label or Input's label prop.

### Issue: "Login function expects 2 arguments"
**Fix**: Use `login(data)` not `login(accessToken, refreshToken)`

### Issue: Google OAuth not working
**Fix**: Check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local`

---

## 📦 Dependencies

```json
{
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@hookform/resolvers": "^3.x",
  "react-hot-toast": "^2.x",
  "@react-oauth/google": "^0.12.x",
  "lucide-react": "^0.x",
  "jwt-decode": "^4.x"
}
```

---

## 🎯 Next Steps

1. **Priority 1**: Implement OTP verification (verify-email page)
2. **Priority 2**: Forgot password flow
3. **Priority 3**: Protected routes + role-based access
4. **Priority 4**: User profile page

---

## 📚 Full Documentation

- **Detailed Guide**: [AUTH_PAGES_GUIDE.md](./AUTH_PAGES_GUIDE.md) (10,000+ words)
- **JWT Refresh**: [JWT_REFRESH_QUICK_GUIDE.md](./JWT_REFRESH_QUICK_GUIDE.md)
- **Auth UI**: [AUTH_UI_COMPLETE.md](./AUTH_UI_COMPLETE.md)

---

**Ready to test!** 🎉

Start dev server:
```bash
npm run dev
```

Navigate to: http://localhost:3000/login

---

*Quick Start - Day F2.2*
