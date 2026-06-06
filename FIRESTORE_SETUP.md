# Firestore Initial Data Setup Guide
## BuildMart BD — ফোন থেকে করার নিয়ম

---

## ধাপ 1 — Categories তৈরি করো

Firebase Console → Firestore → **categories** collection তৈরি করো।

প্রতিটা document manually add করতে হবে।

### Parent Categories (level: 1)

**Document 1:**
```
Collection: categories
Fields:
  name: "Products"
  slug: "products"
  level: 1
  parentId: null
  sortOrder: 1
  isActive: true
```

**Document 2:**
```
Fields:
  name: "Engineering Services"
  slug: "engineering-services"
  level: 1
  parentId: null
  sortOrder: 2
  isActive: true
```

---

### Sub Categories (level: 2)
(parentId তে উপরের document-এর ID দাও)

```
name: "Dealership Products"
slug: "dealership-products"
level: 2
parentId: [Products এর ID]
sortOrder: 1
isActive: true
```

```
name: "Contract Materials"
slug: "contract-materials"
level: 2
parentId: [Products এর ID]
sortOrder: 2
isActive: true
```

```
name: "Construction Essentials"
slug: "construction-essentials"
level: 2
parentId: [Products এর ID]
sortOrder: 3
isActive: true
```

---

### Nested Categories (level: 3)

```
name: "Cement"
slug: "cement"
level: 3
parentId: [Dealership Products এর ID]
sortOrder: 1
isActive: true
```

```
name: "Steel"
slug: "steel"
level: 3
parentId: [Dealership Products এর ID]
sortOrder: 2
isActive: true
```

```
name: "Paint"
slug: "paint"
level: 3
parentId: [Dealership Products এর ID]
sortOrder: 3
isActive: true
```

```
name: "Electrical"
slug: "electrical"
level: 3
parentId: [Dealership Products এর ID]
sortOrder: 4
isActive: true
```

```
name: "Sanitary & Bathroom"
slug: "sanitary-bathroom"
level: 3
parentId: [Dealership Products এর ID]
sortOrder: 5
isActive: true
```

```
name: "Chemical & Waterproofing"
slug: "chemical-waterproofing"
level: 3
parentId: [Dealership Products এর ID]
sortOrder: 6
isActive: true
```

```
name: "Tile & Ceramics"
slug: "tile-ceramics"
level: 3
parentId: [Dealership Products এর ID]
sortOrder: 7
isActive: true
```

```
name: "Doors & Windows"
slug: "doors-windows"
level: 3
parentId: [Dealership Products এর ID]
sortOrder: 8
isActive: true
```

```
name: "Bricks"
slug: "bricks"
level: 3
parentId: [Contract Materials এর ID]
sortOrder: 1
isActive: true
```

```
name: "Sand"
slug: "sand"
level: 3
parentId: [Contract Materials এর ID]
sortOrder: 2
isActive: true
```

```
name: "Stone Chips"
slug: "stone-chips"
level: 3
parentId: [Contract Materials এর ID]
sortOrder: 3
isActive: true
```

---

## ধাপ 2 — Brands তৈরি করো

Firebase Console → Firestore → **brands** collection

```
name: "Holcim"
slug: "holcim"
categoryId: [Cement category ID]
isFeatured: true
isActive: true
sortOrder: 1
```

```
name: "Shah Cement"
slug: "shah-cement"
categoryId: [Cement category ID]
isFeatured: true
isActive: true
sortOrder: 2
```

```
name: "BSRM"
slug: "bsrm"
categoryId: [Steel category ID]
isFeatured: true
isActive: true
sortOrder: 1
```

```
name: "GPH Ispat"
slug: "gph-ispat"
categoryId: [Steel category ID]
isFeatured: false
isActive: true
sortOrder: 2
```

```
name: "Berger"
slug: "berger"
categoryId: [Paint category ID]
isFeatured: true
isActive: true
sortOrder: 1
```

```
name: "BRB Cable"
slug: "brb-cable"
categoryId: [Electrical category ID]
isFeatured: true
isActive: true
sortOrder: 1
```

```
name: "Sika"
slug: "sika"
categoryId: [Chemical & Waterproofing category ID]
isFeatured: true
isActive: true
sortOrder: 1
```

```
name: "RAK Ceramics"
slug: "rak-ceramics"
categoryId: [Tile & Ceramics category ID]
isFeatured: true
isActive: true
sortOrder: 1
```

---

## ধাপ 3 — Sample Product তৈরি করো

Firebase Console → Firestore → **products** collection

```
name: "Holcim OPC Cement 50kg"
slug: "holcim-opc-cement-50kg"
categoryId: [Cement category ID]
brandId: [Holcim brand ID]
productType: "dealership"
price: 520
discountPrice: 500
stockQuantity: 500
unit: "bag"
images: []
primaryImage: ""
shortDescription: "Premium quality OPC 52.5 grade cement"
description: "Holcim OPC (Ordinary Portland Cement) Grade 52.5 is ideal for all types of construction work."
specifications: {
  "Grade": "OPC 52.5",
  "Weight": "50kg",
  "Setting Time": "30-45 minutes",
  "Compressive Strength": "52.5 MPa"
}
variants: []
isFeatured: true
isTrending: false
isBestSelling: true
isNewArrival: false
isActive: true
viewCount: 0
avgRating: 0
reviewCount: 0
```

---

## ধাপ 4 — Material Rates তৈরি করো

Firebase Console → Firestore → **materialRates** collection

```
materialName: "Cement (50kg bag)"
unit: "bag"
ratePerUnit: 520
category: "Cement"
```

```
materialName: "Steel Rod (Grade 60)"
unit: "kg"
ratePerUnit: 95
category: "Steel"
```

```
materialName: "First Class Brick"
unit: "pcs"
ratePerUnit: 14
category: "Bricks"
```

```
materialName: "Fine Sand"
unit: "cft"
ratePerUnit: 45
category: "Sand"
```

```
materialName: "Stone Chips (20mm)"
unit: "cft"
ratePerUnit: 75
category: "Stone Chips"
```

---

## ধাপ 5 — Hero Banner তৈরি করো

Firebase Console → Firestore → **banners** collection

```
title: "Bangladesh's Leading Construction Marketplace"
imageUrl: ""
link: "/products"
position: "hero"
isActive: true
sortOrder: 1
```

```
title: "Professional Engineering Services"
imageUrl: ""
link: "/services"
position: "hero"
isActive: true
sortOrder: 2
```

---

## Admin Panel থেকে বাকি সব করো

উপরের initial data Firestore-এ দেওয়ার পর, বাকি সব
Admin Panel থেকে সহজেই করতে পারবে:

- `/admin/products/add` → নতুন product যোগ
- `/admin/brands` → নতুন brand যোগ
- `/admin/categories` → নতুন category যোগ
- `/admin/banners` → banner upload
- `/admin/rates` → material rates update
