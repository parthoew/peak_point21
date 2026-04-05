import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  color?: string;
  material?: string;
  variantId?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string, color?: string, material?: string) => void;
  updateQuantity: (id: string, size: string, quantity: number, color?: string, material?: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const existingItem = get().items.find(
          (item) => 
            item.id === newItem.id && 
            item.size === newItem.size && 
            item.color === newItem.color && 
            item.material === newItem.material
        );
        if (existingItem) {
          set({
            items: get().items.map((item) =>
              item.id === newItem.id && 
              item.size === newItem.size && 
              item.color === newItem.color && 
              item.material === newItem.material
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
          });
        } else {
          set({ items: [...get().items, newItem] });
        }
      },
      removeItem: (id, size, color, material) => {
        set({
          items: get().items.filter((item) => 
            !(item.id === id && item.size === size && item.color === color && item.material === material)
          ),
        });
      },
      updateQuantity: (id, size, quantity, color, material) => {
        set({
          items: get().items.map((item) =>
            item.id === id && item.size === size && item.color === color && item.material === material 
              ? { ...item, quantity } 
              : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
