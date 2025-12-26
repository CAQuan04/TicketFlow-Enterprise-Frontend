# 🎫 TicketFlow Web Client - Next.js 15

Enterprise-ready Next.js 15 application kết nối với .NET 8 Clean Architecture Backend.

## 📋 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: Ant Design (antd)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Real-time**: SignalR (@microsoft/signalr)
- **Date Handling**: Day.js
- **Icons**: Lucide React + Ant Design Icons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ và npm
- .NET Backend đang chạy tại `https://localhost:7207`

### Installation

```bash
# Navigate to project directory
cd ticketflow-web

# Install dependencies (đã thực hiện)
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local với Backend URL của bạn
```

### Development

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong browser.

### Build

```bash
npm run build
npm start
```

## 📁 Folder Structure (Domain-Driven)

```
ticketflow-web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth Route Group (không ảnh hưởng URL)
│   │   ├── login/
│   │   │   └── page.tsx          # /login
│   │   ├── register/
│   │   │   └── page.tsx          # /register
│   │   └── layout.tsx            # Auth Layout (centered form)
│   │
│   ├── (root)/                   # Customer Route Group
│   │   ├── page.tsx              # / (Home)
│   │   ├── events/
│   │   │   ├── page.tsx          # /events
│   │   │   └── [id]/
│   │   │       └── page.tsx      # /events/[id]
│   │   ├── booking/
│   │   │   └── page.tsx          # /booking
│   │   └── layout.tsx            # Root Layout (Navbar + Footer)
│   │
│   ├── (admin)/                  # Admin Route Group
│   │   ├── dashboard/
│   │   │   └── page.tsx          # /dashboard
│   │   ├── events/
│   │   │   └── page.tsx          # /dashboard/events
│   │   └── layout.tsx            # Admin Layout (Sidebar)
│   │
│   ├── layout.tsx                # Root Layout (Global)
│   └── globals.css               # Global styles
│
├── components/
│   ├── ui/                       # Atomic UI components
│   │   ├── button.tsx
│   │   └── card.tsx
│   │
│   └── shared/                   # Complex shared components
│       ├── navbar.tsx            # Main navigation
│       ├── footer.tsx            # Footer
│       └── event-card.tsx        # Event display card
│
├── lib/
│   ├── axios-client.ts           # Configured Axios instance với JWT interceptors
│   ├── signalr-connection.ts    # SignalR connection manager (Singleton)
│   └── utils/
│       └── helpers.ts            # Utility functions (cn, formatCurrency, etc.)
│
├── services/
│   └── api/
│       ├── auth.service.ts       # Authentication API calls
│       ├── event.service.ts      # Event API calls
│       ├── order.service.ts      # Order & Payment API calls
│       └── index.ts              # Centralized exports
│
├── store/
│   ├── auth.store.ts             # Auth state (Zustand + persist)
│   ├── cart.store.ts             # Shopping cart state
│   └── index.ts
│
├── providers/
│   ├── auth-provider.tsx         # Auth initialization provider
│   ├── antd-provider.tsx         # Ant Design theme provider
│   └── index.tsx                 # Combined providers
│
├── types/
│   ├── dtos/
│   │   ├── auth.types.ts         # Auth DTOs (mapped từ Backend)
│   │   ├── event.types.ts        # Event DTOs
│   │   ├── venue.types.ts        # Venue DTOs
│   │   └── order.types.ts        # Order & Payment DTOs
│   └── index.ts                  # Centralized type exports
│
├── hooks/                        # Custom React hooks
│   └── use-auth.ts
│
├── utils/                        # Utility functions
│
├── .env.local                    # Environment variables (không commit)
├── .env.example                  # Environment template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🎨 Route Groups - Giải thích chi tiết

### ❓ Tại sao dùng `(auth)`, `(root)`, `(admin)`?

**Route Groups** trong Next.js 15 là folders có tên trong dấu ngoặc đơn `()`. Chúng:

1. **KHÔNG ảnh hưởng đến URL path**
   - `app/(auth)/login/page.tsx` → URL: `/login` (không phải `/(auth)/login`)
   - `app/(root)/events/page.tsx` → URL: `/events` (không phải `/(root)/events`)

2. **Chỉ dùng để tổ chức code và share layouts**
   - Mỗi route group có thể có `layout.tsx` riêng
   - Giúp nhóm các routes có cùng UI pattern

### 📖 Ví dụ cụ thể:

```
app/
├── (auth)/               # Group cho authentication pages
│   ├── layout.tsx        # Layout: centered form, no navbar/footer
│   ├── login/page.tsx    → URL: /login
│   └── register/page.tsx → URL: /register
│
├── (root)/               # Group cho customer pages
│   ├── layout.tsx        # Layout: Navbar + Footer
│   ├── page.tsx          → URL: / (home)
│   └── events/page.tsx   → URL: /events
│
└── (admin)/              # Group cho admin pages
    ├── layout.tsx        # Layout: Sidebar + Header
    └── dashboard/page.tsx → URL: /dashboard
```

### 🎯 Lợi ích:

- **Separation of Concerns**: Auth pages không cần Navbar, Admin pages cần Sidebar
- **Code Organization**: Dễ maintain khi project lớn
- **Layout Inheritance**: Mỗi group có layout riêng nhưng vẫn inherit root layout

## 🔄 Server Components vs Client Components

### 📘 Server Components (Default trong Next.js 15)

**Là gì?** Components render trên server, HTML được gửi về client.

**Khi nào dùng?**
- Fetch data từ database/API
- Không có interactivity (không dùng `useState`, `useEffect`)
- SEO-friendly pages
- Static content

**Ví dụ:**
```tsx
// app/(root)/page.tsx
// Không cần 'use client' → Server Component
export default function HomePage() {
  return <div>Static content</div>;
}
```

### 📱 Client Components (Khi cần interactivity)

**Là gì?** Components chạy trên browser, có thể dùng React hooks.

**Khi nào dùng?**
- Cần `useState`, `useEffect`, hoặc browser APIs
- Event handlers (`onClick`, `onChange`)
- **Ant Design components** (hầu hết cần 'use client')
- Zustand stores, Context

**Ví dụ:**
```tsx
'use client'; // REQUIRED

import { Button } from 'antd';
import { useAuthStore } from '@/store';

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  
  return <Button onClick={() => login()}>Login</Button>;
}
```

### ⚠️ Ant Design LUÔN cần 'use client'

```tsx
// ❌ SAI - Server Component không dùng được Ant Design
export default function Page() {
  return <Button>Click</Button>; // Error!
}

// ✅ ĐÚNG - Phải là Client Component
'use client';

export default function Page() {
  return <Button>Click</Button>; // OK
}
```

### 🔀 Best Practice: Tách logic

**Chiến lược:** Keep page là Server Component, tách interactive parts sang Client Components.

```tsx
// app/(root)/events/page.tsx (Server Component)
import { EventList } from '@/components/event-list';

export default async function EventsPage() {
  // Fetch data on server
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
  const handleClick = () => { /* ... */ };
  
  return (
    <div>
      {events.map(event => (
        <Button onClick={handleClick}>{event.title}</Button>
      ))}
    </div>
  );
}
```

## 🔐 Authentication Flow

1. **User login** → `authService.login()` → Lưu token vào Zustand store
2. **Zustand persist** → Token tự động lưu vào `localStorage`
3. **Axios interceptor** → Tự động gắn token vào mọi request
4. **Token expired (401)** → Auto refresh token
5. **Refresh failed** → Logout user, redirect to `/login`

## 🔔 Real-time Notifications (SignalR)

### Setup

```tsx
import { signalRConnection } from '@/lib/signalr-connection';

// Connect (tự động khi login)
await signalRConnection.connect(token);

// Listen to events
signalRConnection.on('OrderConfirmed', (notification) => {
  console.log('New order confirmed:', notification);
});

// Unsubscribe
const unsubscribe = signalRConnection.on('EventUpdated', handler);
unsubscribe(); // Call khi component unmount
```

### Backend Hub Integration

Backend `.NET` cần có `NotificationHub`:

```csharp
public class NotificationHub : Hub
{
    public async Task SendNotification(string userId, object notification)
    {
        await Clients.User(userId).SendAsync("ReceiveNotification", notification);
    }
}
```

## 🛠️ Environment Variables

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://localhost:7207/api
NEXT_PUBLIC_HUB_URL=https://localhost:7207/hubs/notifications

# App Config
NEXT_PUBLIC_APP_NAME=TicketFlow
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**NOTE:** `NEXT_PUBLIC_` prefix để expose variables cho browser.

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `axios` | HTTP client với interceptors |
| `zustand` | Lightweight state management |
| `antd` | Enterprise UI components |
| `dayjs` | Date handling (required by AntD) |
| `@microsoft/signalr` | Real-time communication |
| `tailwind-merge` | Merge Tailwind classes |
| `lucide-react` | Icon library |

## 🎨 Theme Configuration

Theme được config trong:
- `app/globals.css` → CSS variables
- `providers/antd-provider.tsx` → Ant Design theme tokens

**Color Palette:**
- Primary: `#2563eb` (blue-600)
- Success: `#16a34a` (green-600)
- Error: `#dc2626` (red-600)

## 📝 TypeScript Types

Tất cả types được map từ Backend DTOs:

```tsx
import { EventListDto, LoginResponse } from '@/types';

const events: EventListDto[] = await eventService.getEvents();
const loginRes: LoginResponse = await authService.login(credentials);
```

## 🚦 Next Steps

1. **Implement Event Detail Page** (`app/(root)/events/[id]/page.tsx`)
2. **Build Shopping Cart** (`app/(root)/cart/page.tsx`)
3. **Create Admin Dashboard** (`app/(admin)/dashboard/page.tsx`)
4. **Add Protected Routes** (middleware.ts)
5. **Implement Payment Integration** (VNPay, Momo)

## 📚 Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Ant Design](https://ant.design/)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [SignalR Client](https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client)

---

**Liên hệ:** support@ticketflow.vn
