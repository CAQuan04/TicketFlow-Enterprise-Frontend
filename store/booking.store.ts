/**
 * ============================================
 * BOOKING STORE (ZUSTAND + PERSIST)
 * ============================================
 * 
 * Quản lý giỏ hàng/đơn đặt vé trong quá trình checkout
 * 
 * Features:
 * - Multi-item support (nhiều loại vé cùng lúc)
 * - Validation: Tất cả items phải cùng eventId
 * - Persist vào localStorage (giữ data khi refresh)
 * - Calculate tổng tiền, tổng số lượng
 * - Auto-clear sau khi thanh toán
 * 
 * Backend requirement:
 * - POST /api/orders chỉ chấp nhận items từ 1 event
 * - Nếu thêm ticket từ event khác → Clear cart cũ
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * ============================================
 * BOOKING ITEM TYPE
 * ============================================
 * 
 * Thông tin của 1 loại vé trong giỏ hàng
 */
export interface BookingItem {
  ticketTypeId: string;      // ID của loại vé
  ticketTypeName: string;    // Tên loại vé (VIP, Standard, ...)
  quantity: number;          // Số lượng vé
  price: number;             // Giá mỗi vé (VND)
  
  // Event info (để hiển thị trong checkout)
  eventId: string;           // ID sự kiện
  eventName: string;         // Tên sự kiện
  eventDate: string;         // Ngày sự kiện (ISO string)
  eventVenue: string;        // Địa điểm
  eventCoverImage?: string;  // Ảnh cover (optional)
}

/**
 * ============================================
 * BOOKING STORE STATE
 * ============================================
 */
interface BookingStore {
  // State
  items: BookingItem[];           // Danh sách vé trong giỏ
  eventId: string | null;         // Event hiện tại (để validate)
  
  // Actions
  addItem: (item: BookingItem) => void;              // Thêm vé
  removeItem: (ticketTypeId: string) => void;        // Xóa vé
  updateQuantity: (ticketTypeId: string, quantity: number) => void; // Cập nhật số lượng
  clearBooking: () => void;                          // Xóa toàn bộ giỏ hàng
  
  // Getters (computed values)
  getTotalAmount: () => number;                      // Tổng tiền
  getTotalQuantity: () => number;                    // Tổng số vé
  isValidBooking: () => boolean;                     // Kiểm tra giỏ hàng hợp lệ
}

/**
 * ============================================
 * CREATE STORE
 * ============================================
 */
export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      /**
       * ============================================
       * INITIAL STATE
       * ============================================
       */
      items: [],
      eventId: null,

      /**
       * ============================================
       * ADD ITEM TO BOOKING
       * ============================================
       * 
       * Logic:
       * 1. Nếu items rỗng → Thêm vào
       * 2. Nếu item.eventId khác eventId hiện tại → Clear cart cũ, thêm mới
       * 3. Nếu ticketTypeId đã tồn tại → Cộng dồn quantity
       * 4. Nếu ticketTypeId chưa có → Thêm mới
       */
      addItem: (item: BookingItem) => {
        const { items, eventId } = get();

        // Validate: Nếu đang có items từ event khác → Clear và thay thế
        if (eventId && eventId !== item.eventId) {
          console.warn('⚠️ Adding ticket from different event. Clearing cart.');
          set({
            items: [item],
            eventId: item.eventId,
          });
          return;
        }

        // Kiểm tra xem ticketTypeId đã tồn tại chưa
        const existingIndex = items.findIndex(
          (i) => i.ticketTypeId === item.ticketTypeId
        );

        if (existingIndex >= 0) {
          // Đã tồn tại → Cộng dồn quantity
          const newItems = [...items];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + item.quantity,
          };
          set({ items: newItems });
          console.log('✅ Updated quantity:', newItems[existingIndex]);
        } else {
          // Chưa tồn tại → Thêm mới
          set({
            items: [...items, item],
            eventId: item.eventId,
          });
          console.log('✅ Added new item to booking');
        }
      },

      /**
       * ============================================
       * REMOVE ITEM FROM BOOKING
       * ============================================
       */
      removeItem: (ticketTypeId: string) => {
        const newItems = get().items.filter((i) => i.ticketTypeId !== ticketTypeId);
        
        set({
          items: newItems,
          eventId: newItems.length > 0 ? get().eventId : null,
        });
        
        console.log('🗑️ Removed item from booking');
      },

      /**
       * ============================================
       * UPDATE QUANTITY
       * ============================================
       * 
       * Nếu quantity = 0 → Remove item
       */
      updateQuantity: (ticketTypeId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(ticketTypeId);
          return;
        }

        const { items } = get();
        const newItems = items.map((item) =>
          item.ticketTypeId === ticketTypeId 
            ? { ...item, quantity } 
            : item
        );
        
        set({ items: newItems });
        console.log('🔄 Updated quantity');
      },

      /**
       * ============================================
       * CLEAR BOOKING
       * ============================================
       * 
       * Gọi sau khi thanh toán thành công
       */
      clearBooking: () => {
        set({ items: [], eventId: null });
        console.log('🧹 Booking cleared');
      },

      /**
       * ============================================
       * GET TOTAL AMOUNT
       * ============================================
       * 
       * Tính tổng tiền của tất cả items
       */
      getTotalAmount: () => {
        return get().items.reduce(
          (total, item) => total + (item.price * item.quantity), 
          0
        );
      },

      /**
       * ============================================
       * GET TOTAL QUANTITY
       * ============================================
       * 
       * Tính tổng số vé
       */
      getTotalQuantity: () => {
        return get().items.reduce(
          (total, item) => total + item.quantity, 
          0
        );
      },

      /**
       * ============================================
       * IS VALID BOOKING
       * ============================================
       * 
       * Kiểm tra giỏ hàng hợp lệ:
       * - Có ít nhất 1 item
       * - Tất cả items cùng eventId
       */
      isValidBooking: () => {
        const { items, eventId } = get();
        
        if (items.length === 0) return false;
        if (!eventId) return false;
        
        // Validate tất cả items cùng eventId
        const allSameEvent = items.every((item) => item.eventId === eventId);
        
        return allSameEvent;
      },
    }),
    {
      name: 'ticketflow-booking', // Key trong localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * ============================================
 * USAGE EXAMPLE
 * ============================================
 * 
 * // Trong TicketSelector component
 * const { addItem } = useBookingStore();
 * 
 * const handleCheckout = () => {
 *   addItem({
 *     ticketTypeId: '123',
 *     ticketTypeName: 'VIP',
 *     quantity: 2,
 *     price: 500000,
 *     eventId: 'event-123',
 *     eventName: 'Concert ABC',
 *     eventDate: '2024-12-31T19:00:00Z',
 *     eventVenue: 'My Dinh Stadium',
 *   });
 *   
 *   router.push('/booking');
 * };
 * 
 * // Trong Checkout page
 * const { items, getTotalAmount, clearBooking } = useBookingStore();
 * 
 * const handlePayment = async () => {
 *   await paymentService.createOrder(items);
 *   clearBooking(); // Clear sau khi thành công
 *   router.push('/success');
 * };
 */
