# F7.1: TICKET SERVICE & TYPES - HOÀN THÀNH ✅

## 📁 Files Created

1. **`types/dtos/ticket.types.ts`** - Type definitions
2. **`services/api/ticket.service.ts`** - Service layer với Mock fallback

## 🏗️ KIẾN TRÚC: FLAT LIST PATTERN

### Tại sao cần Flat List?

**Backend Structure (Nested):**
```typescript
Orders[] = [
  {
    orderId: "order-1",
    tickets: [
      { id: "ticket-1", eventName: "BLACKPINK" },
      { id: "ticket-2", eventName: "BLACKPINK" }
    ]
  },
  {
    orderId: "order-2",
    tickets: [
      { id: "ticket-3", eventName: "Sơn Tùng M-TP" }
    ]
  }
]
```

**Frontend Structure (Flat):**
```typescript
Tickets[] = [
  { id: "ticket-1", eventName: "BLACKPINK", orderId: "order-1" },
  { id: "ticket-2", eventName: "BLACKPINK", orderId: "order-1" },
  { id: "ticket-3", eventName: "Sơn Tùng M-TP", orderId: "order-2" }
]
```

### Lợi ích Flat List:

✅ **UI đơn giản**: Render từng ticket riêng lẻ, không cần nested loop  
✅ **Filter dễ dàng**: "Show only Active tickets" - 1 dòng `.filter()`  
✅ **Sort nhanh**: Sắp xếp theo date mà không cần group  
✅ **Performance tốt**: Long list không bị nested hierarchy  
✅ **Component logic đơn giản**: Không cần quản lý 2 levels (order + ticket)

### Implementation trong Service Layer:

```typescript
// Service layer tự động flatten
const orders = response.data.orders;

const flatTickets = orders.flatMap(order => {
  return order.tickets.map(ticket => ({
    ...ticket,
    orderId: order.id,  // Enrich với order metadata
    orderNumber: order.orderNumber
  }));
});
```

Frontend chỉ cần:
```typescript
const tickets = await ticketService.getMyTickets();
tickets.map(ticket => <TicketCard ticket={ticket} />)
```

## 🎭 MOCK MODE

### Bật Mock Mode:

**Option 1: Environment Variable (Recommended)**
```env
# .env.local
NEXT_PUBLIC_USE_MOCK_TICKETS=true
```

**Option 2: Explicit Parameter**
```typescript
const tickets = await ticketService.getMyTickets(true); // Force mock
```

### Mock Data Quality:

Mock data được thiết kế realistic với **sự kiện Việt Nam thật**:

| Ticket | Event | Venue | Status | Price |
|--------|-------|-------|--------|-------|
| 1 | BLACKPINK BORN PINK - HÀ NỘI | Sân vận động Mỹ Đình | Active | 3.5M VND |
| 2 | COUNTDOWN TẾT NGUYÊN ĐÁN | Quảng trường Đông Kinh Nghĩa Thục | Active | 500K VND |
| 3 | SƠN TÙNG M-TP SKY TOUR | Nhà thi đấu Phú Thọ | Used | 2M VND |
| 4 | HÒA MINZY LIVE SHOW | Ariyana Đà Nẵng | Cancelled | 800K VND |
| 5 | VĂN MAI HƯƠNG ACOUSTIC | Nhà hát Hòa Bình | Active | 1.5M VND |

**3 states covered:**
- ✅ **2 Active tickets** (future events) - để test booking flow
- ✅ **1 Used ticket** (with check-in info) - để test history display
- ✅ **1 Cancelled ticket** - để test refund/cancel state

## 📋 TYPE DEFINITIONS

### TicketDto Interface

```typescript
interface TicketDto {
  // Identity
  id: string;
  ticketCode: string; // For QR generation
  
  // Event Info
  eventName: string;
  eventId: string;
  venueName: string;
  venueAddress: string;
  startDateTime: string; // ISO format
  
  // Ticket Details
  ticketTypeName: string; // "VIP", "GA", "Premium"
  seatName?: string; // "Hàng A - Số 15"
  price: number;
  
  // Status & Linking
  status: 'Active' | 'Used' | 'Cancelled';
  orderId: string;
  orderNumber?: string;
  
  // Media
  coverImageUrl?: string;
  
  // Check-in (if Used)
  checkInTime?: string;
  checkInGate?: string;
  
  // Timestamps
  purchasedAt: string;
  validUntil?: string;
}
```

## 🔌 SERVICE METHODS

### 1. getMyTickets()

```typescript
const tickets = await ticketService.getMyTickets();
// Returns: TicketDto[] (flat array)
```

**Features:**
- ✅ Auto flatten nested Orders → Tickets
- ✅ Mock fallback với 500ms delay
- ✅ Xử lý 3 response formats (flat array, nested orders, paginated)
- ✅ Error handling với detailed logging

### 2. getTicketById()

```typescript
const ticket = await ticketService.getTicketById('ticket-001');
// Returns: TicketDto (single ticket)
```

### 3. filterByStatus() (Client-side)

```typescript
const activeTickets = ticketService.filterByStatus(tickets, 'Active');
```

### 4. sortByDate() (Client-side)

```typescript
const sortedTickets = ticketService.sortByDate(tickets, 'desc');
// Newest first
```

## 🧪 TESTING

### Test với Mock Data:

```typescript
'use client';

import { ticketService } from '@/services/api';
import { useEffect, useState } from 'react';

export default function TestTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Force mock mode
        const data = await ticketService.getMyTickets(true);
        setTickets(data);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Tickets ({tickets.length})</h1>
      {tickets.map(ticket => (
        <div key={ticket.id}>
          <h3>{ticket.eventName}</h3>
          <p>Status: {ticket.status}</p>
          <p>Venue: {ticket.venueName}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🚀 NEXT STEPS (F7.2)

Với Data Layer đã hoàn chỉnh, giờ có thể implement UI:

1. **My Tickets Page** (`/my-tickets`)
   - List view với filter (All/Active/Used/Cancelled)
   - Ticket cards với status badge
   - Empty state cho từng status

2. **Ticket Detail Modal**
   - Full ticket info
   - QR code generation (dùng `ticketCode`)
   - Download/Print button

3. **Components**
   - `<TicketCard />` - Card component
   - `<TicketStatus />` - Status badge
   - `<QRCodeDisplay />` - QR code với ticketCode

## 📚 ARCHITECTURE NOTES

### Tại sao không fetch trực tiếp từ Component?

❌ **Bad (Component fetch trực tiếp):**
```typescript
// Component.tsx
const response = await axios.get('/api/tickets');
const orders = response.data.orders;
const tickets = orders.flatMap(o => o.tickets); // Logic in component
```

✅ **Good (Service layer abstraction):**
```typescript
// Component.tsx
const tickets = await ticketService.getMyTickets(); // Clean, simple
```

**Lý do:**
- **Separation of Concerns**: Component chỉ quan tâm UI, không quan tâm data structure
- **Reusability**: Logic flatten dùng lại ở nhiều nơi
- **Testing**: Dễ mock service hơn là mock axios
- **Maintainability**: Nếu Backend đổi structure, chỉ sửa 1 chỗ (service layer)

### Tại sao Mock trong Service chứ không Component?

✅ **Advantages:**
- Test component với data thật (realistic)
- Mock data consistent across all components
- Dễ switch giữa mock/real (1 env var)
- QA/Designer test được UI mà không cần Backend

---

**Status**: ✅ F7.1 COMPLETE - Ready for UI Implementation (F7.2)
