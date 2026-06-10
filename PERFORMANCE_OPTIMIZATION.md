# Performance Optimization Guide
## BuildMart BD

---

## 1. Next.js Image Optimization

### app/(main)/layout.tsx তে add করো:
```tsx
// next.config.js এ already আছে:
images: {
  remotePatterns: [
    { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    { protocol: "https", hostname: "lh3.googleusercontent.com" },
  ],
}
```

### Product images-এ next/image ব্যবহার করো:
```tsx
// components/product/ProductCard.tsx এ img tag replace করো:
import Image from "next/image";

<Image
  src={product.primaryImage || "/images/placeholder.png"}
  alt={product.name}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  className="object-cover group-hover:scale-105 transition-transform duration-300"
  priority={false}
/>
```

---

## 2. Firestore Query Optimization

### Limit queries করো:
```ts
// Bad — সব products load করে
getDocs(collection(db, "products"))

// Good — limit দাও
getDocs(query(
  collection(db, "products"),
  where("isActive", "==", true),
  orderBy("createdAt", "desc"),
  limit(12)  // ← সবসময় limit দাও
))
```

### Pagination ব্যবহার করো:
```ts
import { startAfter, limit } from "firebase/firestore";

// প্রথম page
const firstPage = await getDocs(query(
  collection(db, "products"),
  orderBy("createdAt", "desc"),
  limit(12)
));

// পরের page
const lastDoc   = firstPage.docs[firstPage.docs.length - 1];
const nextPage  = await getDocs(query(
  collection(db, "products"),
  orderBy("createdAt", "desc"),
  startAfter(lastDoc),
  limit(12)
));
```

---

## 3. Component Lazy Loading

### Dynamic imports ব্যবহার করো:
```tsx
// app/(main)/layout.tsx
import dynamic from "next/dynamic";

// Heavy components lazy load করো
const CartSidebar = dynamic(
  () => import("@/components/cart/CartSidebar"),
  { ssr: false }
);

const CompareBar = dynamic(
  () => import("@/components/product/CompareBar"),
  { ssr: false }
);

const LiveChat = dynamic(
  () => import("@/components/ui/LiveChat"),
  { ssr: false }
);
```

---

## 4. Caching Strategy

### SWR দিয়ে data cache করো:
```tsx
// hooks/useProducts.ts
import useSWR from "swr";
import { getProducts } from "@/lib/firestore";

export function useFeaturedProducts() {
  return useSWR(
    "featured-products",
    () => getProducts({ isFeatured: true, limitCount: 8 }),
    {
      revalidateOnFocus:     false,
      revalidateOnReconnect: false,
      dedupingInterval:      60000, // 1 minute cache
    }
  );
}
```

---

## 5. Bundle Size Optimization

### next.config.js এ add করো:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { /* ... */ },

  // Bundle analyzer (optional)
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "react-icons",
    ],
  },

  // Compression
  compress: true,

  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};
```

---

## 6. Font Optimization

### app/layout.tsx (already optimized):
```tsx
// Google Fonts next/font দিয়ে load হচ্ছে
// এটা automatically fonts preload করে
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",  // ← এটা important
});
```

---

## 7. Tailwind CSS Purging

### tailwind.config.ts (already configured):
```ts
content: [
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
],
// Tailwind automatically purges unused CSS in production
```

---

## 8. Vercel Configuration

### vercel.json (root-এ তৈরি করো):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/(.*)\\.(jpg|jpeg|png|gif|svg|ico|webp)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 9. Firebase Storage Rules Optimization

### Firebase Storage-এ image compression:
```ts
// lib/cloudinary.ts → Firebase Storage এ replace করো যদি না করা থাকে
// Storage-এ upload করার আগে image resize করো:

export async function uploadCompressedImage(
  file: File,
  path:  string
): Promise<string> {
  // Canvas দিয়ে resize
  const canvas  = document.createElement("canvas");
  const ctx     = canvas.getContext("2d")!;
  const img     = new window.Image();

  return new Promise((resolve, reject) => {
    img.onload = async () => {
      const MAX = 800;
      let w = img.width;
      let h = img.height;

      if (w > h && w > MAX) { h = (h * MAX) / w; w = MAX; }
      else if (h > MAX)      { w = (w * MAX) / h; h = MAX; }

      canvas.width  = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(async (blob) => {
        if (!blob) { reject(new Error("Compression failed")); return; }
        const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
        const { storage } = await import("./firebase");
        const r   = ref(storage, path);
        await uploadBytes(r, blob, { contentType: "image/jpeg" });
        resolve(await getDownloadURL(r));
      }, "image/jpeg", 0.85);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

---

## 10. Lighthouse Score Tips

Target scores:
- Performance:    > 80
- Accessibility:  > 90
- Best Practices: > 90
- SEO:            > 90

### Quick wins:
- **Images**: সব img-এ alt text দাও
- **Buttons**: সব button-এ aria-label দাও
- **Links**: সব link meaningful text দাও
- **Contrast**: text/background contrast ratio > 4.5:1

---

## 11. Loading Skeleton Pattern

### সব async sections-এ skeleton দাও:
```tsx
// ProductCard loading skeleton — already implemented
// একই pattern সব sections-এ follow করো

{loading ? (
  <ProductCardSkeleton />
) : (
  <ProductCard product={product} />
)}
```

---

## 12. Firebase Security Best Practices

### Environment variables check:
```
✅ NEXT_PUBLIC_* → client-side safe
✅ Private keys → server-side only (never NEXT_PUBLIC_)
✅ Payment keys → server-side only
✅ Firebase config → NEXT_PUBLIC_ OK (it's public anyway)
```

---

## Lighthouse Test করার নিয়ম

1. Chrome browser খোলো
2. তোমার Vercel URL-এ যাও
3. F12 → Lighthouse tab
4. "Analyze page load" চাপো
5. Score দেখো এবং suggestions follow করো
