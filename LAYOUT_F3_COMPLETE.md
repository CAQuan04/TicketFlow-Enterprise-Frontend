# 🎯 DAY F3: HOMEPAGE & LAYOUT - HOÀN THÀNH

**Status**: ✅ COMPLETED  
**Date**: December 27, 2025  
**Components**: Navbar, Footer, Root Layout, Image Config

---

## 📋 OVERVIEW

Đã hoàn thành 4 tasks chính:

1. ✅ **Next.js Image Configuration** - Remote patterns cho localhost, Ngrok, AWS
2. ✅ **Navbar Component** - Client component với hydration fix  
3. ✅ **Footer Component** - Professional 4-column layout
4. ✅ **Root Layout Integration** - Flex layout với sticky navbar

---

## 🔧 TASK 1: NEXT.JS IMAGE CONFIGURATION

### File: `next.config.ts`

**Remote Patterns được thêm**:

```typescript
images: {
  remotePatterns: [
    // Backend API localhost (Development)
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '7207',
      pathname: '/uploads/**',
    },
    
    // Ngrok tunnels (Testing với mobile)
    {
      protocol: 'https',
      hostname: '**.ngrok-free.app',
      pathname: '/**',
    },
    
    // AWS S3 (Future cloud storage)
    {
      protocol: 'https',
      hostname: '**.amazonaws.com',
      pathname: '/**',
    },
    
    // AWS CloudFront CDN
    {
      protocol: 'https',
      hostname: '**.cloudfront.net',
      pathname: '/**',
    },
  ],
}
```

### Tại sao cần remotePatterns?

Next.js Image component tự động optimize images (resize, format, lazy load). Để bảo mật, Next.js CHỈ cho phép load images từ domains được whitelist.

**So sánh với `domains` (deprecated)**:

```typescript
// ❌ OLD (deprecated)
domains: ['localhost', 'example.com']

// ✅ NEW (recommended)
remotePatterns: [
  {
    protocol: 'https',
    hostname: '**.example.com',  // ← Wildcard support
    pathname: '/uploads/**',     // ← Path-specific
  }
]
```

**Benefits**:
- ✅ Wildcard hostnames: `**.ngrok-free.app` matches any subdomain
- ✅ Protocol-specific: http vs https
- ✅ Path restrictions: Only `/uploads/**` allowed
- ✅ More secure và flexible

---

## 🧭 TASK 2: NAVBAR COMPONENT

### File: `components/layout/Navbar.tsx`

**Các tính năng**:

✅ **Responsive Design**:
- Desktop: Full menu với links + auth buttons/avatar
- Mobile: Hamburger menu với slide-down panel

✅ **Auth State Management**:
- Guest: Login + Register buttons
- Logged-in: Avatar dropdown với user menu
- Role-based menu items (Dashboard chỉ cho Admin/Organizer)

✅ **Active Link Highlighting**:
- Sử dụng `usePathname()` để check current route
- Apply gradient text + bottom border cho active link

✅ **Glassmorphism Effect**:
- `backdrop-blur-md`: Blur background
- `bg-white/80`: 80% opacity white
- Sticky positioning với `top-0 z-50`

---

## 🔥 HYDRATION MISMATCH - GIẢI THÍCH CHI TIẾT

### ⚠️ VẤN ĐỀ:

Next.js render component **2 lần**:

1. **Server-Side Render (SSR)**:
   ```
   Server Node.js
   ├─ KHÔNG có window, localStorage, document
   ├─ KHÔNG có user state từ localStorage
   ├─ Zustand store = empty/default
   └─ Render: Guest state (Login/Register buttons)
   ```

2. **Client-Side Hydration**:
   ```
   Browser
   ├─ CÓ access to localStorage
   ├─ Zustand load state từ localStorage
   ├─ User = { id: "123", name: "John" }
   └─ Render: Logged-in state (Avatar dropdown)
   ```

❌ **Kết quả**: Server HTML ≠ Client HTML

```
Server HTML:  <button>Login</button>
Client HTML:  <div>John Doe</div>
              ↓
React Error: "Warning: Text content did not match"
```

---

### ✅ GIẢI PHÁP: useMounted Pattern

**Code Implementation**:

```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true); // ← Chỉ chạy ở client
}, []);

if (!mounted) {
  return <Skeleton />; // ← Server render skeleton
}

return <RealContent />; // ← Client render real content
```

**Flow hoạt động**:

```
┌─────────────────────────────────────────────┐
│ Step 1: Server Render                       │
│ - mounted = false (useState default)        │
│ - Render: <Skeleton /> (simple, consistent) │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Step 2: Client Hydration                    │
│ - React receive HTML from server            │
│ - Compare: <Skeleton /> vs <Skeleton />     │
│ - ✅ Match! No hydration error              │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Step 3: useEffect Runs (client-only)        │
│ - setMounted(true)                          │
│ - Trigger re-render                         │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Step 4: Real Content Render                 │
│ - mounted = true                            │
│ - Access localStorage OK                    │
│ - Render: User avatar with name             │
│ - ✅ No hydration errors!                   │
└─────────────────────────────────────────────┘
```

**Trade-offs**:

| Aspect | Impact |
|--------|--------|
| **Pros** | ✅ No hydration mismatch ever |
| | ✅ Works 100% reliably |
| | ✅ Simple pattern, easy to understand |
| **Cons** | ⚠️ Flash of skeleton (~50ms) |
| | ⚠️ Extra state + useEffect |
| **Verdict** | ✅ Acceptable trade-off |

---

### ❌ Tại sao KHÔNG làm như này:

```typescript
// ❌ WRONG: Access localStorage directly
export function Navbar() {
  const token = localStorage.getItem('token'); // ← Crash on SSR!
  
  return (
    <nav>
      {token ? <Avatar /> : <LoginButton />}
    </nav>
  );
}
// Error: "localStorage is not defined"
```

```typescript
// ❌ WRONG: Check window in render body
export function Navbar() {
  const isClient = typeof window !== 'undefined';
  const token = isClient ? localStorage.getItem('token') : null;
  
  return (
    <nav>
      {token ? <Avatar /> : <LoginButton />}
    </nav>
  );
}
// Server: renders <LoginButton />
// Client: renders <Avatar />
// Error: Hydration mismatch!
```

---

## 🎨 TASK 3: FOOTER COMPONENT

### File: `components/layout/Footer.tsx`

**Layout Structure**:

```
┌──────────────────────────────────────────────────────┐
│ [Logo + About]  [Quick Links]  [Contact]  [Social]   │
│                                                       │
│ - Company intro - Events       - Email    - Facebook │
│ - Mission       - My Tickets   - Phone    - Twitter  │
│                 - Support      - Address  - Instagram│
│                 - About                   - YouTube  │
├──────────────────────────────────────────────────────┤
│ © 2025 TicketFlow. All rights reserved.              │
│ Terms | Privacy | Cookies | Sitemap                  │
└──────────────────────────────────────────────────────┘
```

**Responsive Breakpoints**:

- **Mobile** (< 768px): 1 column, stacked
- **Tablet** (768px - 1024px): 2 columns
- **Desktop** (> 1024px): 4 columns

**Features**:

✅ **4 Sections**:
1. About: Company info + tagline
2. Quick Links: Navigation (Events, Tickets, Support, Terms, Privacy)
3. Contact: Email, Phone, Address với icons
4. Social Media: FB, Twitter, IG, YouTube với hover scale effect

✅ **Dark Theme**:
- Background: `bg-gray-900`
- Text: `text-gray-300` → `hover:text-blue-400`
- Icons: `text-blue-500` for accent

✅ **SEO Benefits**:
- Internal links (improve site structure)
- Contact info (local business signals)
- Social profiles (authority signals)
- Copyright notice (trust + legal)

---

## 🏗️ TASK 4: ROOT LAYOUT INTEGRATION

### File: `app/(root)/layout.tsx`

**Layout Structure**:

```typescript
<div className="flex min-h-screen flex-col">
  <Navbar />              {/* ← Sticky top */}
  <main className="flex-1"> {/* ← Grows to fill space */}
    {children}
  </main>
  <Footer />              {/* ← Always at bottom */}
</div>
```

**CSS Explanation**:

```css
/* Container */
.flex         /* Flexbox layout */
.min-h-screen /* Minimum 100vh height */
.flex-col     /* Stack vertically */

/* Main Content */
.flex-1       /* Flex-grow: 1 (Fill available space) */
              /* Pushes footer to bottom even with little content */
```

**Visual Flow**:

```
┌─────────────────────────┐
│       Navbar            │ ← height: auto (64px)
│   (Sticky position)     │
├─────────────────────────┤
│                         │
│                         │
│       Content           │ ← flex: 1 (Grows to fill)
│       {children}        │
│                         │
│                         │
├─────────────────────────┤
│       Footer            │ ← height: auto (~300px)
└─────────────────────────┘
           ↑
      min-h-screen (100vh minimum)
```

**Container Strategy**:

❌ **KHÔNG** add container ở layout level vì:
- Một số pages cần full-width (Hero, banners)
- Mỗi page tự control container theo design

✅ **Pages tự control**:

```typescript
// Full-width page
export default function HeroPage() {
  return <div className="w-full">{/* Full width */}</div>;
}

// Contained page
export default function ContentPage() {
  return <div className="container mx-auto px-4">{/* Contained */}</div>;
}

// Mixed layout
export default function MixedPage() {
  return (
    <>
      <div className="w-full">{/* Full-width hero */}</div>
      <div className="container mx-auto px-4">{/* Contained content */}</div>
    </>
  );
}
```

---

## 🧪 TESTING GUIDE

### Test 1: Hydration Check (CRITICAL!)

**Steps**:

1. Clear localStorage:
   ```javascript
   localStorage.clear();
   ```

2. Refresh page: `http://localhost:3000`

3. Open DevTools Console

4. **Expected**:
   - ✅ No hydration warnings
   - ✅ Skeleton flashes for ~50ms
   - ✅ Then shows Login/Register buttons
   - ✅ No "Text content did not match" errors

5. **If errors appear**:
   - Check `mounted` state implementation
   - Verify no direct localStorage access in render body
   - Ensure skeleton HTML is simple and consistent

---

### Test 2: Guest State

**Prerequisites**: Not logged in

**Steps**:

1. Navigate to: `http://localhost:3000`

2. **Check Navbar**:
   - ✅ Logo: "TicketFlow" với Ticket icon
   - ✅ Nav links: Sự kiện, Giới thiệu, Liên hệ
   - ✅ Right side: "Đăng nhập" + "Đăng ký" buttons

3. **Check Footer**:
   - ✅ 4 columns visible (desktop)
   - ✅ All links clickable
   - ✅ Social icons with hover effect
   - ✅ Copyright notice: "© 2025 TicketFlow"

---

### Test 3: Logged-in State

**Prerequisites**: Login với account

**Steps**:

1. Login at: `http://localhost:3000/login`

2. After login, check Navbar:
   - ✅ Avatar with first letter of name
   - ✅ Name visible (desktop only)
   - ✅ Click avatar → Dropdown opens

3. **Check Dropdown Menu**:
   - ✅ "Vé của tôi" → `/booking/my-tickets`
   - ✅ "Thông tin cá nhân" → `/profile`
   - ✅ "Dashboard" (if Admin/Organizer) → `/dashboard`
   - ✅ "Đăng xuất" (red text)

4. Click "Đăng xuất":
   - ✅ Toast: "Đã đăng xuất thành công"
   - ✅ Redirect to `/login`
   - ✅ Navbar switches to guest state

---

### Test 4: Active Link Highlighting

**Steps**:

1. Navigate to: `http://localhost:3000`
   - ✅ "TicketFlow" logo highlighted (/)

2. Click "Sự kiện":
   - ✅ "Sự kiện" has gradient text
   - ✅ Blue underline appears
   - ✅ URL: `/events`

3. Click "Giới thiệu":
   - ✅ "Giới thiệu" highlighted
   - ✅ "Sự kiện" no longer highlighted
   - ✅ Underline moves smoothly

4. Navigate back to Home:
   - ✅ Logo highlighted again
   - ✅ Nav links normal color

---

### Test 5: Responsive Mobile Menu

**Steps**:

1. Resize browser to mobile width (<768px)

2. **Check Navbar**:
   - ✅ Hamburger icon (☰) appears
   - ✅ Nav links hidden
   - ✅ Only avatar/login buttons visible

3. Click Hamburger icon:
   - ✅ Menu slides down
   - ✅ Shows: Events, About, Contact
   - ✅ Shows auth section (Login/Register or User menu)

4. Click any link:
   - ✅ Navigate to page
   - ✅ Menu auto-closes

5. Click outside menu:
   - ✅ Menu closes

---

### Test 6: Footer Links

**Steps**:

1. Scroll to footer

2. Click "Sự kiện":
   - ✅ Navigate to `/events`

3. Click "Vé của tôi":
   - ✅ Navigate to `/booking/my-tickets`
   - ✅ If not logged in: Redirect to `/login`

4. Click Email link:
   - ✅ Opens email client: `mailto:support@ticketflow.vn`

5. Click Phone link:
   - ✅ Opens dialer: `tel:+84123456789` (mobile)

6. Click Social icons:
   - ✅ Facebook → Opens new tab
   - ✅ Twitter → Opens new tab
   - ✅ Instagram → Opens new tab
   - ✅ YouTube → Opens new tab
   - ✅ Hover effect: Scale 1.1

---

### Test 7: Sticky Navbar

**Steps**:

1. Navigate to page with long content

2. Scroll down slowly:
   - ✅ Navbar stays at top (sticky)
   - ✅ Backdrop blur visible over content
   - ✅ Border-bottom visible

3. Scroll back up:
   - ✅ Navbar still sticky
   - ✅ No jump or layout shift

---

### Test 8: Role-based Menu

**Test as Customer**:

1. Login as Customer account

2. Click avatar → Dropdown:
   - ✅ "Vé của tôi"
   - ✅ "Thông tin cá nhân"
   - ❌ NO "Dashboard" (hidden)
   - ✅ "Đăng xuất"

**Test as Admin**:

1. Login as Admin account

2. Click avatar → Dropdown:
   - ✅ "Vé của tôi"
   - ✅ "Thông tin cá nhân"
   - ✅ "Dashboard" (visible!)
   - ✅ "Đăng xuất"

**Test as Organizer**:

1. Login as Organizer account

2. Click avatar → Dropdown:
   - ✅ "Vé của tôi"
   - ✅ "Thông tin cá nhân"
   - ✅ "Dashboard" (visible!)
   - ✅ "Đăng xuất"

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: Hydration Mismatch

**Symptom**: Console error "Text content did not match"

**Causes**:
1. Accessing localStorage directly in render
2. `mounted` state not implemented
3. Inconsistent server vs client HTML

**Solution**:

```typescript
// ✅ CORRECT
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <Skeleton />;
}

return <RealContent />;
```

---

### Issue 2: Navbar Not Sticky

**Symptom**: Navbar scrolls away instead of staying at top

**Solution**: Check CSS classes

```tsx
// ✅ CORRECT
<nav className="sticky top-0 z-50">
  
// ❌ WRONG
<nav className="fixed top-0"> {/* Fixed causes overlay issues */}
```

---

### Issue 3: Footer Not at Bottom

**Symptom**: Footer floats in middle of page với little content

**Solution**: Check flex layout

```tsx
// ✅ CORRECT
<div className="flex min-h-screen flex-col">
  <main className="flex-1"> {/* flex-1 grows! */}

// ❌ WRONG
<div className="min-h-screen"> {/* No flex */}
  <main> {/* No flex-1 */}
```

---

### Issue 4: Mobile Menu Not Closing

**Symptom**: Click link, menu stays open

**Solution**: Add onClick handler

```tsx
// ✅ CORRECT
<Link 
  href="/events"
  onClick={() => setMobileMenuOpen(false)}
>

// ❌ WRONG
<Link href="/events"> {/* Missing onClick */}
```

---

### Issue 5: Avatar Không Hiện

**Symptom**: Logged in nhưng không thấy avatar

**Debug Steps**:

1. Check localStorage:
   ```javascript
   console.log(localStorage.getItem('auth-storage'));
   ```

2. Check Zustand state:
   ```javascript
   import { useAuthStore } from '@/store/auth.store';
   const { user, isAuthenticated } = useAuthStore();
   console.log({ user, isAuthenticated });
   ```

3. Check mounted state:
   ```javascript
   console.log('Mounted:', mounted);
   ```

**Common Causes**:
- Tokens expired
- localStorage cleared
- `mounted` still false
- User object malformed

---

### Issue 6: Dropdown Menu Không Mở

**Symptom**: Click avatar, nothing happens

**Debug**:

```typescript
// Check Ant Design Dropdown props
<Dropdown 
  menu={{ items: menuItems }}  // ← Check items not empty
  placement="bottomRight"
  trigger={['click']}          // ← Check trigger type
>
```

**Solution**: Verify `menuItems` array có data

---

### Issue 7: Active Link Không Highlight

**Symptom**: Navigate to /events, link không highlight

**Debug**:

```typescript
const pathname = usePathname();
console.log('Current path:', pathname);

const isActive = (path) => {
  const active = pathname.startsWith(path);
  console.log(`${path} active:`, active);
  return active;
};
```

**Common Issue**: Homepage `/` matches all paths

**Solution**:

```typescript
const isActive = (path: string) => {
  if (path === '/') {
    return pathname === '/'; // ← Exact match for home
  }
  return pathname.startsWith(path);
};
```

---

## 📊 FILES SUMMARY

| File | Lines | Description |
|------|-------|-------------|
| `next.config.ts` | ~120 | Image remote patterns config |
| `components/layout/Navbar.tsx` | ~450 | Navbar với hydration fix |
| `components/layout/Footer.tsx` | ~180 | Professional footer 4-column |
| `app/(root)/layout.tsx` | ~100 | Root layout integration |

**Total New Code**: ~850 lines

---

## 🎯 ARCHITECTURE DECISIONS

### 1. Tại sao Client Component cho Navbar?

```typescript
'use client'; // ← Required!
```

**Lý do**:
- Cần access localStorage (browser API)
- Cần event handlers (onClick, dropdown)
- Cần useEffect hooks
- Server Components không support những features này

---

### 2. Tại sao KHÔNG add container ở Layout?

❌ **WRONG**:

```typescript
<main className="container mx-auto px-4">
  {children}
</main>
```

**Problems**:
- All pages forced into container
- Hero sections can't be full-width
- Banners, images constrained

✅ **CORRECT**: Let pages control their own container

---

### 3. Tại sao dùng flex-1 thay vì height 100%?

```css
/* ✅ GOOD: flex-1 */
.flex-1 { flex: 1 1 0%; } /* Grows to fill space */

/* ❌ BAD: height 100% */
.h-full { height: 100%; } /* Needs parent height */
```

**flex-1 Benefits**:
- Auto-grows to available space
- Pushes footer down
- Works with dynamic content
- No height calculation needed

---

## ✅ COMPLETION CHECKLIST

- [x] Next.js Image remotePatterns configured
- [x] Navbar component with responsive design
- [x] Hydration fix với useMounted pattern
- [x] Active link highlighting
- [x] Auth state management (guest/logged-in)
- [x] Role-based menu items
- [x] Mobile hamburger menu
- [x] Footer with 4 sections
- [x] Social media links with hover effects
- [x] Root layout với flex column
- [x] Sticky navbar positioning
- [x] Footer always at bottom
- [x] Testing guide comprehensive
- [x] Common issues documented

---

## 🚀 NEXT STEPS (Day F4)

### Priority 1: Homepage Content

1. **Hero Section**:
   - Large banner với search bar
   - "Find your next event" headline
   - Background gradient/image
   - CTA buttons

2. **Featured Events Section**:
   - Grid of event cards (3-4 columns)
   - Event image, title, date, location, price
   - "View all events" button

3. **Stats Section**:
   - Total users, events, tickets sold
   - Animated counters
   - Trust indicators

4. **Categories Section**:
   - Music, Sports, Conference, Theater
   - Icon cards với hover effects
   - Quick navigation

### Priority 2: Events Listing Page

1. **Filter Sidebar**:
   - Category, Date, Price range, Location
   - Apply filters button

2. **Events Grid**:
   - Responsive card layout
   - Lazy loading với pagination
   - Sort options (Date, Price, Popularity)

3. **Search Functionality**:
   - Debounced search input
   - Search by name, location, category

---

**Day F3 - Homepage & Layout: HOÀN THÀNH! 🎉**

Layout foundation đã sẵn sàng. Navbar với hydration fix work perfect. Footer professional và responsive. Next.js image optimization configured. Ready to build homepage content!

**Dev Server**: http://localhost:3000  
**Routes**:
- Home: http://localhost:3000/
- Login: http://localhost:3000/login (Has navbar + footer now!)
- Register: http://localhost:3000/register

---

*Generated: Day F3 - December 27, 2025*  
*Project: TicketFlow - Next.js 16.1.1 + React 19*  
*Features: Navbar, Footer, Layout, Hydration Fix, Image Config*
