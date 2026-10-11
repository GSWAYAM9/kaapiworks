import bcrypt from 'bcryptjs';
import { initialCategories, initialProducts } from '../utils/seedData.js';

/**
 * High-performance, reactive in-memory data store for Kaapi Works.
 * Used when Mongoose is running in offline/demo mode without MongoDB Atlas connection string.
 */
class MemoryStore {
  constructor() {
    this.categories = [];
    this.products = [];
    this.users = [];
    this.carts = [];
    this.wishlists = [];
    this.subscribers = [];
    this.orders = [];
    this.reviews = [];
    this.isInitialized = false;
  }

  async init(adminEmail, adminPassword, customerEmail, customerPassword) {
    if (this.isInitialized) return;

    // 1. Initialize categories
    this.categories = initialCategories.map((c, index) => ({
      _id: `cat_${index + 1}`,
      name: c.name,
      slug: c.slug,
      description: c.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // 2. Initialize products with category references and initial ratings
    this.products = initialProducts.map((p, index) => {
      const category = this.categories.find((c) => c.slug === p.categorySlug) || this.categories[0];
      return {
        _id: `prod_${index + 1}`,
        name: p.name,
        description: p.description,
        price: p.price,
        category: category._id,
        categoryDetails: { _id: category._id, name: category.name, slug: category.slug },
        images: p.images,
        stock: p.stock,
        roastLevel: p.roastLevel || null,
        tastingNotes: p.tastingNotes || [],
        estate: p.estate || '',
        altitude: p.altitude || '',
        process: p.process || '',
        isFeatured: Boolean(p.isFeatured),
        isNewArrival: Boolean(p.isNewArrival),
        isRoastOfTheMonth: Boolean(p.isRoastOfTheMonth),
        averageRating: 0,
        reviewCount: 0,
        createdAt: new Date(Date.now() - index * 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    // 3. Initialize default users with phone and addresses
    const saltRounds = 12;
    const defaultAdminHash = await bcrypt.hash('KaapiAdmin@2026', saltRounds);
    const defaultCustHash = await bcrypt.hash('KaapiCustomer@2026', saltRounds);

    this.users = [
      {
        _id: 'user_admin_1',
        name: 'Kaapi Master Roaster (Admin)',
        email: 'admin@kaapiworks.in',
        passwordHash: defaultAdminHash,
        role: 'admin',
        phone: '+91 98450 12345',
        shippingAddress: {
          street: '12th Main Road, HAL 2nd Stage',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
        },
        beanPoints: 500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'user_customer_1',
        name: 'Aarav Sharma',
        email: 'customer@kaapiworks.in',
        passwordHash: defaultCustHash,
        role: 'customer',
        phone: '+91 99801 84920',
        shippingAddress: {
          street: 'Flat 402, Nilgiri Heights, 4th Cross',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560008',
          country: 'India',
        },
        beanPoints: 250,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // If custom env accounts are provided, add them as well
    if (adminEmail && adminEmail.toLowerCase().trim() !== 'admin@kaapiworks.in') {
      const customAdminHash = await bcrypt.hash(adminPassword || 'KaapiAdmin@2026', saltRounds);
      this.users.push({
        _id: 'user_admin_custom',
        name: 'Kaapi Master Roaster (Admin)',
        email: adminEmail.toLowerCase().trim(),
        passwordHash: customAdminHash,
        role: 'admin',
        phone: '+91 98450 12345',
        shippingAddress: {
          street: '12th Main Road, HAL 2nd Stage',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
        },
        beanPoints: 500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (customerEmail && customerEmail.toLowerCase().trim() !== 'customer@kaapiworks.in') {
      const customCustHash = await bcrypt.hash(customerPassword || 'KaapiCustomer@2026', saltRounds);
      this.users.push({
        _id: 'user_customer_custom',
        name: 'Aarav Sharma',
        email: customerEmail.toLowerCase().trim(),
        passwordHash: customCustHash,
        role: 'customer',
        phone: '+91 99801 84920',
        shippingAddress: {
          street: 'Flat 402, Nilgiri Heights, 4th Cross',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560008',
          country: 'India',
        },
        beanPoints: 250,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 4. Initialize sample past orders for the customer
    this.orders = [
      {
        _id: 'ord_101',
        user: 'user_customer_1',
        orderNumber: 'KW-98214',
        items: [
          {
            product: 'prod_1',
            name: 'Chikmagalur Reserve Arabica',
            price: 540,
            quantity: 2,
            image: this.products[0].images[0]?.url,
            roastLevel: 'medium',
          },
          {
            product: 'prod_10',
            name: 'Traditional South Indian Brass Filter (4-Cup)',
            price: 1250,
            quantity: 1,
            image: this.products[9].images[0]?.url,
            roastLevel: null,
          },
        ],
        subtotal: 2330,
        shipping: 0,
        total: 2330,
        status: 'delivered',
        carrier: 'Blue Dart Express Air',
        trackingNumber: 'BD-74892019',
        estimatedDelivery: new Date(Date.now() - 11 * 86400000).toISOString(),
        shippingAddress: {
          street: 'Flat 402, Nilgiri Heights, 4th Cross',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560008',
          country: 'India',
        },
        paymentMethod: 'UPI (Google Pay)',
        paymentStatus: 'paid',
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
      {
        _id: 'ord_102',
        user: 'user_customer_1',
        orderNumber: 'KW-74102',
        items: [
          {
            product: 'prod_2',
            name: 'Araku Micro-Lot Honey Sun-Dried',
            price: 680,
            quantity: 1,
            image: this.products[1].images[0]?.url,
            roastLevel: 'light',
          },
          {
            product: 'prod_4',
            name: 'Wayanad Monsooned Malabar AA',
            price: 580,
            quantity: 1,
            image: this.products[3].images[0]?.url,
            roastLevel: 'medium',
          },
        ],
        subtotal: 1260,
        shipping: 99,
        total: 1359,
        status: 'roasted',
        carrier: 'Blue Dart Express Air',
        trackingNumber: 'BD-84729103',
        estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString(),
        shippingAddress: {
          street: 'Flat 402, Nilgiri Heights, 4th Cross',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560008',
          country: 'India',
        },
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
        giftMessage: 'Wishing you crisp mornings with freshly roasted South Indian estate coffees! Happy Birthday, Priya!',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];

    // 5. Initialize sample reviews
    this.reviews = [
      {
        _id: 'rev_1',
        product: 'prod_1',
        user: 'user_customer_1',
        userName: 'Aarav Sharma',
        rating: 5,
        comment: 'Remarkable cup clarity! The almond and chocolate notes come through beautifully in a traditional South Indian filter. Best Chikmagalur beans I have had this year.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        _id: 'rev_2',
        product: 'prod_1',
        user: 'user_guest_2',
        userName: 'Meera Venkat',
        rating: 5,
        comment: 'Velvety body and zero harsh bitterness. The 36-hour wet fermentation truly makes a difference. Will be ordering monthly.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        _id: 'rev_3',
        product: 'prod_2',
        user: 'user_customer_1',
        userName: 'Aarav Sharma',
        rating: 5,
        comment: 'Intense berry aromatics right out of the grinder! The honey process gives it a winey sweetness that shines through V60 pour-over.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        _id: 'rev_4',
        product: 'prod_10',
        user: 'user_guest_3',
        userName: 'Karthik Raja',
        rating: 5,
        comment: 'Superb virgin brass craftsmanship from Kumbakonam. The micro-perforations produce a crystal-clear, syrupy decoction.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
    ];

    // Compute initial product ratings
    this.recalculateAllProductRatings();

    // 6. Initialize carts
    this.carts = [
      {
        _id: 'cart_customer_1',
        user: 'user_customer_1',
        items: [
          {
            _id: 'item_1',
            product: 'prod_1',
            quantity: 2,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 7. Initialize wishlists
    this.wishlists = [
      {
        _id: 'wishlist_customer_1',
        user: 'user_customer_1',
        items: [
          {
            _id: 'wish_item_1',
            product: 'prod_2',
            addedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.isInitialized = true;
    console.log(`[MemoryStore] Initialized with ${this.categories.length} categories, ${this.products.length} products, 2 accounts, ${this.orders.length} sample orders, and ${this.reviews.length} reviews.`);
  }

  recalculateProductRating(productId) {
    const productReviews = this.reviews.filter((r) => r.product === productId);
    const count = productReviews.length;
    const avg = count === 0 ? 0 : Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1));

    const p = this.products.find((prod) => prod._id === productId);
    if (p) {
      p.averageRating = avg;
      p.reviewCount = count;
    }
  }

  recalculateAllProductRatings() {
    for (const p of this.products) {
      this.recalculateProductRating(p._id);
    }
  }

  // --- Products ---
  findProducts({ search, categorySlug, roastLevel, sort, page = 1, limit = 12 }) {
    let list = [...this.products];

    // Filter by category
    if (categorySlug && categorySlug !== 'all') {
      const cat = this.categories.find((c) => c.slug === categorySlug);
      if (cat) {
        list = list.filter((p) => p.category === cat._id);
      }
    }

    // Filter by roast level
    if (roastLevel && roastLevel !== 'all') {
      list = list.filter((p) => p.roastLevel === roastLevel);
    }

    // Search query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.estate.toLowerCase().includes(q) ||
          p.tastingNotes.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sort === 'price_asc' || sort === 'price-asc' || sort === 'price_low_high') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc' || sort === 'price-desc' || sort === 'price_high_low') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'oldest' || sort === 'createdAt_asc') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // Default: newest / recency
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    // Populate category info
    const populated = paginated.map((p) => {
      const cat = this.categories.find((c) => c._id === p.category);
      return {
        ...p,
        category: cat ? { _id: cat._id, name: cat.name, slug: cat.slug } : p.category,
      };
    });

    return {
      products: populated,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  findProductById(id) {
    const p = this.products.find((prod) => prod._id === id);
    if (!p) return null;
    const cat = this.categories.find((c) => c._id === p.category);
    return {
      ...p,
      category: cat ? { _id: cat._id, name: cat.name, slug: cat.slug } : p.category,
    };
  }

  createProduct(data) {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cat = this.categories.find((c) => c._id === data.category || c.slug === data.category);
    const categoryId = cat ? cat._id : data.category;

    const newProd = {
      _id: id,
      name: data.name,
      description: data.description,
      price: Number(data.price),
      category: categoryId,
      images: Array.isArray(data.images) ? data.images : [{ url: data.imageUrl, publicId: 'custom' }],
      stock: Number(data.stock ?? 0),
      roastLevel: data.roastLevel || null,
      tastingNotes: Array.isArray(data.tastingNotes) ? data.tastingNotes : [],
      estate: data.estate || '',
      altitude: data.altitude || '',
      process: data.process || '',
      isFeatured: Boolean(data.isFeatured),
      isNewArrival: Boolean(data.isNewArrival),
      isRoastOfTheMonth: Boolean(data.isRoastOfTheMonth),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.products.unshift(newProd);
    return this.findProductById(id);
  }

  updateProduct(id, data) {
    const index = this.products.findIndex((p) => p._id === id);
    if (index === -1) return null;

    const existing = this.products[index];
    let categoryId = existing.category;
    if (data.category) {
      const cat = this.categories.find((c) => c._id === data.category || c.slug === data.category);
      if (cat) categoryId = cat._id;
    }

    const updated = {
      ...existing,
      ...data,
      category: categoryId,
      price: data.price !== undefined ? Number(data.price) : existing.price,
      stock: data.stock !== undefined ? Number(data.stock) : existing.stock,
      updatedAt: new Date().toISOString(),
    };

    this.products[index] = updated;
    return this.findProductById(id);
  }

  deleteProduct(id) {
    const index = this.products.findIndex((p) => p._id === id);
    if (index === -1) return null;
    const removed = this.products.splice(index, 1)[0];
    return removed;
  }

  // --- Categories ---
  getCategories() {
    return [...this.categories];
  }

  createCategory(data) {
    const id = `cat_${Date.now()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat = {
      _id: id,
      name: data.name,
      slug,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.categories.push(newCat);
    return newCat;
  }

  updateCategory(id, data) {
    const cat = this.categories.find((c) => c._id === id);
    if (!cat) return null;
    if (data.name) cat.name = data.name;
    if (data.slug) cat.slug = data.slug;
    if (data.description !== undefined) cat.description = data.description;
    cat.updatedAt = new Date().toISOString();
    return cat;
  }

  deleteCategory(id) {
    const index = this.categories.findIndex((c) => c._id === id);
    if (index === -1) return null;
    return this.categories.splice(index, 1)[0];
  }

  // --- Users ---
  findUserByEmail(email) {
    const clean = (email || '').toLowerCase().trim();
    return this.users.find((u) => u.email === clean);
  }

  findUserById(id) {
    return this.users.find((u) => u._id === id);
  }

  createUser(data) {
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newUser = {
      _id: id,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      role: data.role || 'customer',
      beanPoints: data.beanPoints !== undefined ? data.beanPoints : 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // --- Cart ---
  getCart(userId) {
    let cart = this.carts.find((c) => c.user === userId);
    if (!cart) {
      cart = {
        _id: `cart_${Date.now()}`,
        user: userId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.carts.push(cart);
    }

    // Populate products & compute server-side totals
    const populatedItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const prod = this.findProductById(typeof item.product === 'object' ? item.product._id : item.product);
      if (prod) {
        // Enforce maximum stock cap server-side
        const validQuantity = Math.max(1, Math.min(item.quantity, Math.max(1, prod.stock)));
        const itemTotal = prod.price * validQuantity;
        subtotal += itemTotal;

        populatedItems.push({
          _id: item._id || `item_${prod._id}`,
          product: prod,
          quantity: validQuantity,
          unitPrice: prod.price,
          itemTotal,
        });
      }
    }

    // Shipping policy: Free above ₹1,499, otherwise ₹99
    const shipping = subtotal >= 1499 || subtotal === 0 ? 0 : 99;
    const total = subtotal + shipping;

    return {
      _id: cart._id,
      user: userId,
      items: populatedItems,
      subtotal,
      shipping,
      total,
      itemCount: populatedItems.reduce((acc, curr) => acc + curr.quantity, 0),
    };
  }

  updateCart(userId, itemsArray) {
    let cart = this.carts.find((c) => c.user === userId);
    if (!cart) {
      cart = {
        _id: `cart_${Date.now()}`,
        user: userId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.carts.push(cart);
    }

    cart.items = itemsArray.map((it) => ({
      _id: it._id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      product: typeof it.product === 'object' ? it.product._id : it.product,
      quantity: Number(it.quantity) || 1,
    }));
    cart.updatedAt = new Date().toISOString();

    return this.getCart(userId);
  }

  clearCart(userId) {
    const cart = this.carts.find((c) => c.user === userId);
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date().toISOString();
    }
    return this.getCart(userId);
  }

  // --- Wishlist ---
  getWishlist(userId) {
    let wishlist = this.wishlists.find((w) => w.user === userId);
    if (!wishlist) {
      wishlist = {
        _id: `wishlist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user: userId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.wishlists.push(wishlist);
    }

    const items = [];
    for (const item of wishlist.items) {
      const prod = this.products.find((p) => p._id === item.product);
      if (prod) {
        let cat = prod.category;
        if (typeof cat === 'string') {
          cat = this.categories.find((c) => c._id === cat) || cat;
        }
        items.push({
          _id: item._id,
          product: {
            ...prod,
            category: cat,
          },
          addedAt: item.addedAt,
        });
      }
    }

    return {
      _id: wishlist._id,
      user: wishlist.user,
      items,
      itemCount: items.length,
      productIds: items.map((it) => it.product._id),
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  addToWishlist(userId, productId) {
    let wishlist = this.wishlists.find((w) => w.user === userId);
    if (!wishlist) {
      this.getWishlist(userId);
      wishlist = this.wishlists.find((w) => w.user === userId);
    }

    const existingIndex = wishlist.items.findIndex((it) => it.product === productId);
    if (existingIndex === -1) {
      wishlist.items.push({
        _id: `wish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        product: productId,
        addedAt: new Date().toISOString(),
      });
      wishlist.updatedAt = new Date().toISOString();
    }

    return this.getWishlist(userId);
  }

  removeFromWishlist(userId, productId) {
    const wishlist = this.wishlists.find((w) => w.user === userId);
    if (wishlist) {
      wishlist.items = wishlist.items.filter((it) => it.product !== productId && it._id !== productId);
      wishlist.updatedAt = new Date().toISOString();
    }
    return this.getWishlist(userId);
  }

  toggleWishlist(userId, productId) {
    let wishlist = this.wishlists.find((w) => w.user === userId);
    if (!wishlist) {
      this.getWishlist(userId);
      wishlist = this.wishlists.find((w) => w.user === userId);
    }

    const existingIndex = wishlist.items.findIndex((it) => it.product === productId);
    let inWishlist = false;

    if (existingIndex !== -1) {
      wishlist.items.splice(existingIndex, 1);
      inWishlist = false;
    } else {
      wishlist.items.push({
        _id: `wish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        product: productId,
        addedAt: new Date().toISOString(),
      });
      inWishlist = true;
    }
    wishlist.updatedAt = new Date().toISOString();

    return {
      inWishlist,
      wishlist: this.getWishlist(userId),
    };
  }

  clearWishlist(userId) {
    const wishlist = this.wishlists.find((w) => w.user === userId);
    if (wishlist) {
      wishlist.items = [];
      wishlist.updatedAt = new Date().toISOString();
    }
    return this.getWishlist(userId);
  }

  // --- Newsletter Subscribers ---
  findSubscriberByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    return this.subscribers.find((s) => s.email === cleanEmail) || null;
  }

  addSubscriber(email, source = 'footer') {
    const cleanEmail = email.toLowerCase().trim();
    let existing = this.subscribers.find((s) => s.email === cleanEmail);

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.updatedAt = new Date().toISOString();
      }
      return { subscriber: existing, isNew: false };
    }

    const newSubscriber = {
      _id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      source: source || 'footer',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.subscribers.push(newSubscriber);
    return { subscriber: newSubscriber, isNew: true };
  }

  getSubscribers() {
    return [...this.subscribers];
  }

  // --- User Profile ---
  updateUserProfile(userId, data) {
    const user = this.users.find((u) => u._id === userId);
    if (!user) return null;

    if (data.name) user.name = data.name.trim();
    if (data.phone !== undefined) user.phone = data.phone.trim();
    if (data.shippingAddress) {
      user.shippingAddress = {
        ...user.shippingAddress,
        ...data.shippingAddress,
      };
    }
    user.updatedAt = new Date().toISOString();
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      shippingAddress: user.shippingAddress,
      beanPoints: user.beanPoints !== undefined ? user.beanPoints : 150,
    };
  }

  // --- Orders ---
  findOrdersByUser(userId) {
    return this.orders
      .filter((o) => o.user === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findOrderById(orderId) {
    return this.orders.find((o) => o._id === orderId || o.orderNumber === orderId);
  }

  createOrder(data) {
    const orderNum = `KW-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      _id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user: data.user,
      orderNumber: orderNum,
      items: data.items.map((it) => ({
        _id: it._id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        product: typeof it.product === 'object' ? it.product._id : it.product,
        name: it.name || it.product?.name || 'Specialty Coffee',
        price: it.price || it.unitPrice || 0,
        quantity: it.quantity,
        image: it.image || it.product?.images?.[0]?.url || '',
        roastLevel: it.roastLevel || it.product?.roastLevel || null,
      })),
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      pointsRedeemed: data.pointsRedeemed || 0,
      pointsDiscount: data.pointsDiscount || 0,
      pointsEarned: data.pointsEarned || 0,
      status: 'processing',
      carrier: data.carrier || 'Blue Dart Express Air',
      trackingNumber: data.trackingNumber || `BD-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDelivery: data.estimatedDelivery || new Date(Date.now() + 3 * 86400000).toISOString(),
      shippingAddress: data.shippingAddress || {
        street: '12th Main Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
      },
      paymentMethod: data.paymentMethod || 'UPI / Card',
      paymentStatus: 'paid',
      giftMessage: data.giftMessage ? String(data.giftMessage).trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);

    // Update user bean points: subtract redeemed, add earned
    const user = this.findUserById(data.user);
    if (user) {
      const currentPoints = user.beanPoints !== undefined ? user.beanPoints : 150;
      const redeemed = data.pointsRedeemed || 0;
      const earned = data.pointsEarned || 0;
      user.beanPoints = Math.max(0, currentPoints - redeemed) + earned;
      user.updatedAt = new Date().toISOString();
    }

    // Decrement stock for purchased products
    for (const item of newOrder.items) {
      const prod = this.products.find((p) => p._id === item.product);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    return newOrder;
  }

  // --- Reviews ---
  findReviewsByProduct(productId) {
    return this.reviews
      .filter((r) => r.product === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllReviews() {
    return this.reviews
      .map((r) => {
        const prod = this.findProductById(r.product);
        return {
          ...r,
          productName: prod ? prod.name : 'Unknown Product',
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createReview(data) {
    // Check if user already reviewed this product
    const existing = this.reviews.find((r) => r.product === data.product && r.user === data.user);
    if (existing) {
      const err = new Error('You have already submitted a review for this product.');
      err.statusCode = 409;
      throw err;
    }

    const newReview = {
      _id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      product: data.product,
      user: data.user,
      userName: data.userName,
      rating: Number(data.rating),
      comment: data.comment.trim(),
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.reviews.unshift(newReview);
    this.recalculateProductRating(data.product);

    return newReview;
  }

  deleteReview(reviewId) {
    const index = this.reviews.findIndex((r) => r._id === reviewId);
    if (index === -1) return null;

    const [deleted] = this.reviews.splice(index, 1);
    this.recalculateProductRating(deleted.product);
    return deleted;
  }
}

export const memoryStore = new MemoryStore();
