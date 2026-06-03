import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

interface CartStore {
  items:      CartItem[];
  isOpen:     boolean;

  addItem:    (item: CartItem) => void;
  removeItem: (productId: string, variantName?: string) => void;
  updateQty:  (productId: string, qty: number, variantName?: string) => void;
  clearCart:  () => void;
  openCart:   () => void;
  closeCart:  () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

const key = (productId: string, variantName?: string) =>
  `${productId}-${variantName ?? ""}`;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:  [],
      isOpen: false,

      addItem: (newItem) => {
        const { items } = get();
        const existing = items.find(
          (i) => key(i.productId, i.variantName) === key(newItem.productId, newItem.variantName)
        );
        if (existing) {
          set({
            items: items.map((i) =>
              key(i.productId, i.variantName) === key(newItem.productId, newItem.variantName)
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
        set({ isOpen: true });
      },

      removeItem: (productId, variantName) =>
        set({
          items: get().items.filter(
            (i) => key(i.productId, i.variantName) !== key(productId, variantName)
          ),
        }),

      updateQty: (productId, qty, variantName) => {
        if (qty <= 0) { get().removeItem(productId, variantName); return; }
        set({
          items: get().items.map((i) =>
            key(i.productId, i.variantName) === key(productId, variantName)
              ? { ...i, quantity: qty }
              : i
          ),
        });
      },

      clearCart:  () => set({ items: [] }),
      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    { name: "cart", storage: createJSONStorage(() => localStorage) }
  )
);
