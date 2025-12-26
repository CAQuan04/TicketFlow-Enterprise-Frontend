# 🎯 QUICK START GUIDE - TicketFlow Web

## 🚀 Chạy Project

```bash
cd ticketflow-web
npm run dev
```

→ Mở http://localhost:3000

## 📁 Thêm Page Mới

### 1. Customer Page (với Navbar + Footer)
```bash
# Tạo file: app/(root)/my-page/page.tsx
```

```tsx
// app/(root)/my-page/page.tsx
export default function MyPage() {
  return <div>My Page Content</div>;
}
```

URL: `/my-page`

### 2. Admin Page (với Sidebar)
```bash
# Tạo file: app/(admin)/my-admin-page/page.tsx
```

```tsx
'use client'; // Nếu cần Ant Design

export default function MyAdminPage() {
  return <div>Admin Content</div>;
}
```

URL: `/my-admin-page`

### 3. Auth Page (Centered form)
```bash
# Tạo file: app/(auth)/forgot-password/page.tsx
```

URL: `/forgot-password`

## 🔌 Call API

### Import service
```typescript
import { eventService } from '@/services/api';
```

### Fetch data (Server Component)
```tsx
export default async function EventsPage() {
  const events = await eventService.getEvents();
  
  return <div>{/* render events */}</div>;
}
```

### Fetch data (Client Component)
```tsx
'use client';

import { useState, useEffect } from 'react';
import { eventService } from '@/services/api';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    eventService.getEvents().then(setEvents);
  }, []);
  
  return <div>{/* render events */}</div>;
}
```

## 🎨 Sử dụng Components

### Ant Design
```tsx
'use client'; // BẮT BUỘC

import { Button, Form, Input } from 'antd';

export default function MyForm() {
  return (
    <Form>
      <Form.Item name="email">
        <Input placeholder="Email" />
      </Form.Item>
      <Button type="primary">Submit</Button>
    </Form>
  );
}
```

### Tailwind CSS
```tsx
export default function MyComponent() {
  return (
    <div className="flex items-center justify-center bg-blue-500 p-4">
      <h1 className="text-2xl font-bold text-white">Hello</h1>
    </div>
  );
}
```

## 🗃️ State Management

### Auth Store
```tsx
'use client';

import { useAuthStore } from '@/store';

export default function ProfileButton() {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  if (!isAuthenticated) return null;
  
  return (
    <div>
      <p>Welcome, {user?.fullName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Cart Store
```tsx
'use client';

import { useCartStore } from '@/store';

export default function AddToCart() {
  const { addItem, getTotalQuantity } = useCartStore();
  
  const handleAdd = () => {
    addItem({
      eventId: '123',
      ticketTypeId: '456',
      quantity: 1,
      price: 100000,
      // ... other fields
    });
  };
  
  return (
    <button onClick={handleAdd}>
      Add to Cart ({getTotalQuantity()})
    </button>
  );
}
```

## 🔔 SignalR Notifications

```tsx
'use client';

import { useEffect } from 'react';
import { signalRConnection } from '@/lib/signalr-connection';
import { message } from 'antd';

export default function NotificationHandler() {
  useEffect(() => {
    // Subscribe to notifications
    const unsubscribe = signalRConnection.on('OrderConfirmed', (notification) => {
      message.success(notification.message);
    });
    
    // Cleanup
    return () => unsubscribe();
  }, []);
  
  return null;
}
```

## 📝 TypeScript Types

### Import types
```typescript
import type { EventListDto, LoginRequest, OrderDto } from '@/types';
```

### Sử dụng
```typescript
const event: EventListDto = await eventService.getEventById('123');
const loginData: LoginRequest = { email: '', password: '' };
```

## 🛠️ Utility Functions

```typescript
import { cn, formatCurrency, formatDate } from '@/lib/utils';

// Combine class names
const className = cn('px-4 py-2', 'bg-blue-500', isActive && 'font-bold');

// Format currency
const price = formatCurrency(100000); // "100.000 ₫"

// Format date
const date = formatDate('2024-12-27T19:00:00'); // "27/12/2024, 19:00"
```

## 🔐 Protected Routes (TODO)

```typescript
// middleware.ts (cần tạo)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};
```

## 🎯 Common Patterns

### Loading State
```tsx
'use client';

import { useState } from 'react';
import { Button, Spin } from 'antd';

export default function MyComponent() {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      await someAsyncFunction();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Spin spinning={loading}>
      <Button onClick={handleClick}>Click Me</Button>
    </Spin>
  );
}
```

### Error Handling
```tsx
'use client';

import { message } from 'antd';

export default function MyComponent() {
  const handleSubmit = async (data) => {
    try {
      await authService.login(data);
      message.success('Login successful!');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Login failed');
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 📦 Thêm Package Mới

```bash
npm install <package-name>
npm install -D <dev-package-name>
```

## 🐛 Debug Tips

### Check API calls
```typescript
console.log('API Response:', await eventService.getEvents());
```

### Check Zustand state
```typescript
console.log('Auth State:', useAuthStore.getState());
console.log('Cart State:', useCartStore.getState());
```

### Clear localStorage (khi gặp lỗi auth)
```typescript
localStorage.clear();
// Reload page
```

---

**Need help?** Xem `README.md` hoặc `SETUP_COMPLETE.md` để biết thêm chi tiết!
