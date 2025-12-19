import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '@/types/entities';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (menuItem) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.menuItem.id === menuItem.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.menuItem.id === menuItem.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { menuItem, quantity: 1 }] };
        });
      },
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.menuItem.id !== itemId),
        }));
      },
      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.menuItem.id !== itemId) };
          }
          return {
            items: state.items.map((i) =>
              i.menuItem.id === itemId ? { ...i, quantity } : i
            ),
          };
        });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + (item.menuItem.priceCents || 0) * item.quantity,
          0
        ),
    }),
    {
      name: 'customer-cart',
    }
  )
);
