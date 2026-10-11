export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category | string;
  images: ProductImage[];
  stock: number;
  roastLevel?: 'light' | 'medium' | 'dark' | null;
  tastingNotes?: string[];
  estate?: string;
  altitude?: string;
  process?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isRoastOfTheMonth?: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShippingAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  shippingAddress?: ShippingAddress;
  beanPoints?: number;
}

export interface OrderItem {
  _id: string;
  product: Product | string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  roastLevel?: string | null;
}

export interface Order {
  _id: string;
  user: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  pointsRedeemed?: number;
  pointsDiscount?: number;
  pointsEarned?: number;
  status:
    | 'confirmed'
    | 'processing'
    | 'roasted'
    | 'dispatched'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  shippingAddress?: ShippingAddress;
  paymentMethod?: string;
  paymentStatus?: 'paid' | 'pending' | 'refunded';
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  giftMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  product: string;
  user: string;
  userName: string;
  rating: number;
  comment: string;
  verifiedPurchase?: boolean;
  createdAt: string;
  updatedAt?: string;
  productName?: string;
}

export interface ReviewSummary {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  distribution: { [key: number]: number };
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface WishlistItem {
  _id: string;
  product: Product;
  addedAt: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
  itemCount: number;
  productIds: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalCategories: number;
}
