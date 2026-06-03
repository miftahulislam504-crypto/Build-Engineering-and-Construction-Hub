// lib/types.ts — সব TypeScript Types

// ─────────────────────────────────────────
// USER
// ─────────────────────────────────────────
export interface User {
  id:         string;
  name:       string;
  email:      string;
  phone?:     string;
  role:       "customer" | "admin" | "super_admin";
  avatar?:    string;
  isVerified: boolean;
  createdAt:  Date;
}

export interface Address {
  id:          string;
  label?:      string;
  fullName:    string;
  phone:       string;
  division:    string;
  district:    string;
  thana:       string;
  fullAddress: string;
  isDefault:   boolean;
}

// ─────────────────────────────────────────
// CATEGORY & BRAND
// ─────────────────────────────────────────
export interface Category {
  id:          string;
  name:        string;
  slug:        string;
  image?:      string;
  icon?:       string;
  level:       number;
  parentId?:   string | null;
  sortOrder:   number;
  isActive:    boolean;
  children?:   Category[];
}

export interface Brand {
  id:          string;
  name:        string;
  slug:        string;
  logo?:       string;
  categoryId?: string;
  isFeatured:  boolean;
  isActive:    boolean;
}

// ─────────────────────────────────────────
// PRODUCT
// ─────────────────────────────────────────
export interface ProductVariant {
  name:  string;
  price: number;
  stock: number;
}

export interface Product {
  id:               string;
  name:             string;
  slug:             string;
  shortDescription?: string;
  description?:     string;
  categoryId:       string;
  category?:        Category;
  brandId?:         string;
  brand?:           Brand;
  productType:      "dealership" | "contract" | "essential";
  price:            number;
  discountPrice?:   number;
  stockQuantity:    number;
  unit:             string;
  images:           string[];
  primaryImage:     string;
  specifications:   Record<string, string>;
  variants:         ProductVariant[];
  isFeatured:       boolean;
  isTrending:       boolean;
  isBestSelling:    boolean;
  isNewArrival:     boolean;
  isActive:         boolean;
  viewCount:        number;
  avgRating:        number;
  reviewCount:      number;
  createdAt:        Date;
}

// ─────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────
export interface ServicePackage {
  name:         string;
  price:        number;
  deliverables: string[];
  duration:     string;
  isPopular:    boolean;
}

export interface ServiceProcessStep {
  step:        number;
  title:       string;
  description: string;
}

export interface ServiceFAQ {
  question: string;
  answer:   string;
}

export interface Service {
  id:               string;
  name:             string;
  slug:             string;
  serviceCategory:  "design" | "construction" | "consultancy" | "survey";
  shortDescription?: string;
  description?:     string;
  startingPrice:    number;
  images:           string[];
  packages:         ServicePackage[];
  processSteps:     ServiceProcessStep[];
  faqs:             ServiceFAQ[];
  isFeatured:       boolean;
  isActive:         boolean;
  avgRating:        number;
  reviewCount:      number;
  createdAt:        Date;
}

// ─────────────────────────────────────────
// CART
// ─────────────────────────────────────────
export interface CartItem {
  id:           string;
  productId:    string;
  name:         string;
  image:        string;
  brand?:       string;
  price:        number;
  unit:         string;
  quantity:     number;
  variantName?: string;
}

// ─────────────────────────────────────────
// ORDER
// ─────────────────────────────────────────
export interface OrderItem {
  productId:    string;
  name:         string;
  image:        string;
  quantity:     number;
  unitPrice:    number;
  totalPrice:   number;
  variantName?: string;
  unit:         string;
}

export interface Order {
  id:            string;
  orderNumber:   string;
  userId:        string;
  status:        "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items:         OrderItem[];
  subtotal:      number;
  deliveryCharge: number;
  discount:      number;
  total:         number;
  paymentMethod: "bkash" | "nagad" | "rocket" | "sslcommerz" | "cod";
  paymentStatus: "unpaid" | "paid" | "refunded";
  transactionId?: string;
  address:       Address;
  notes?:        string;
  createdAt:     Date;
}

// ─────────────────────────────────────────
// QUOTATION
// ─────────────────────────────────────────
export interface QuotationItem {
  productId:  string;
  name:       string;
  quantity:   number;
  unit:       string;
  note?:      string;
}

export interface QuotationResponse {
  message:     string;
  quotedPrice: number;
  validUntil:  Date;
  pdfUrl?:     string;
}

export interface Quotation {
  id:              string;
  quotationNumber: string;
  userId:          string;
  userName:        string;
  userPhone:       string;
  status:          "pending" | "reviewed" | "sent" | "approved" | "rejected";
  projectName:     string;
  projectLocation: string;
  description?:    string;
  items:           QuotationItem[];
  adminResponse?:  QuotationResponse;
  createdAt:       Date;
}

// ─────────────────────────────────────────
// SERVICE REQUEST
// ─────────────────────────────────────────
export interface ServiceTimeline {
  status:    string;
  note?:     string;
  updatedAt: Date;
}

export interface ServiceRequest {
  id:             string;
  userId:         string;
  serviceId:      string;
  serviceName:    string;
  packageName?:   string;
  status:         "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  projectDetails: string;
  location:       string;
  preferredDate?: Date;
  totalAmount?:   number;
  timeline:       ServiceTimeline[];
  createdAt:      Date;
}

// ─────────────────────────────────────────
// REVIEW
// ─────────────────────────────────────────
export interface Review {
  id:         string;
  userId:     string;
  userName:   string;
  userAvatar?: string;
  productId?: string;
  serviceId?: string;
  rating:     number;
  comment?:   string;
  isApproved: boolean;
  createdAt:  Date;
}

// ─────────────────────────────────────────
// NOTIFICATION
// ─────────────────────────────────────────
export interface Notification {
  id:        string;
  type:      "order" | "service" | "quotation" | "promo" | "system";
  title:     string;
  message:   string;
  link?:     string;
  isRead:    boolean;
  createdAt: Date;
}

// ─────────────────────────────────────────
// BANNER & BLOG
// ─────────────────────────────────────────
export interface Banner {
  id:        string;
  title:     string;
  imageUrl:  string;
  link?:     string;
  position:  "hero" | "promo" | "category";
  isActive:  boolean;
  sortOrder: number;
}

export interface BlogPost {
  id:          string;
  title:       string;
  slug:        string;
  content:     string;
  excerpt?:    string;
  category:    "blog" | "news" | "article";
  thumbnail?:  string;
  isPublished: boolean;
  publishedAt: Date;
  createdAt:   Date;
}

// ─────────────────────────────────────────
// CALCULATOR
// ─────────────────────────────────────────
export interface MaterialRate {
  id:           string;
  materialName: string;
  unit:         string;
  ratePerUnit:  number;
  category:     string;
}

export interface BOQResult {
  material:  string;
  quantity:  number;
  unit:      string;
  rate:      number;
  total:     number;
}
