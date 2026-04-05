import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface AppState {
  products: Product[];
  cart: CartItem[];
  isCartOpen: boolean;
  setProducts: (products: Product[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  toggleCart: () => void;
}

export const useStore = create<AppState>((set) => ({
  products: [],
  cart: [],
  isCartOpen: false,
  setProducts: (products) => set({ products }),
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }], isCartOpen: true };
  }),
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== productId)
  })),
  updateQuantity: (productId, delta) => set((state) => ({
    cart: state.cart.map(item => 
      item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )
  })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
}));
