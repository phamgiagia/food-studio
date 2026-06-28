// ============================================================
// Core entity types shared across frontend, admin, mobile
// ============================================================

export type UserRole = 'customer' | 'seller' | 'staff' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended' | 'pending' | 'deleted';

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  mfaEnabled: boolean;
  createdAt: number;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description?: string;
  story?: string;
  logoUrl?: string;
  bannerUrl?: string;
  region: string;
  province: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  commissionRate: number;
  rating?: number;
  reviewCount: number;
  verified: boolean;
  createdAt: number;
}

export interface Category {
  id: string;
  parentId?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
  children?: Category[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  weightG?: number;
  active: boolean;
}

export type ProductStatus = 'draft' | 'active' | 'paused' | 'deleted';

export interface Product {
  id: string;
  sellerId: string;
  seller?: Pick<SellerProfile, 'id' | 'storeName' | 'slug' | 'logoUrl' | 'province'>;
  categoryId?: string;
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
  name: string;
  slug: string;
  description?: string;
  story?: string;
  region: string;
  province: string;
  basePrice: number;
  comparePrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  status: ProductStatus;
  featured: boolean;
  rating?: number;
  reviewCount: number;
  soldCount: number;
  createdAt: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  sellerId: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  ward?: string;
  district: string;
  province: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  note?: string;
  couponCode?: string;
  giftMessage?: string;
  scheduledDate?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user?: Pick<User, 'id' | 'fullName' | 'avatarUrl'>;
  orderId?: string;
  rating: number;
  title?: string;
  body?: string;
  images?: string[];
  helpful: number;
  status: 'pending' | 'published' | 'hidden';
  createdAt: number;
}

export type CouponType = 'percent' | 'fixed' | 'free_shipping';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit: number;
  startsAt?: number;
  expiresAt?: number;
  active: boolean;
}

export interface LoyaltyAccount {
  id: string;
  userId: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'basePrice' | 'images'>;
  variant?: Pick<ProductVariant, 'id' | 'name' | 'price'>;
}

// API response wrappers

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error: null;
}

// Auth types

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  sellerId?: string;
  iat: number;
  exp: number;
}
