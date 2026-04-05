import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface WishlistState {
  items: string[]; // Array of product IDs
  addItem: (userId: string, productId: string) => Promise<void>;
  removeItem: (userId: string, productId: string) => Promise<void>;
  syncWishlist: (userId: string) => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (userId, productId) => {
        if (!userId) return;
        try {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            wishlist: arrayUnion(productId)
          });
          set((state) => ({ items: [...state.items, productId] }));
        } catch (error) {
          console.error('Error adding to wishlist:', error);
        }
      },
      removeItem: async (userId, productId) => {
        if (!userId) return;
        try {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            wishlist: arrayRemove(productId)
          });
          set((state) => ({ items: state.items.filter(id => id !== productId) }));
        } catch (error) {
          console.error('Error removing from wishlist:', error);
        }
      },
      syncWishlist: async (userId) => {
        if (!userId) return;
        try {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            set({ items: data.wishlist || [] });
          } else {
            // Initialize user doc if it doesn't exist (though it should)
            await setDoc(userRef, { wishlist: [] }, { merge: true });
            set({ items: [] });
          }
        } catch (error) {
          console.error('Error syncing wishlist:', error);
        }
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'peak-point-wishlist',
    }
  )
);
