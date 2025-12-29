# 🎯 Event Display - Test Guide

## 📚 Tổng Quan

Implementation hoàn chỉnh cho **Event Display Layer** bao gồm:
1. ✅ TypeScript Types (EventListDto, PagedResult)
2. ✅ API Service với Smart Logic (AI recommendations cho logged-in users)
3. ✅ Utils Helpers (getImageUrl, formatCurrency, formatDate)
4. ✅ EventCard Component với Skeleton loading state

---

## 🧪 Testing Instructions

### **Test 1: Event Service - Get Events with Pagination**

```typescript
// File: app/events/page.tsx (Test page)
'use client';

import { useEffect, useState } from 'react';
import { eventService } from '@/services/api/event.service';
import { EventListDto, PagedResult } from '@/types';
import { EventCard, EventCardSkeleton } from '@/components/events/EventCard';

export default function EventsTestPage() {
  const [events, setEvents] = useState<PagedResult<EventListDto> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const result = await eventService.getEvents({
          pageIndex: 1,
          pageSize: 12,
          searchTerm: '', // Test search
        });
        
        console.log('✅ Events fetched:', result);
        setEvents(result);
      } catch (error) {
        console.error('❌ Fetch failed:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!events || events.items.length === 0) {
    return <div className="p-8 text-center">Không có sự kiện nào</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Events (Page {events.pageIndex} / {events.totalPages})
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.items.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      
      <div className="mt-8 text-center text-gray-600">
        Total: {events.totalCount} events
      </div>
    </div>
  );
}
```

**Expected Results:**
- ✅ Loading skeleton hiển thị ban đầu
- ✅ Cards hiển thị với image, date, venue, price
- ✅ Hover effect: scale + shadow
- ✅ Console log: PagedResult object với items array

---

### **Test 2: Smart Featured Events (AI vs Guest)**

```typescript
// File: app/test-featured/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { eventService } from '@/services/api/event.service';
import { EventListDto } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { useAuthStore } from '@/store';

export default function FeaturedEventsTest() {
  const [events, setEvents] = useState<EventListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const result = await eventService.getFeaturedEvents();
        console.log('✅ Featured events:', result);
        console.log('👤 User auth status:', isAuthenticated ? 'Logged In' : 'Guest');
        setEvents(result);
      } catch (error) {
        console.error('❌ Fetch failed:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFeatured();
  }, [isAuthenticated]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {isAuthenticated ? '🤖 AI Recommendations' : '👤 Top Upcoming Events'}
        </h1>
        {user && (
          <p className="text-gray-600">For: {user.fullName}</p>
        )}
      </div>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} priority />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Test Scenarios:**
1. **Guest User:**
   - Mở trang chưa đăng nhập
   - Console log: "👤 Guest user, fetching top upcoming events"
   - API call: `GET /api/events?pageIndex=1&pageSize=5`

2. **Logged-In User:**
   - Đăng nhập
   - Console log: "🤖 Fetching AI recommendations for logged-in user"
   - API call: `GET /api/events/recommendations`
   - Nếu API fail: Fallback to upcoming events

---

### **Test 3: Image URL Helper**

```typescript
// File: lib/__tests__/utils.test.ts (hoặc test trực tiếp trong console)

import { getImageUrl } from '@/lib/utils';

// Test cases
console.log('Test 1 - Full URL:', 
  getImageUrl('https://example.com/image.jpg')
); // Expected: https://example.com/image.jpg

console.log('Test 2 - Relative path:', 
  getImageUrl('/uploads/event.jpg')
); // Expected: https://localhost:7207/uploads/event.jpg

console.log('Test 3 - Null path:', 
  getImageUrl(null)
); // Expected: /assets/placeholder.jpg

console.log('Test 4 - API URL with trailing slash:', 
  getImageUrl('/uploads/event.jpg') // NEXT_PUBLIC_API_URL = 'https://localhost:7207/'
); // Expected: https://localhost:7207/uploads/event.jpg (không có double slash)
```

**Expected Results:**
- ✅ Full URL return as-is
- ✅ Relative path ghép với API base URL
- ✅ Null trả về placeholder
- ✅ Không có double slash: `/api//uploads`

---

### **Test 4: Event Card Component**

1. **Visual Test:**
   - Card có border-radius và shadow
   - Image có aspect ratio 4:3
   - Hover effect: card lift + scale image
   - Price badge ở góc trên phải
   - Icons (Calendar, MapPin, Ticket) hiển thị đúng

2. **Responsive Test:**
   - Mobile: 1 column
   - Tablet: 2 columns
   - Desktop: 3 columns

3. **Click Test:**
   - Click card → Navigate to `/events/{id}`
   - Check URL trong browser

---

### **Test 5: Date & Currency Format**

```typescript
import dayjs from 'dayjs';
import { formatCurrency } from '@/lib/utils';

// Test date format
const testDate = '2024-01-15T19:00:00Z';
console.log('Formatted date:', dayjs(testDate).format('DD MMM YYYY, HH:mm'));
// Expected: "15 Jan 2024, 19:00"

// Test currency format
console.log('Price 100k:', formatCurrency(100000));
// Expected: "100.000 ₫"

console.log('Price 1.5M:', formatCurrency(1500000));
// Expected: "1.500.000 ₫"

console.log('Free event:', formatCurrency(0));
// Expected: "0 ₫" (hoặc logic: nếu 0 → "Miễn phí")
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module '@/lib/utils'"
**Solution:** Check tsconfig.json có paths alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue 2: Image không load (403 Forbidden)
**Solution:** 
1. Check CORS trong Backend
2. Check `NEXT_PUBLIC_API_URL` trong `.env.local`
3. Thử placeholder: `/assets/placeholder.jpg`

### Issue 3: "useAuthStore is not a function"
**Solution:** EventService import store correctly:
```typescript
import { useAuthStore } from '@/store';
const isAuth = useAuthStore.getState().isAuthenticated;
```

### Issue 4: Pagination pageIndex vs page
**Solution:** Backend dùng `pageIndex` (1-based), không phải `page`:
```typescript
// ✅ Correct
await eventService.getEvents({ pageIndex: 1 });

// ❌ Wrong
await eventService.getEvents({ page: 1 });
```

---

## 📊 Performance Checklist

- [ ] next/image optimization enabled
- [ ] Skeleton loading state for UX
- [ ] Error boundaries for API failures
- [ ] Debounce search input (nếu có search)
- [ ] Lazy load images below fold
- [ ] Cache API responses (React Query / SWR)

---

## 🎨 Styling Verification

1. **Card Shadow:**
   - Default: `shadow-md`
   - Hover: `shadow-2xl`

2. **Image Hover:**
   - Transform: `scale-110`
   - Duration: `300ms`

3. **Colors:**
   - Blue: `#3B82F6` (primary)
   - Gray: `#6B7280` (secondary text)
   - Red: `#EF4444` (MapPin icon)

---

## 🚀 Integration Checklist

- [ ] Types exported từ `@/types`
- [ ] eventService exported từ `@/services/api/event.service`
- [ ] Utils exported từ `@/lib/utils`
- [ ] EventCard exported từ `@/components/events/EventCard`
- [ ] dayjs installed: `npm install dayjs`
- [ ] lucide-react icons: `npm install lucide-react`

---

## 📝 Next Steps

Sau khi test xong, implement:
1. Event Detail Page (`/events/[id]`)
2. Event Browse Page với Search & Filters
3. Pagination Component
4. Event Category Filter
5. Date Range Picker

---

**Happy Testing! 🎉**
