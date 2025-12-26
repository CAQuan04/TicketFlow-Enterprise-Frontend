# 🚀 JWT REFRESH TOKEN - QUICK REFERENCE

## 📦 PACKAGES ĐÃ CÀI

```bash
npm install jwt-decode
```

---

## 🔑 CORE CONCEPTS

### **1. Token Structure**

```typescript
// Backend trả về khi login/register
{
  accessToken: "eyJhbGciOiJIUzI1NiIs...",   // Expires: 15 minutes
  refreshToken: "def50200...",               // Expires: 7 days
  userId: "user-123",
  email: "user@mail.com",
  fullName: "Nguyen Van A",
  role: "Customer"
}
```

### **2. JWT Payload (Decoded)**

```typescript
// Decode accessToken để lấy user info
import { jwtDecode } from 'jwt-decode';

const decoded = jwtDecode(accessToken);
// {
//   sub: "user-123",        // User ID
//   email: "user@mail.com",
//   name: "Nguyen Van A",
//   role: "Customer",
//   exp: 1735308000,        // Expiration timestamp
//   iat: 1735221600         // Issued at
// }
```

---

## 📂 FILES MODIFIED

| File | Changes |
|------|---------|
| `types/dtos/auth.types.ts` | ✅ Added `AuthResponse`, `JwtPayload`, updated naming |
| `store/auth.store.ts` | ✅ JWT decode logic, `setTokens()`, `accessToken` naming |
| `lib/axios-client.ts` | ✅ Smart refresh interceptor với queue mechanism |
| `services/api/auth.service.ts` | ✅ Updated types to `AuthResponse` |

---

## 🎯 FLOW TÓM TẮT

### **Scenario: API Call với Token Expired**

```
1. Component → Call API
2. Axios → Attach "Authorization: Bearer {accessToken}"
3. Backend → 401 (token expired)
4. Axios Interceptor:
   a. Call POST /auth/refresh-token { accessToken, refreshToken }
   b. Backend return new tokens
   c. useAuthStore().setTokens(newAccessToken, newRefreshToken)
   d. Retry original request với new token
5. Backend → 200 OK
6. Component → Render data

User KHÔNG biết token đã refresh! ✨
```

---

## 💻 CODE EXAMPLES

### **1. Login**

```typescript
'use client';
import { useAuthStore } from '@/store';

const { login, isLoading } = useAuthStore();

await login({ email, password });
// ✅ Tokens saved to Store + localStorage
// ✅ User info decoded from JWT
// ✅ SignalR connected
```

---

### **2. Get User Info**

```typescript
'use client';
import { useAuthStore } from '@/store';

const { user, isAuthenticated } = useAuthStore();

console.log(user);
// {
//   userId: "user-123",
//   email: "user@mail.com",
//   fullName: "Nguyen Van A",
//   role: "Customer"
// }
```

---

### **3. Call Protected API**

```typescript
import { eventService } from '@/services/api';

// Axios tự động:
// - Attach token
// - Handle 401 → Refresh → Retry
const events = await eventService.getEvents();
```

---

### **4. Logout**

```typescript
const { logout } = useAuthStore();

await logout();
// ✅ Clear tokens
// ✅ Disconnect SignalR
// ✅ Redirect to /login
```

---

## 🔍 DEBUG COMMANDS

```javascript
// Browser Console

// Check tokens
localStorage.getItem('auth-storage');

// Check store state
import { useAuthStore } from '@/store';
useAuthStore.getState();

// Decode token manually
import { jwtDecode } from 'jwt-decode';
jwtDecode(useAuthStore.getState().accessToken);

// Check expiration
const { exp } = jwtDecode(useAuthStore.getState().accessToken);
const isExpired = exp * 1000 < Date.now();
console.log('Token expired:', isExpired);
```

---

## ⚠️ QUAN TRỌNG

### **Axios Interceptor tự động xử lý:**

- ✅ Attach `Authorization` header
- ✅ Detect 401 error
- ✅ Call refresh API
- ✅ Update Store với new tokens
- ✅ Retry failed request
- ✅ Queue concurrent requests
- ✅ Logout nếu refresh fail

### **Component KHÔNG cần:**

- ❌ Manual token management
- ❌ Check token expiration trước mỗi API call
- ❌ Handle 401 errors
- ❌ Trigger refresh manually

**Chỉ cần:** `await eventService.getEvents()` - Axios lo hết! 🎉

---

## 🎯 KEY TAKEAWAYS

1. ✅ **JWT Decode:** Extract user info từ `accessToken` (không cần call `/auth/me`)
2. ✅ **Auto-Refresh:** Token expired → Axios tự refresh → Retry request
3. ✅ **Queue Mechanism:** Multiple concurrent 401 → Chỉ 1 refresh request
4. ✅ **Zustand Store:** Single source of truth cho tokens + user
5. ✅ **localStorage Persist:** Tokens survive page refresh

---

## 📚 FULL DOCUMENTATION

Chi tiết đầy đủ: [NETWORKING_LAYER.md](./NETWORKING_LAYER.md)

---

**Status: ✅ READY TO USE**
