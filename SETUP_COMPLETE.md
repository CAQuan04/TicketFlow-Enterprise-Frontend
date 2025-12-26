# 📦 DAY F1 SETUP - HOÀN THÀNH

## ✅ ĐÃ THỰC HIỆN

### 1. INITIALIZATION ✓
- ✅ Tạo Next.js 15 app với TypeScript, Tailwind, ESLint
- ✅ Cài đặt tất cả dependencies: axios, zustand, antd, dayjs, signalr
- ✅ Project build thành công

### 2. FOLDER STRUCTURE (DOMAIN-DRIVEN) ✓
```
ticketflow-web/
├── app/
│   ├── (auth)/                    # Auth pages: /login, /register
│   ├── (root)/                    # Customer pages: /, /events
│   ├── (admin)/                   # Admin pages: /dashboard
│   ├── layout.tsx                 # Root layout với Providers
│   └── globals.css                # Global styles
│
├── components/
│   ├── ui/                        # Atomic components
│   └── shared/                    # Navbar, Footer
│
├── lib/
│   ├── axios-client.ts            # ✅ Axios với JWT interceptors
│   ├── signalr-connection.ts      # ✅ SignalR singleton connection
│   └── utils/helpers.ts           # ✅ Utility functions
│
├── services/api/
│   ├── auth.service.ts            # ✅ Authentication APIs
│   ├── event.service.ts           # ✅ Event APIs
│   └── order.service.ts           # ✅ Order & Payment APIs
│
├── store/
│   ├── auth.store.ts              # ✅ Zustand auth store (persist)
│   └── cart.store.ts              # ✅ Shopping cart store
│
├── providers/
│   ├── auth-provider.tsx          # ✅ Auth initialization
│   ├── antd-provider.tsx          # ✅ Ant Design theme
│   └── index.tsx                  # ✅ Combined providers
│
└── types/dtos/
    ├── auth.types.ts              # ✅ Auth DTOs
    ├── event.types.ts             # ✅ Event DTOs
    ├── venue.types.ts             # ✅ Venue DTOs
    └── order.types.ts             # ✅ Order DTOs
```

### 3. CONFIGURATION & THEME ✓
- ✅ `.env.local` với NEXT_PUBLIC_API_URL và NEXT_PUBLIC_HUB_URL
- ✅ `globals.css` với CSS variables và Ant Design customization
- ✅ Ant Design theme map với Tailwind colors
- ✅ Vietnamese locale cho AntD và DayJS

### 4. LAYOUTS & PAGES ✓
- ✅ Route Groups: (auth), (root), (admin)
- ✅ Auth Layout: Centered form
- ✅ Root Layout: Navbar + Footer
- ✅ Admin Layout: Sidebar + Header
- ✅ Sample pages: Login, Home

## 🎯 CORE FEATURES IMPLEMENTED

### 🔐 Authentication System
```typescript
// Zustand Store với persistence
useAuthStore → login/logout/register
→ Auto-save token vào localStorage
→ Auto-connect SignalR khi login
→ Auto-disconnect khi logout

// Axios Interceptor
→ Tự động gắn JWT vào mọi request
→ Auto-refresh token khi 401
→ Logout khi refresh failed
```

### 🔔 Real-time Notifications (SignalR)
```typescript
signalRConnection.connect(token);
signalRConnection.on('OrderConfirmed', handler);
→ WebSocket connection với .NET Hub
→ Auto-reconnect với exponential backoff
→ Event-based notification system
```

### 🛒 Shopping Cart
```typescript
useCartStore → addItem/removeItem/clearCart
→ Persist cart vào localStorage
→ Calculate total amount/quantity
→ Single event constraint
```

### 🎨 UI Components
- Navbar: Logo + Navigation + Cart badge + User menu
- Footer: Brand info + Links + Social
- Layouts: Auth (centered), Root (navbar+footer), Admin (sidebar)

## 📖 GIẢI THÍCH CHI TIẾT

### 🔹 Route Groups - Tại sao dùng (auth), (root), (admin)?

**Route Groups là folders với tên trong dấu ngoặc đơn `()`**

#### Đặc điểm:
1. **KHÔNG ảnh hưởng URL path**
   ```
   app/(auth)/login/page.tsx → URL: /login (không phải /(auth)/login)
   app/(root)/events/page.tsx → URL: /events (không phải /(root)/events)
   ```

2. **Chỉ để organize code và share layouts**
   - Mỗi group có `layout.tsx` riêng
   - Nhóm các routes có cùng UI pattern

#### Ví dụ thực tế:
```
app/
├── (auth)/
│   ├── layout.tsx          # Layout: Centered form, NO navbar/footer
│   ├── login/page.tsx      → /login
│   └── register/page.tsx   → /register
│
├── (root)/
│   ├── layout.tsx          # Layout: Navbar + Footer
│   ├── page.tsx            → / (home)
│   └── events/page.tsx     → /events
│
└── (admin)/
    ├── layout.tsx          # Layout: Sidebar + Header
    └── dashboard/page.tsx  → /dashboard
```

#### Lợi ích:
- **Separation of Concerns**: Auth không cần navbar, Admin cần sidebar
- **Code Organization**: Dễ maintain project lớn
- **Layout Inheritance**: Mỗi group có layout riêng

### 🔹 Server Components vs Client Components

#### Server Components (Default)
**Đặc điểm:**
- Render trên server → gửi HTML về client
- KHÔNG thể dùng `useState`, `useEffect`, browser APIs
- SEO-friendly, fast initial load

**Khi nào dùng:**
- Static content
- Fetch data từ database/API
- No interactivity

**Ví dụ:**
```tsx
// app/(root)/page.tsx - Server Component (default)
export default function HomePage() {
  // Có thể fetch data trực tiếp
  return <div>Static content</div>;
}
```

#### Client Components (Khi cần interactivity)
**Đặc điểm:**
- Chạy trên browser
- CÓ THỂ dùng React hooks, event handlers
- **Ant Design components bắt buộc 'use client'**

**Khi nào dùng:**
- Cần `useState`, `useEffect`
- Event handlers (`onClick`, `onChange`)
- Ant Design components
- Zustand stores

**Ví dụ:**
```tsx
'use client'; // BẮT BUỘC

import { Button } from 'antd';
import { useAuthStore } from '@/store';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  
  return <Button onClick={() => login()}>Login</Button>;
}
```

#### ⚠️ ANT DESIGN LUÔN CẦN 'use client'

```tsx
// ❌ SAI
export default function Page() {
  return <Button>Click</Button>; // Error: Server Component
}

// ✅ ĐÚNG
'use client';

export default function Page() {
  return <Button>Click</Button>; // OK
}
```

#### 🎯 Best Practice: Hybrid Strategy

**Keep page là Server Component, tách interactive parts:**

```tsx
// app/(root)/events/page.tsx (Server Component)
import { EventList } from '@/components/event-list';

export default async function EventsPage() {
  // Fetch data on server (fast, SEO-friendly)
  const events = await fetch('...').then(r => r.json());
  
  return (
    <div>
      <h1>Events</h1>
      {/* Pass data to Client Component */}
      <EventList events={events} />
    </div>
  );
}

// components/event-list.tsx (Client Component)
'use client';

import { Button } from 'antd';

export function EventList({ events }) {
  const [selected, setSelected] = useState(null);
  
  return (
    <div>
      {events.map(event => (
        <Button onClick={() => setSelected(event)}>
          {event.title}
        </Button>
      ))}
    </div>
  );
}
```

## 🚀 NEXT STEPS

### Day F2: Core Features
1. **Event Detail Page** với SeatMap component
2. **Shopping Cart** với checkout flow
3. **Protected Routes** (middleware.ts)
4. **Admin Dashboard** với charts

### Day F3: Advanced Features
1. **Payment Integration** (VNPay/Momo)
2. **Real-time notifications** UI
3. **Search & Filters** với debounce
4. **User Profile & Settings**

### Day F4: Optimization
1. **Image optimization** với Next.js Image
2. **Loading states** và Suspense
3. **Error boundaries**
4. **Performance monitoring**

## 🛠️ COMMANDS

```bash
# Development
npm run dev              # Start dev server on port 3000

# Build
npm run build            # Build for production
npm start                # Start production server

# Lint
npm run lint             # ESLint check
```

## 📚 KEY CONCEPTS

### TypeScript Types
Tất cả types map chính xác từ Backend DTOs:
```typescript
import { EventListDto, LoginResponse } from '@/types';

const events: EventListDto[] = await eventService.getEvents();
```

### API Services Pattern
```typescript
import { authService, eventService } from '@/services/api';

// Tất cả services đều return typed data
const user: LoginResponse = await authService.login(credentials);
const events: PaginatedResponse<EventListDto> = await eventService.getEvents();
```

### State Management
```typescript
// Zustand stores với TypeScript
const { login, user, isAuthenticated } = useAuthStore();
const { addItem, getTotalAmount } = useCartStore();
```

## 🎉 PROJECT READY TO CODE!

Setup hoàn tất! Bây giờ bạn có thể:
- Chạy `npm run dev` và xem demo pages
- Bắt đầu implement Event Detail page
- Connect với Backend API
- Build các features tiếp theo

**Project structure:** Clean, scalable, enterprise-ready ✓
**TypeScript types:** Hoàn chỉnh, map từ Backend ✓
**Authentication:** JWT + Refresh token + SignalR ✓
**UI Framework:** Ant Design + Tailwind configured ✓

---
**Setup bởi:** Senior Frontend Architect  
**Ngày:** 2024-12-27  
**Status:** ✅ COMPLETED
