import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistItem {
  productId: string;
  name:      string;
  image:     string;
  price:     number;
  brand?:    string;
  slug:      string;
}

interface WishlistStore {
  items:      WishlistItem[];
  addItem:    (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggle:     (item: WishlistItem) => void;
  isInList:   (productId: string) => boolean;
  clear:      () => void;
  count:      () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!get().isInList(item.productId))
          set({ items: [...get().items, item] });
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      toggle: (item) => {
        get().isInList(item.productId)
          ? get().removeItem(item.productId)
          : get().addItem(item);
      },

      isInList: (productId) => get().items.some((i) => i.productId === productId),
      clear:    ()           => set({ items: [] }),
      count:    ()           => get().items.length,
    }),
    { name: "wishlist", storage: createJSONStorage(() => localStorage) }
  )
);
