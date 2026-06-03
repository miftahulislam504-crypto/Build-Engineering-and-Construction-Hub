import {
  collection, doc, getDoc, getDocs, addDoc, setDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, increment,
  QueryConstraint, DocumentData, writeBatch,
  startAfter, getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";

// ─────────────────────────────────────────
// GENERIC HELPERS
// ─────────────────────────────────────────

// Single document পড়া
export async function getDocument(
  collectionName: string,
  docId: string
): Promise<DocumentData | null> {
  const ref = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Collection query
export async function queryCollection(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<DocumentData[]> {
  const ref   = collection(db, collectionName);
  const q     = query(ref, ...constraints);
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Document তৈরি (auto ID)
export async function createDocument(
  collectionName: string,
  data: DocumentData
): Promise<string> {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// Document তৈরি (custom ID)
export async function setDocument(
  collectionName: string,
  docId: string,
  data: DocumentData
): Promise<void> {
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Document update
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Document delete
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  await deleteDoc(doc(db, collectionName, docId));
}

// ─────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────

export async function getProducts(filters?: {
  categoryId?:  string;
  brandId?:     string;
  productType?: string;
  isFeatured?:  boolean;
  isTrending?:  boolean;
  isBestSelling?: boolean;
  isNewArrival?:  boolean;
  limitCount?:  number;
}) {
  const constraints: QueryConstraint[] = [
    where("isActive", "==", true),
  ];

  if (filters?.categoryId)
    constraints.push(where("categoryId",   "==", filters.categoryId));
  if (filters?.brandId)
    constraints.push(where("brandId",      "==", filters.brandId));
  if (filters?.productType)
    constraints.push(where("productType",  "==", filters.productType));
  if (filters?.isFeatured)
    constraints.push(where("isFeatured",   "==", true));
  if (filters?.isTrending)
    constraints.push(where("isTrending",   "==", true));
  if (filters?.isBestSelling)
    constraints.push(where("isBestSelling","==", true));
  if (filters?.isNewArrival)
    constraints.push(where("isNewArrival", "==", true));

  constraints.push(orderBy("createdAt", "desc"));

  if (filters?.limitCount)
    constraints.push(limit(filters.limitCount));

  return queryCollection("products", ...constraints);
}

export async function getProductBySlug(slug: string) {
  const results = await queryCollection(
    "products",
    where("slug", "==", slug),
    where("isActive", "==", true),
    limit(1)
  );
  return results[0] || null;
}

export async function incrementProductView(productId: string) {
  await updateDoc(doc(db, "products", productId), {
    viewCount: increment(1),
  });
}

// ─────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────

export async function getCategories(parentId?: string | null) {
  const constraints: QueryConstraint[] = [
    where("isActive", "==", true),
    orderBy("sortOrder", "asc"),
  ];
  if (parentId !== undefined)
    constraints.push(where("parentId", "==", parentId));
  return queryCollection("categories", ...constraints);
}

export async function getCategoryBySlug(slug: string) {
  const results = await queryCollection(
    "categories",
    where("slug", "==", slug),
    limit(1)
  );
  return results[0] || null;
}

// ─────────────────────────────────────────
// BRANDS
// ─────────────────────────────────────────

export async function getBrands(categoryId?: string) {
  const constraints: QueryConstraint[] = [
    where("isActive", "==", true),
    orderBy("sortOrder", "asc"),
  ];
  if (categoryId)
    constraints.push(where("categoryId", "==", categoryId));
  return queryCollection("brands", ...constraints);
}

export async function getFeaturedBrands() {
  return queryCollection(
    "brands",
    where("isFeatured", "==", true),
    where("isActive",   "==", true),
    orderBy("sortOrder", "asc")
  );
}

// ─────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────

export async function getServices(category?: string) {
  const constraints: QueryConstraint[] = [
    where("isActive", "==", true),
    orderBy("createdAt", "desc"),
  ];
  if (category)
    constraints.push(where("serviceCategory", "==", category));
  return queryCollection("services", ...constraints);
}

export async function getServiceBySlug(slug: string) {
  const results = await queryCollection(
    "services",
    where("slug", "==", slug),
    limit(1)
  );
  return results[0] || null;
}

// ─────────────────────────────────────────
// BANNERS
// ─────────────────────────────────────────

export async function getBanners(position: string) {
  return queryCollection(
    "banners",
    where("position", "==", position),
    where("isActive", "==", true),
    orderBy("sortOrder", "asc")
  );
}

// ─────────────────────────────────────────
// CART
// ─────────────────────────────────────────

export async function getCartItems(userId: string) {
  const ref = collection(db, "cart", userId, "items");
  const snaps = await getDocs(ref);
  return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addToCart(
  userId: string,
  productId: string,
  item: DocumentData
) {
  const ref = doc(db, "cart", userId, "items", productId);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, {
      quantity: existing.data().quantity + item.quantity,
    });
  } else {
    await setDoc(ref, item);
  }
}

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number
) {
  if (quantity <= 0) {
    await deleteDoc(doc(db, "cart", userId, "items", productId));
  } else {
    await updateDoc(doc(db, "cart", userId, "items", productId), { quantity });
  }
}

export async function clearCart(userId: string) {
  const items = await getCartItems(userId);
  const batch = writeBatch(db);
  items.forEach((item) => {
    batch.delete(doc(db, "cart", userId, "items", item.id));
  });
  await batch.commit();
}

// ─────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────

export async function getWishlistItems(userId: string) {
  const ref = collection(db, "wishlists", userId, "items");
  const snaps = await getDocs(ref);
  return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function toggleWishlist(
  userId: string,
  productId: string,
  item: DocumentData
) {
  const ref = doc(db, "wishlists", userId, "items", productId);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await deleteDoc(ref);
    return false; // removed
  } else {
    await setDoc(ref, item);
    return true; // added
  }
}

// ─────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────

export async function createOrder(orderData: DocumentData): Promise<string> {
  return createDocument("orders", orderData);
}

export async function getUserOrders(userId: string) {
  return queryCollection(
    "orders",
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
}

export async function getOrderById(orderId: string) {
  return getDocument("orders", orderId);
}

// ─────────────────────────────────────────
// QUOTATIONS
// ─────────────────────────────────────────

export async function createQuotation(data: DocumentData): Promise<string> {
  return createDocument("quotations", data);
}

export async function getUserQuotations(userId: string) {
  return queryCollection(
    "quotations",
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
}

// ─────────────────────────────────────────
// SERVICE REQUESTS
// ─────────────────────────────────────────

export async function createServiceRequest(data: DocumentData): Promise<string> {
  return createDocument("serviceRequests", data);
}

export async function getUserServiceRequests(userId: string) {
  return queryCollection(
    "serviceRequests",
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
}

// ─────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────

export async function getProductReviews(productId: string) {
  return queryCollection(
    "reviews",
    where("productId",   "==", productId),
    where("isApproved", "==", true),
    orderBy("createdAt", "desc")
  );
}

export async function addReview(data: DocumentData): Promise<string> {
  return createDocument("reviews", data);
}

// ─────────────────────────────────────────
// NOTIFICATIONS (Real-time)
// ─────────────────────────────────────────

export function listenToNotifications(
  userId: string,
  callback: (notifications: DocumentData[]) => void
) {
  const ref = collection(db, "notifications", userId, "items");
  const q   = query(ref, orderBy("createdAt", "desc"), limit(20));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function markNotificationRead(
  userId: string,
  notifId: string
) {
  await updateDoc(
    doc(db, "notifications", userId, "items", notifId),
    { isRead: true }
  );
}

export async function markAllNotificationsRead(userId: string) {
  const items = await getDocs(
    query(
      collection(db, "notifications", userId, "items"),
      where("isRead", "==", false)
    )
  );
  const batch = writeBatch(db);
  items.docs.forEach((d) => batch.update(d.ref, { isRead: true }));
  await batch.commit();
}

// ─────────────────────────────────────────
// BLOG POSTS
// ─────────────────────────────────────────

export async function getBlogPosts(category?: string) {
  const constraints: QueryConstraint[] = [
    where("isPublished", "==", true),
    orderBy("publishedAt", "desc"),
    limit(10),
  ];
  if (category)
    constraints.push(where("category", "==", category));
  return queryCollection("blogPosts", ...constraints);
}

// ─────────────────────────────────────────
// MATERIAL RATES (Calculator)
// ─────────────────────────────────────────

export async function getMaterialRates() {
  return queryCollection("materialRates", orderBy("category", "asc"));
}

// ─────────────────────────────────────────
// ADMIN — সব orders, quotations দেখা
// ─────────────────────────────────────────

export async function getAllOrders(status?: string) {
  const constraints: QueryConstraint[] = [
    orderBy("createdAt", "desc"),
    limit(50),
  ];
  if (status) constraints.push(where("status", "==", status));
  return queryCollection("orders", ...constraints);
}

export async function getAllQuotations(status?: string) {
  const constraints: QueryConstraint[] = [
    orderBy("createdAt", "desc"),
    limit(50),
  ];
  if (status) constraints.push(where("status", "==", status));
  return queryCollection("quotations", ...constraints);
}

export async function getAdminStats() {
  const [
    productsSnap,
    ordersSnap,
    usersSnap,
    quotationsSnap,
  ] = await Promise.all([
    getCountFromServer(collection(db, "products")),
    getCountFromServer(collection(db, "orders")),
    getCountFromServer(query(collection(db, "users"), where("role", "==", "customer"))),
    getCountFromServer(collection(db, "quotations")),
  ]);

  return {
    totalProducts:   productsSnap.data().count,
    totalOrders:     ordersSnap.data().count,
    totalCustomers:  usersSnap.data().count,
    totalQuotations: quotationsSnap.data().count,
  };
}
