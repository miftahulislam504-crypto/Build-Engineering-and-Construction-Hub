import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

// ── Tailwind class merge ──
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Price formatter (BDT) ──
export function formatPrice(price: number): string {
  return "৳" + new Intl.NumberFormat("en-BD").format(price);
}

// ── Discount percentage ──
export function discountPercent(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100);
}

// ── Slug generator ──
export function generateSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}

// ── Truncate text ──
export function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max).trim() + "...";
}

// ── Format date ──
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric", month: "long", day: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric", month: "short", day: "numeric",
  }).format(new Date(date));
}

// ── Time ago ──
export function timeAgo(date: Date | string): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60)    return `${seconds}s ago`;
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return formatDateShort(date);
}

// ── Stock status ──
export function getStockStatus(qty: number) {
  if (qty <= 0)  return { label: "Out of Stock", color: "red"    };
  if (qty <= 10) return { label: "Low Stock",    color: "yellow" };
  return               { label: "In Stock",      color: "green"  };
}

// ── Order/Quotation number ──
export function generateOrderNumber(): string {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BM-${ts}-${rnd}`;
}

export function generateQuotationNumber(): string {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `QT-${ts}-${rnd}`;
}

// ── WhatsApp link ──
export function whatsappLink(phone: string, message?: string): string {
  const num     = phone.replace(/\D/g, "");
  const encoded = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${num}${encoded}`;
}

// ── Primary image helper ──
export function getPrimaryImage(images: string[]): string {
  return images?.[0] ?? "/images/placeholder.png";
}

// ── Payment label ──
export function paymentLabel(method: string): string {
  const map: Record<string, string> = {
    bkash: "bKash", nagad: "Nagad", rocket: "Rocket",
    sslcommerz: "Card / SSLCommerz", cod: "Cash on Delivery",
  };
  return map[method] ?? method;
}

// ── Order status color ──
export function orderStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "yellow", processing: "blue", shipped: "purple",
    delivered: "green", cancelled: "red",
  };
  return map[status] ?? "gray";
}
