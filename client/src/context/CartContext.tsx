import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, Product } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

interface GuestCartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (productId: string, quantity?: number, productFallback?: Product) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  reorderOrder: (orderItems: Array<{ product: Product | string; quantity: number; name?: string }>) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_STORAGE_KEY = 'kw_guest_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();

  const [cart, setCart] = useState<Cart | null>(null);
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>(() => {
    try {
      const stored = localStorage.getItem(GUEST_CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  // Sync guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(guestItems));
      } catch (err) {
        console.error('Failed to persist guest cart to localStorage', err);
      }
    }
  }, [guestItems, isAuthenticated]);

  // Load cart when user logs in or mounts
  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        // If guest cart had items, merge them first
        const storedGuest = localStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (storedGuest) {
          const parsed = JSON.parse(storedGuest);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const merged = await api.mergeCart(
              parsed.map((it: GuestCartItem) => ({ productId: it.productId, quantity: it.quantity }))
            );
            setCart(merged);
            localStorage.removeItem(GUEST_CART_STORAGE_KEY);
            setGuestItems([]);
            return;
          }
        }
        const data = await api.getCart();
        setCart(data);
      } catch (err: any) {
        console.error('Failed to fetch user cart', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Compute guest totals
  const guestSubtotal = guestItems.reduce((acc, it) => {
    const price = it.product?.price || 0;
    return acc + price * it.quantity;
  }, 0);
  const guestShipping = guestSubtotal >= 1499 || guestSubtotal === 0 ? 0 : 99;
  const guestTotal = guestSubtotal + guestShipping;
  const guestCount = guestItems.reduce((acc, it) => acc + it.quantity, 0);

  const itemCount = isAuthenticated ? cart?.itemCount || 0 : guestCount;
  const subtotal = isAuthenticated ? cart?.subtotal || 0 : guestSubtotal;
  const shipping = isAuthenticated ? cart?.shipping || 0 : guestShipping;
  const total = isAuthenticated ? cart?.total || 0 : guestTotal;

  const addToCart = async (productId: string, quantity: number = 1, productFallback?: Product): Promise<boolean> => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        const updated = await api.addToCart(productId, quantity);
        setCart(updated);
        success('Added to your coffee bag');
        openDrawer();
        return true;
      } else {
        // Handle guest cart in local state
        setGuestItems((prev) => {
          const index = prev.findIndex((item) => item.productId === productId);
          if (index > -1) {
            const updated = [...prev];
            const maxStock = productFallback?.stock ?? 99;
            const newQty = Math.min(updated[index].quantity + quantity, maxStock);
            updated[index] = { ...updated[index], quantity: newQty, product: productFallback || updated[index].product };
            return updated;
          } else {
            return [...prev, { productId, quantity, product: productFallback }];
          }
        });
        success('Added to your coffee bag (Guest)');
        openDrawer();
        return true;
      }
    } catch (err: any) {
      error(err.message || 'Could not add item to cart.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        const updated = await api.updateCartItem(productId, quantity);
        setCart(updated);
        return true;
      } else {
        if (quantity <= 0) {
          setGuestItems((prev) => prev.filter((it) => it.productId !== productId));
          info('Item removed from cart');
        } else {
          setGuestItems((prev) =>
            prev.map((it) => (it.productId === productId ? { ...it, quantity } : it))
          );
        }
        return true;
      }
    } catch (err: any) {
      error(err.message || 'Could not update cart quantity.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        const updated = await api.removeCartItem(productId);
        setCart(updated);
        info('Item removed from cart');
        return true;
      } else {
        setGuestItems((prev) => prev.filter((it) => it.productId !== productId));
        info('Item removed from cart');
        return true;
      }
    } catch (err: any) {
      error(err.message || 'Could not remove item.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    setCart(null);
    setGuestItems([]);
    localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  };

  const reorderOrder = async (
    orderItems: Array<{ product: Product | string; quantity: number; name?: string }>
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const itemsToMerge = (orderItems || [])
        .map((item) => {
          const prodId =
            typeof item.product === 'object' && item.product ? item.product._id : String(item.product);
          return {
            productId: prodId,
            quantity: Math.max(1, item.quantity || 1),
            product: typeof item.product === 'object' ? item.product : undefined,
          };
        })
        .filter((item) => !!item.productId && item.productId !== 'undefined');

      if (itemsToMerge.length === 0) {
        error('No valid products found in this order to reorder.');
        return false;
      }

      if (isAuthenticated) {
        const payload = itemsToMerge.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        }));
        const updated = await api.mergeCart(payload);
        setCart(updated);
      } else {
        setGuestItems((prev) => {
          const updated = [...prev];
          for (const item of itemsToMerge) {
            const index = updated.findIndex((it) => it.productId === item.productId);
            if (index > -1) {
              updated[index] = {
                ...updated[index],
                quantity: updated[index].quantity + item.quantity,
              };
            } else {
              updated.push({
                productId: item.productId,
                quantity: item.quantity,
                product: item.product,
              });
            }
          }
          return updated;
        });
      }

      const totalQuantity = itemsToMerge.reduce((acc, curr) => acc + curr.quantity, 0);
      success(`Added ${totalQuantity} item${totalQuantity === 1 ? '' : 's'} from your past order to your bag!`);
      openDrawer();
      return true;
    } catch (err: any) {
      error(err.message || 'Could not reorder items. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        shipping,
        total,
        isLoading,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        reorderOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
