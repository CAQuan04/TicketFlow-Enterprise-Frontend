import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OrderTicketItem } from '@/types';

/**
 * Cart Store (Zustand)
 * Quản lý giỏ hàng khi user chọn tickets
 * 
 * Features:
 * - Add/Remove tickets
 * - Calculate total amount
 * - Persist cart vào localStorage
 */

export interface CartItem extends OrderTicketItem {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  ticketTypeName: string;
  price: number;
}

interface CartStore {
  items: CartItem[];
  eventId: string | null;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (ticketTypeId: string) => void;
  updateQuantity: (ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalQuantity: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      eventId: null,

      // Add item to cart
      addItem: (item: CartItem) => {
        const { items, eventId } = get();

        // Nếu thêm ticket từ event khác, clear cart cũ
        if (eventId && eventId !== item.eventId) {
          set({
            items: [item],
            eventId: item.eventId,
          });
          return;
        }

        // Check nếu ticket type đã tồn tại, update quantity
        const existingItemIndex = items.findIndex(
          (i) => i.ticketTypeId === item.ticketTypeId
        );

        if (existingItemIndex >= 0) {
          const newItems = [...items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + item.quantity,
          };
          set({ items: newItems });
        } else {
          set({
            items: [...items, item],
            eventId: item.eventId,
          });
        }
      },

      // Remove item from cart
      removeItem: (ticketTypeId: string) => {
        const newItems = get().items.filter((i) => i.ticketTypeId !== ticketTypeId);
        set({
          items: newItems,
          eventId: newItems.length > 0 ? get().eventId : null,
        });
      },

      // Update quantity
      updateQuantity: (ticketTypeId: string, quantity: number) => {
        const { items } = get();
        const newItems = items.map((item) =>
          item.ticketTypeId === ticketTypeId ? { ...item, quantity } : item
        );
        set({ items: newItems });
      },

      // Clear cart
      clearCart: () => {
        set({ items: [], eventId: null });
      },

      // Get total amount
      getTotalAmount: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      // Get total quantity
      getTotalQuantity: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
