import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (product) => set((state) => {
        const existingItem = state.items.find(item => item.product === product._id);
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.product === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          };
        }
        return { items: [...state.items, { product: product._id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl }] };
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.product !== productId)
      })),
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item => 
          item.product === productId ? { ...item, quantity } : item
        )
      })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
