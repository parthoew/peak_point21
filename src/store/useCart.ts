import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const existingItem = get().items.find(
          (item) => item.id === newItem.id && item.size === newItem.size
        );
        if (existingItem) {
          set({
            items: get().items.map((item) =>
              item.id === newItem.id && item.size === newItem.size
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
          });
        } else {
          set({ items: [...get().items, newItem] });
        }
      },
      removeItem: (id, size) => {
        set({
          items: get().items.filter((item) => !(item.id === id && item.size === size)),
        });
      },
      updateQuantity: (id, size, quantity) => {
        set({
          items: get().items.map((item) =>
            item.id === id && item.size === size ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
