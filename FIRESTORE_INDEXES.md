# Firestore Composite Indexes Setup Guide
## BuildMart BD

Firestore-এ complex queries করতে হলে composite indexes তৈরি করতে হয়।
Firebase Console → Firestore → Indexes → Composite → Add Index

---

## Required Indexes

### 1. Products Collection

**Index 1 — Featured Products**
```
Collection: products
Fields:
  isActive   → Ascending
  isFeatured → Ascending
  createdAt  → Descending
```

**Index 2 — Trending Products**
```
Collection: products
Fields:
  isActive   → Ascending
  isTrending → Ascending
  createdAt  → Descending
```

**Index 3 — Best Selling Products**
```
Collection: products
Fields:
  isActive      → Ascending
  isBestSelling → Ascending
  createdAt     → Descending
```

**Index 4 — New Arrivals**
```
Collection: products
Fields:
  isActive     → Ascending
  isNewArrival → Ascending
  createdAt    → Descending
```

**Index 5 — Products by Category**
```
Collection: products
Fields:
  isActive   → Ascending
  categoryId → Ascending
  createdAt  → Descending
```

**Index 6 — Products by Brand**
```
Collection: products
Fields:
  isActive  → Ascending
  brandId   → Ascending
  createdAt → Descending
```

**Index 7 — Products by Type**
```
Collection: products
Fields:
  isActive    → Ascending
  productType → Ascending
  createdAt   → Descending
```

**Index 8 — Low Stock Products (Admin)**
```
Collection: products
Fields:
  stockQuantity → Ascending
  isActive      → Ascending
```

---

### 2. Orders Collection

**Index 9 — User Orders**
```
Collection: orders
Fields:
  userId    → Ascending
  createdAt → Descending
```

**Index 10 — Orders by Status**
```
Collection: orders
Fields:
  status    → Ascending
  createdAt → Descending
```

**Index 11 — Orders by Order Number**
```
Collection: orders
Fields:
  orderNumber → Ascending
```

---

### 3. Quotations Collection

**Index 12 — User Quotations**
```
Collection: quotations
Fields:
  userId    → Ascending
  createdAt → Descending
```

**Index 13 — Quotations by Status**
```
Collection: quotations
Fields:
  status    → Ascending
  createdAt → Descending
```

---

### 4. Service Requests Collection

**Index 14 — User Service Requests**
```
Collection: serviceRequests
Fields:
  userId    → Ascending
  createdAt → Descending
```

**Index 15 — Service Requests by Status**
```
Collection: serviceRequests
Fields:
  status    → Ascending
  createdAt → Descending
```

---

### 5. Reviews Collection

**Index 16 — Product Reviews**
```
Collection: reviews
Fields:
  productId  → Ascending
  isApproved → Ascending
  createdAt  → Descending
```

**Index 17 — Service Reviews**
```
Collection: reviews
Fields:
  serviceId  → Ascending
  isApproved → Ascending
  createdAt  → Descending
```

---

### 6. Blog Posts Collection

**Index 18 — Published Posts**
```
Collection: blogPosts
Fields:
  isPublished → Ascending
  publishedAt → Descending
```

**Index 19 — Posts by Category**
```
Collection: blogPosts
Fields:
  isPublished → Ascending
  category    → Ascending
  publishedAt → Descending
```

---

### 7. Banners Collection

**Index 20 — Banners by Position**
```
Collection: banners
Fields:
  position  → Ascending
  isActive  → Ascending
  sortOrder → Ascending
```

---

### 8. Categories Collection

**Index 21 — Categories by Parent**
```
Collection: categories
Fields:
  isActive  → Ascending
  parentId  → Ascending
  sortOrder → Ascending
```

---

### 9. Brands Collection

**Index 22 — Featured Brands**
```
Collection: brands
Fields:
  isFeatured → Ascending
  isActive   → Ascending
  sortOrder  → Ascending
```

**Index 23 — Brands by Category**
```
Collection: brands
Fields:
  isActive   → Ascending
  categoryId → Ascending
```

---

### 10. Users Collection

**Index 24 — Customers List**
```
Collection: users
Fields:
  role      → Ascending
  createdAt → Descending
```

---

## Index তৈরির নিয়ম (Firebase Console থেকে)

1. **firebase.google.com** → তোমার project
2. বাম মেনু → **Firestore Database**
3. উপরে **Indexes** tab → **Composite** tab
4. **Add Index** বাটন চাপো
5. Collection ID, Fields, এবং Query scope দাও
6. **Create** চাপো
7. Index build হতে ২-৫ মিনিট লাগতে পারে

---

## Auto Index Creation

Firestore Console-এ error message আসলে সেখানে সরাসরি index create করার link থাকে।
সেই link-এ click করলে automatic index তৈরি হয়ে যাবে।

Console-এ যে error দেখাবে:
```
FirebaseError: The query requires an index. You can create it here: 
https://console.firebase.google.com/...
```

সেই link-এ click করো → index তৈরি হবে।
