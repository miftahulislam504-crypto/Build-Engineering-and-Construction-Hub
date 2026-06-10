"use client";

import { useState } from "react";
import Link from "next/link";
import { X, GitCompare, ChevronUp, ChevronDown } from "lucide-react";
import { create } from "zustand";
import { formatPrice, cn } from "@/lib/utils";

// ── Compare Store ──
interface CompareItem {
  productId: string;
  name:      string;
  image:     string;
  price:     number;
  brand?:    string;
  slug:      string;
}

interface CompareStore {
  items:      CompareItem[];
  isOpen:     boolean;
  addItem:    (item: CompareItem) => void;
  removeItem: (productId: string) => void;
  toggle:     (item: CompareItem) => void;
  clear:      () => void;
  isInList:   (productId: string) => boolean;
  openBar:    () => void;
  closeBar:   () => void;
}

export const useCompareStore = create<CompareStore>()((set, get) => ({
  items:  [],
  isOpen: false,

  addItem: (item) => {
    if (get().items.length >= 3) {
      alert("Maximum 3 products can be compared at once.");
      return;
    }
    if (!get().isInList(item.productId)) {
      set({ items: [...get().items, item], isOpen: true });
    }
  },

  removeItem: (productId) => {
    const newItems = get().items.filter((i) => i.productId !== productId);
    set({ items: newItems, isOpen: newItems.length > 0 });
  },

  toggle: (item) => {
    get().isInList(item.productId)
      ? get().removeItem(item.productId)
      : get().addItem(item);
  },

  clear:    () => set({ items: [], isOpen: false }),
  isInList: (productId) => get().items.some((i) => i.productId === productId),
  openBar:  () => set({ isOpen: true }),
  closeBar: () => set({ isOpen: false }),
}));

// ── Compare Bar UI ──
export default function CompareBar() {
  const { items, isOpen, removeItem, clear } = useCompareStore();
  const [collapsed, setCollapsed]            = useState(false);

  if (items.length === 0) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300",
      !isOpen && "translate-y-full"
    )}>
      <div className="bg-dark-900 border-t border-dark-700 shadow-2xl">
        {/* Toggle bar */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between px-5 py-2.5
                     text-white hover:bg-dark-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <GitCompare size={16} className="text-primary-400" />
            <span className="text-sm font-medium">
              Compare Products ({items.length}/3)
            </span>
          </div>
          {collapsed
            ? <ChevronUp size={16} className="text-dark-400" />
            : <ChevronDown size={16} className="text-dark-400" />
          }
        </button>

        {/* Items */}
        {!collapsed && (
          <div className="px-5 pb-4 pt-2">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {/* Product slots */}
              {Array.from({ length: 3 }).map((_, i) => {
                const item = items[i];
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex-shrink-0 w-40 h-24 rounded-xl border flex items-center",
                      "justify-center transition-all",
                      item
                        ? "border-primary-500 bg-dark-800"
                        : "border-dashed border-dark-600 bg-dark-800/50"
                    )}
                  >
                    {item ? (
                      <div className="flex gap-2 p-2 w-full">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
                          <img src={item.image || "/images/placeholder.png"}
                            alt={item.name}
                            className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-primary-400 text-xs font-bold mt-0.5">
                            {formatPrice(item.price)}
                          </p>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-dark-400 hover:text-red-400 transition-colors mt-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-dark-500 text-xs text-center px-2">
                        Add product {i + 1}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0 ml-2">
                <Link
                  href={`/compare?ids=${items.map((i) => i.productId).join(",")}`}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-medium transition-all",
                    items.length >= 2
                      ? "bg-primary-600 hover:bg-primary-700 text-white"
                      : "bg-dark-700 text-dark-500 cursor-not-allowed pointer-events-none"
                  )}
                >
                  Compare Now
                </Link>
                <button
                  onClick={clear}
                  className="px-4 py-2 rounded-xl text-xs font-medium
                             bg-dark-700 hover:bg-dark-600 text-dark-300
                             transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
