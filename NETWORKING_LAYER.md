# 🌐 NETWORKING LAYER - JWT REFRESH TOKEN IMPLEMENTATION

## 📋 TỔNG QUAN

Đã implement hoàn chỉnh **Smart Networking Layer** với JWT Refresh Token mechanism cho TicketFlow Web Client.

**Tech Stack:**
- `axios` - HTTP Client
- `zustand` - State Management với localStorage persistence
- `jwt-decode` - Decode JWT để extract User info
- `@microsoft/signalr` - Real-time connection

---

## 🎯 KIẾN TRÚC TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────┐
│                        COMPONENT                                │
│                     (React Component)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Call API
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTH SERVICE                                 │
│              (services/api/auth.service.ts)                     │
│                                                                 │
│  login(), register(), logout(), refreshToken()                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Use axios client
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AXIOS CLIENT                                  │
│              (lib/axios-client.ts)                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ REQUEST INTERCEPTOR                                 │      │
│  │ - Get accessToken from Store                        │      │
│  │ - Attach: Authorization: Bearer {accessToken}       │      │
│  └─────────────────────────────────────────────────────┘      │
│                         │                                       │
│                         ▼                                       │
│                    Backend API                                 │
│                         │                                       │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ RESPONSE INTERCEPTOR                                │      │
│  │                                                       │      │
│  │ ✅ Success (200) → Return data                       │      │
│  │                                                       │      │
│  │ ❌ Error 401:                                        │      │
│  │   1. Check if already refreshing                     │      │
│  │   2. If YES → Add to queue                           │      │
│  │   3. If NO → Start refresh:                          │      │
│  │      a. Call POST /auth/refresh-token                │      │
│  │      b. Update Store with new tokens                 │      │
│  │      c. Retry original request                       │      │
│  │      d. Process queue                                │      │
│  │   4. If refresh fails → Logout                       │      │
│  └─────────────────────────────────────────────────────┘      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Update tokens
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ZUSTAND AUTH STORE                            │
│                (store/auth.store.ts)                            │
│                                                                 │
│  State:                                                         │
│  - accessToken: string | null                                  │
│  - refreshToken: string | null                                 │
│  - user: UserInfo | null                                       │
│  - isAuthenticated: boolean                                    │
│                                                                 │
│  Actions:                                                       │
│  - login() → Decode JWT → Save tokens → Connect SignalR        │
│  - logout() → Clear tokens → Disconnect SignalR                │
│  - setTokens() → Update tokens (called by Axios Interceptor)   │
│                                                                 │
│  Persistence: Auto-save to localStorage                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 TASK 1: AXIOS INSTANCE (SMART INTERCEPTOR)

### **File:** `lib/axios-client.ts`

### **Features Implemented:**

#### ✅ **1. Request Interceptor**
```typescript
// Tự động gắn accessToken từ Zustand Store vào mọi request
this.instance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});
```

**Logic:**
- Lấy `accessToken` từ Zustand Store (NOT localStorage trực tiếp)
- Attach vào header: `Authorization: Bearer {accessToken}`
- Tự động apply cho MỌI request

---

#### ✅ **2. Response Interceptor (401 Handling)**

**Flow khi gặp 401 Unauthorized:**

```typescript
if (error.response?.status === 401 && !originalRequest._retry) {
  // Step 1: Check if already refreshing
  if (this.isRefreshing) {
    // → Add vào queue, chờ refresh xong
    return new Promise((resolve, reject) => {
      this.failedQueue.push({ resolve, reject });
    });
  }

  // Step 2: Start refresh
  originalRequest._retry = true;
  this.isRefreshing = true;

  const { accessToken, refreshToken } = useAuthStore.getState();

  // Step 3: Call refresh API
  const response = await axios.post('/auth/refresh-token', {
    accessToken,
    refreshToken,
  });

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
    response.data.data;

  // Step 4: Update Store (Zustand auto-persist to localStorage)
  useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

  // Step 5: Process queue (retry all failed requests)
  this.processQueue(null, newAccessToken);

  // Step 6: Retry original request
  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
  return this.instance(originalRequest);
}
```

**Giải thích chi tiết:**

| Step | Mô tả | Code |
|------|-------|------|
| **Check 401** | Kiểm tra lỗi 401 + chưa retry + không phải endpoint `/auth/refresh-token` | `isUnauthorized && isNotRetried && isNotRefreshEndpoint` |
| **Queue Handling** | Nếu đang refresh → Add request vào queue | `this.failedQueue.push({ resolve, reject })` |
| **Refresh Token** | Call Backend: `POST /auth/refresh-token` | `axios.post('/auth/refresh-token', { accessToken, refreshToken })` |
| **Update Store** | Lưu tokens mới vào Zustand | `useAuthStore.getState().setTokens(newAccessToken, newRefreshToken)` |
| **Process Queue** | Retry tất cả requests trong queue | `this.processQueue(null, newAccessToken)` |
| **Retry Original** | Retry request ban đầu với new token | `this.instance(originalRequest)` |
| **Handle Fail** | Nếu refresh fail → Logout user | `this.handleLogout()` |

---

#### ✅ **3. Queue Mechanism (Concurrent Requests)**

**Scenario:**
- User mở 3 tabs, cùng call API sau khi token expired
- Tab A, B, C đều gặp 401 cùng lúc

**Logic xử lý:**

```typescript
private isRefreshing = false;
private failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// Tab A: Trigger refresh
if (!this.isRefreshing) {
  this.isRefreshing = true;
  // → Call refresh API
}

// Tab B, C: Add vào queue
if (this.isRefreshing) {
  return new Promise((resolve, reject) => {
    this.failedQueue.push({ resolve, reject });
  });
}

// Sau khi refresh xong:
private processQueue(error: any, token: string | null) {
  this.failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error); // Refresh failed
    } else {
      prom.resolve(token); // Retry với new token
    }
  });

  this.failedQueue = [];
}
```

**Kết quả:**
- ✅ Chỉ có 1 request refresh token (không duplicate)
- ✅ Tất cả concurrent requests đều được retry với new token
- ✅ Nếu refresh fail → Tất cả requests đều fail + logout

---

#### ✅ **4. Logout Handler**

```typescript
private handleLogout() {
  // Clear Zustand store (auto-clear localStorage)
  useAuthStore.getState().logout();

  // Redirect to login
  window.location.href = '/login';
}
```

**Được gọi khi:**
- ❌ Refresh token không tồn tại
- ❌ Refresh token expired/invalid
- ❌ Backend return 401 cho `/auth/refresh-token`

---

## 🗄️ TASK 2: AUTH STORE (ZUSTAND)

### **File:** `store/auth.store.ts`

### **State Structure:**

```typescript
interface AuthState {
  accessToken: string | null;   // JWT Access Token
  refreshToken: string | null;   // JWT Refresh Token
  user: UserInfo | null;          // Decoded từ JWT
  isAuthenticated: boolean;       // Token có hợp lệ?
  isLoading: boolean;             // Loading state
}
```

---

### **Actions:**

#### ✅ **1. login(credentials)**

```typescript
login: async (credentials: LoginRequest) => {
  // 1. Call API
  const response = await authService.login(credentials);
  
  // 2. Decode JWT để lấy user info
  const user = decodeToken(response.accessToken);
  
  // 3. Save tokens + user vào Store
  set({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user,
    isAuthenticated: true,
  });
  
  // 4. Connect SignalR
  await signalRConnection.connect(response.accessToken);
}
```

**Flow:**
1. ✅ Call Backend `/auth/login`
2. ✅ Backend return: `{ accessToken, refreshToken, userId, email, ... }`
3. ✅ Decode `accessToken` với `jwt-decode`
4. ✅ Extract UserInfo: `{ userId, email, fullName, role }`
5. ✅ Save vào Store (auto-persist to localStorage)
6. ✅ Connect SignalR với `accessToken`

---

#### ✅ **2. logout()**

```typescript
logout: async () => {
  // 1. Call logout API (optional)
  await authService.logout();
  
  // 2. Disconnect SignalR
  await signalRConnection.disconnect();
  
  // 3. Clear store
  set({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
}
```

**Flow:**
1. ✅ Call Backend `/auth/logout` (revoke tokens)
2. ✅ Disconnect SignalR
3. ✅ Clear Zustand Store (auto-clear localStorage)

---

#### ✅ **3. setTokens(accessToken, refreshToken)** ⭐

**Đây là action QUAN TRỌNG NHẤT - được gọi bởi Axios Interceptor**

```typescript
setTokens: (accessToken: string, refreshToken: string) => {
  // 1. Decode new accessToken
  const user = decodeToken(accessToken);
  
  // 2. Update Store
  set({
    accessToken,
    refreshToken,
    user,
    isAuthenticated: true,
  });
}
```

**Được gọi bởi:**
```typescript
// Trong Axios Interceptor (lib/axios-client.ts)
const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
  response.data.data;

// Update Store
useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
```

**Flow:**
1. ✅ Axios Interceptor refresh token thành công
2. ✅ Call `setTokens()` với new tokens
3. ✅ Decode new accessToken → Extract UserInfo
4. ✅ Update Store (auto-persist to localStorage)
5. ✅ Zustand trigger re-render cho components sử dụng store

---

#### ✅ **4. initialize()**

```typescript
initialize: async () => {
  const { accessToken } = get();
  
  if (!accessToken) return;
  
  // 1. Decode token
  const user = decodeToken(accessToken);
  
  // 2. Check expiration
  const decoded = jwtDecode<JwtPayload>(accessToken);
  const isExpired = decoded.exp * 1000 < Date.now();
  
  if (isExpired) {
    console.warn('Token expired, will refresh on next API call');
  }
  
  // 3. Update state
  set({ user, isAuthenticated: true });
  
  // 4. Connect SignalR
  await signalRConnection.connect(accessToken);
}
```

**Được gọi khi:**
- ✅ App start (trong `AuthProvider`)
- ✅ Page refresh

**Logic:**
1. ✅ Load `accessToken` từ localStorage (auto-hydrated by Zustand)
2. ✅ Decode token → Extract user info
3. ✅ Check expiration (chỉ warning, không force refresh)
4. ✅ Connect SignalR

---

### **Persistence Configuration:**

```typescript
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({ ...actions }),
    {
      name: 'auth-storage',              // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
```

**Features:**
- ✅ Auto-save `accessToken`, `refreshToken`, `user` vào localStorage
- ✅ Auto-load khi app start
- ✅ Không lưu `isLoading`, `isAuthenticated` (derived state)

---

## 📝 TASK 3: TYPE DEFINITIONS

### **File:** `types/dtos/auth.types.ts`

#### ✅ **1. AuthResponse (Login/Register Response)**

```typescript
export interface AuthResponse {
  accessToken: string;  // JWT Access Token
  refreshToken: string; // JWT Refresh Token
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string;    // ISO DateTime từ .NET
}

// Alias cho backward compatibility
export type LoginResponse = AuthResponse;
```

---

#### ✅ **2. JwtPayload (Decoded Token)**

```typescript
export interface JwtPayload {
  sub: string;          // User ID
  email: string;
  name: string;         // Full name
  role: string;         // User role
  exp: number;          // Expiration timestamp (Unix)
  iat: number;          // Issued at timestamp (Unix)
  jti: string;          // JWT ID
}
```

**Sử dụng:**
```typescript
import { jwtDecode } from 'jwt-decode';

const decoded = jwtDecode<JwtPayload>(accessToken);
console.log(decoded.sub);   // User ID
console.log(decoded.email); // Email
console.log(decoded.exp);   // Expiration: 1735308000
```

---

#### ✅ **3. UserInfo (Extracted từ JWT)**

```typescript
export interface UserInfo {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}
```

**Helper function:**
```typescript
function decodeToken(accessToken: string): UserInfo | null {
  try {
    const decoded = jwtDecode<JwtPayload>(accessToken);
    
    return {
      userId: decoded.sub,
      email: decoded.email,
      fullName: decoded.name,
      role: decoded.role as any,
    };
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}
```

---

#### ✅ **4. RefreshTokenRequest/Response**

```typescript
export interface RefreshTokenRequest {
  accessToken: string;  // Current access token
  refreshToken: string; // Current refresh token
}

export interface RefreshTokenResponse {
  accessToken: string;  // New access token
  refreshToken: string; // New refresh token
  expiresAt: string;    // New expiration time
}
```

**Backend endpoint:**
```http
POST /api/Auth/Refresh
Content-Type: application/json

{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "def50200..."
}

Response:
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "def50200...",
    "expiresAt": "2025-12-28T10:00:00Z"
  },
  "isSuccess": true
}
```

---

## 🎯 JWT DECODE - GIẢI THÍCH CHI TIẾT

### **Tại sao cần JWT Decode?**

Backend .NET trả về JWT token có structure:

```
Header.Payload.Signature

Payload (decoded):
{
  "sub": "user-123",        // Subject = User ID
  "email": "user@mail.com",
  "name": "Nguyen Van A",
  "role": "Customer",
  "exp": 1735308000,        // Expiration time
  "iat": 1735221600,        // Issued at
  "jti": "abc-xyz"          // JWT ID
}
```

**Lợi ích:**
- ✅ **Không cần call API `/auth/me`** để lấy user info
- ✅ Extract trực tiếp từ token → Giảm API calls
- ✅ Check expiration trước khi gửi request
- ✅ Hiển thị user info ngay lập tức (không loading)

---

### **Cách sử dụng jwt-decode:**

```bash
npm install jwt-decode
```

```typescript
import { jwtDecode } from 'jwt-decode';

// Decode token
const decoded = jwtDecode<JwtPayload>(accessToken);

console.log(decoded.sub);   // "user-123"
console.log(decoded.email); // "user@mail.com"
console.log(decoded.name);  // "Nguyen Van A"
console.log(decoded.role);  // "Customer"

// Check expiration
const isExpired = decoded.exp * 1000 < Date.now();
if (isExpired) {
  console.log('Token expired!');
}
```

---

## 🔄 FLOW HOÀN CHỈNH

### **Scenario 1: User Login**

```
1. User nhập email/password
2. Component call: useAuthStore().login({ email, password })
3. Auth Store → authService.login()
4. Auth Service → Axios Client
5. Axios Interceptor attach header: "Authorization: Bearer {token}"
6. Backend return: { accessToken, refreshToken, ... }
7. Auth Store:
   - Decode accessToken → Extract UserInfo
   - Save tokens to Store (auto-persist to localStorage)
   - Connect SignalR
8. Component re-render với user info
```

---

### **Scenario 2: API Call với Token Expired**

```
1. Component call API: eventService.getEvents()
2. Axios Interceptor attach accessToken vào header
3. Backend check token → 401 Unauthorized (token expired)
4. Axios Response Interceptor:
   a. Mark request as _retry = true
   b. Call POST /auth/refresh-token { accessToken, refreshToken }
   c. Backend return new tokens
   d. Call useAuthStore().setTokens(newAccessToken, newRefreshToken)
   e. Zustand update Store → localStorage updated
   f. Retry original request với new token
5. Backend return events data
6. Component receive data → Render UI
```

**Timeline:**
```
0ms   → API call (old token)
10ms  → 401 Unauthorized
20ms  → Start refresh
30ms  → Refresh success → Update Store
40ms  → Retry API call (new token)
50ms  → Success → Return data
```

**User experience:** Không bao giờ bị logout, refresh diễn ra trong background!

---

### **Scenario 3: Refresh Token Expired**

```
1. Component call API
2. Axios Interceptor attach accessToken
3. Backend → 401
4. Axios try refresh → Call /auth/refresh-token
5. Backend → 401 (refresh token expired)
6. Axios Interceptor:
   - processQueue(error) → Reject all queued requests
   - handleLogout():
     * Clear Zustand Store
     * Disconnect SignalR
     * Redirect to /login
7. User see login page
```

---

### **Scenario 4: Concurrent Requests (3 tabs cùng call API)**

```
Tab A:
- Call API → 401
- isRefreshing = false → Start refresh
- isRefreshing = true

Tab B:
- Call API → 401
- isRefreshing = true → Add to queue

Tab C:
- Call API → 401
- isRefreshing = true → Add to queue

Tab A finishes refresh:
- Update Store → New tokens
- processQueue(null, newToken)
  * Tab B: Retry với new token
  * Tab C: Retry với new token

Result:
✅ Chỉ 1 refresh request
✅ Tất cả tabs đều nhận được new token
✅ Không có duplicate refresh
```

---

## 📊 TOKEN LIFECYCLE

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                              │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN
   ↓
   ┌────────────────┐
   │ Backend Issues │ → accessToken (exp: 15min)
   │   JWT Tokens   │ → refreshToken (exp: 7 days)
   └────────────────┘
   ↓
   ┌────────────────┐
   │  Store Tokens  │ → Zustand Store + localStorage
   └────────────────┘

2. NORMAL API CALL (Token Valid)
   ↓
   ┌────────────────┐
   │ Attach Token   │ → Header: "Authorization: Bearer {accessToken}"
   └────────────────┘
   ↓
   Backend validates → 200 OK

3. API CALL (Token Expired)
   ↓
   ┌────────────────┐
   │ Backend → 401  │
   └────────────────┘
   ↓
   ┌────────────────────────────┐
   │ Axios Interceptor          │
   │ - Call /auth/refresh-token │
   │ - Update Store             │
   │ - Retry request            │
   └────────────────────────────┘
   ↓
   Backend validates new token → 200 OK

4. REFRESH TOKEN EXPIRED
   ↓
   ┌────────────────┐
   │ Backend → 401  │
   └────────────────┘
   ↓
   ┌────────────────────────────┐
   │ Axios Interceptor          │
   │ - Call /auth/refresh-token │
   │ - Backend → 401            │
   │ - Logout user              │
   └────────────────────────────┘
   ↓
   Redirect to /login
```

---

## ✅ CHECKLIST HOÀN THÀNH

### **TASK 1: AXIOS INSTANCE**
- [x] Request Interceptor với accessToken
- [x] Response Interceptor xử lý 401
- [x] Smart Refresh Token Logic
- [x] Queue mechanism cho concurrent requests
- [x] Auto-logout khi refresh fail
- [x] Error normalization

### **TASK 2: AUTH STORE**
- [x] Zustand Store với persist middleware
- [x] JWT Decode để extract user info
- [x] `login()` action với SignalR connection
- [x] `logout()` action với cleanup
- [x] `setTokens()` cho Axios Interceptor
- [x] `initialize()` cho app startup
- [x] Auto-persist to localStorage

### **TASK 3: TYPE DEFINITIONS**
- [x] `AuthResponse` type
- [x] `JwtPayload` interface
- [x] `UserInfo` type
- [x] `RefreshTokenRequest/Response`
- [x] Helper function `decodeToken()`

### **BONUS:**
- [x] Installed `jwt-decode` package
- [x] Updated `auth.service.ts`
- [x] Build successful (no TypeScript errors)
- [x] Full documentation

---

## 🚀 CÁCH SỬ DỤNG

### **1. Login User**

```typescript
'use client';

import { useAuthStore } from '@/store';
import { Button, Form, Input } from 'antd';

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (values: any) => {
    try {
      await login(values);
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Form onFinish={handleSubmit}>
      <Form.Item name="email">
        <Input placeholder="Email" />
      </Form.Item>
      <Form.Item name="password">
        <Input.Password placeholder="Password" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={isLoading}>
        Login
      </Button>
    </Form>
  );
}
```

---

### **2. Display User Info**

```typescript
'use client';

import { useAuthStore } from '@/store';

export function UserProfile() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h2>Welcome, {user?.fullName}!</h2>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

---

### **3. Call Protected API**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { eventService } from '@/services/api';

export function EventList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Axios tự động attach token + handle refresh nếu cần
        const data = await eventService.getEvents();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

**Flow:**
1. ✅ Component call `eventService.getEvents()`
2. ✅ Axios Interceptor attach `Authorization: Bearer {accessToken}`
3. ✅ Nếu 401 → Auto refresh → Retry
4. ✅ Return data → Component render

**User không bao giờ nhận ra token đã expired!** 🎉

---

### **4. Logout User**

```typescript
'use client';

import { useAuthStore } from '@/store';
import { Button } from 'antd';

export function LogoutButton() {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <Button onClick={handleLogout}>
      Logout
    </Button>
  );
}
```

---

### **5. Initialize Auth on App Start**

```typescript
// providers/auth-provider.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Load token từ localStorage và verify
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
```

---

## 🔍 DEBUGGING

### **Check Tokens trong DevTools:**

```javascript
// Browser Console

// 1. Check localStorage
localStorage.getItem('auth-storage');
// Output: {"state":{"accessToken":"...","refreshToken":"...","user":{...}}}

// 2. Check Zustand Store
import { useAuthStore } from '@/store';
console.log(useAuthStore.getState());
// Output: { accessToken: "...", refreshToken: "...", user: {...} }

// 3. Decode token manually
import { jwtDecode } from 'jwt-decode';
const token = useAuthStore.getState().accessToken;
console.log(jwtDecode(token));
// Output: { sub: "user-123", email: "...", exp: 1735308000, ... }

// 4. Check expiration
const decoded = jwtDecode(token);
const isExpired = decoded.exp * 1000 < Date.now();
console.log('Token expired:', isExpired);
```

---

### **Monitor Refresh Token Flow:**

**Mở Network tab trong DevTools:**

```
Request 1: GET /api/Events
→ 401 Unauthorized

Request 2: POST /api/Auth/Refresh
→ Body: { accessToken: "...", refreshToken: "..." }
→ Response: { accessToken: "new...", refreshToken: "new..." }

Request 3: GET /api/Events (Retry)
→ Header: Authorization: Bearer {new-token}
→ 200 OK
```

---

## 🎯 KẾT LUẬN

### **✅ ĐÃ HOÀN THÀNH:**

1. ✅ **Smart Axios Client** với JWT refresh logic hoàn chỉnh
2. ✅ **Zustand Auth Store** với JWT decode và persistence
3. ✅ **Type Definitions** map chính xác từ Backend
4. ✅ **Queue Mechanism** cho concurrent requests
5. ✅ **Auto-logout** khi refresh token expired
6. ✅ **SignalR Integration** với token
7. ✅ **Build successful** - No TypeScript errors

### **🚀 READY TO USE:**

- ✅ Login/Logout flow hoàn chỉnh
- ✅ Token refresh tự động, transparent với user
- ✅ Protected API calls
- ✅ Real-time connection
- ✅ Production-ready code

### **📚 DOCUMENTATION:**

- ✅ Full flow diagrams
- ✅ Code examples
- ✅ Debugging guide
- ✅ Usage patterns

---

**🎉 NETWORKING LAYER IMPLEMENTATION COMPLETE!**

*Implemented by: Senior Frontend Architect*  
*Date: December 27, 2024*  
*Status: ✅ PRODUCTION READY*
