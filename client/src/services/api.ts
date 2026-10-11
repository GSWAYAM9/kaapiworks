import {
  Product,
  Category,
  User,
  Cart,
  Wishlist,
  PaginatedResponse,
  AdminStats,
  Order,
  Review,
  ReviewSummary,
  ShippingAddress,
} from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  statusCode: number;
  details?: string;

  constructor(message: string, statusCode: number = 500, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('kw_token');

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Fallback token header if cookie is blocked in iframe/sandbox
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Sends httpOnly cookie
  });

  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (data && typeof data === 'object' && (data.message || data.details)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data?.details);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(body: { name: string; email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await request<{ success: boolean; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (res.token) localStorage.setItem('kw_token', res.token);
    return res;
  },

  async login(body: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await request<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (res.token) localStorage.setItem('kw_token', res.token);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('kw_token');
    }
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ success: boolean; user: User }>('/auth/me');
  },

  async updateProfile(data: {
    name?: string;
    phone?: string;
    shippingAddress?: ShippingAddress;
  }): Promise<User> {
    const res = await request<{ success: boolean; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.user;
  },

  // Products
  async getProducts(params: {
    search?: string;
    category?: string;
    roastLevel?: string;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Product>> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.roastLevel) query.set('roastLevel', params.roastLevel);
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    return request<PaginatedResponse<Product>>(`/products?${query.toString()}`);
  },

  async getProductHighlights(): Promise<{
    featured: Product[];
    newArrivals: Product[];
    roastOfTheMonth: Product | null;
  }> {
    const res = await request<{
      success: boolean;
      data: {
        featured: Product[];
        newArrivals: Product[];
        roastOfTheMonth: Product | null;
      };
    }>('/products/highlights');
    return res.data;
  },

  async getProductById(id: string): Promise<Product> {
    const res = await request<{ success: boolean; data: Product }>(`/products/${id}`);
    return res.data;
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await request<{ success: boolean; data: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await request<{ success: boolean; data: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await request(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await request<{ success: boolean; data: Category[] }>('/categories');
    return res.data;
  },

  async createCategory(data: { name: string; slug?: string; description?: string }): Promise<Category> {
    const res = await request<{ success: boolean; data: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateCategory(id: string, data: { name?: string; slug?: string; description?: string }): Promise<Category> {
    const res = await request<{ success: boolean; data: Category }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await request(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Cart
  async getCart(): Promise<Cart> {
    const res = await request<{ success: boolean; data: Cart }>('/cart');
    return res.data;
  },

  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    const res = await request<{ success: boolean; data: Cart }>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    return res.data;
  },

  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    const res = await request<{ success: boolean; data: Cart }>(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    return res.data;
  },

  async removeCartItem(productId: string): Promise<Cart> {
    const res = await request<{ success: boolean; data: Cart }>(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async mergeCart(items: { productId: string; quantity: number }[]): Promise<Cart> {
    const res = await request<{ success: boolean; data: Cart }>('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    return res.data;
  },

  // Cloudinary Image Upload
  async uploadImage(file: File): Promise<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await request<{ success: boolean; data: { url: string; publicId: string } }>('/upload', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  // Admin stats
  async getAdminStats(): Promise<AdminStats> {
    const res = await request<{ success: boolean; data: AdminStats }>('/admin/stats');
    return res.data;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await request<{ success: boolean; data: Order[] }>('/orders');
    return res.data;
  },

  async getOrder(id: string): Promise<Order> {
    const res = await request<{ success: boolean; data: Order }>(`/orders/${id}`);
    return res.data;
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const res = await request<{ success: boolean; data: Order }>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  async createOrder(data: {
    shippingAddress?: ShippingAddress;
    paymentMethod?: string;
    pointsToRedeem?: number;
    giftMessage?: string;
  } = {}): Promise<Order> {
    const res = await request<{ success: boolean; data: Order; beanPoints?: number }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // Reviews
  async getProductReviews(productId: string): Promise<ReviewSummary> {
    const res = await request<{ success: boolean; data: ReviewSummary }>(
      `/products/${productId}/reviews`
    );
    return res.data;
  },

  async createProductReview(
    productId: string,
    data: { rating: number; comment: string }
  ): Promise<Review> {
    const res = await request<{ success: boolean; data: Review }>(
      `/products/${productId}/reviews`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  async getAllReviewsAdmin(): Promise<Review[]> {
    const res = await request<{ success: boolean; data: Review[] }>('/reviews');
    return res.data;
  },

  async deleteReviewAdmin(reviewId: string): Promise<void> {
    await request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },

  // Chatbot
  async sendChatMessage(
    message: string,
    history: Array<{ role: 'user' | 'model'; text: string }> = []
  ): Promise<string> {
    const res = await request<{ success: boolean; reply: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
    return res.reply;
  },

  // Wishlist
  async getWishlist(): Promise<Wishlist> {
    const res = await request<{ success: boolean; data: Wishlist }>('/wishlist');
    return res.data;
  },

  async toggleWishlist(
    productId: string
  ): Promise<{ inWishlist: boolean; message: string; data: Wishlist }> {
    return await request<{
      success: boolean;
      inWishlist: boolean;
      message: string;
      data: Wishlist;
    }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  async addToWishlist(productId: string): Promise<Wishlist> {
    const res = await request<{ success: boolean; message: string; data: Wishlist }>(
      '/wishlist/add',
      {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }
    );
    return res.data;
  },

  async removeFromWishlist(productId: string): Promise<Wishlist> {
    const res = await request<{ success: boolean; message: string; data: Wishlist }>(
      `/wishlist/${productId}`,
      {
        method: 'DELETE',
      }
    );
    return res.data;
  },

  async clearWishlist(): Promise<Wishlist> {
    const res = await request<{ success: boolean; message: string; data: Wishlist }>(
      '/wishlist',
      {
        method: 'DELETE',
      }
    );
    return res.data;
  },

  // Newsletter Subscribers
  async subscribeNewsletter(
    email: string,
    source: string = 'footer'
  ): Promise<{ success: boolean; message: string; isNew?: boolean }> {
    return await request<{ success: boolean; message: string; isNew?: boolean }>(
      '/newsletter/subscribe',
      {
        method: 'POST',
        body: JSON.stringify({ email, source }),
      }
    );
  },
};
