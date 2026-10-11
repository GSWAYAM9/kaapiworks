import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Wishlist, WishlistItem, Product } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

interface WishlistContextType {
  wishlist: Wishlist | null;
  items: WishlistItem[];
  itemCount: number;
  productIds: string[];
  isLoading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string, productFallback?: Product) => Promise<boolean>;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { success, info, error } = useToast();

  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.getWishlist();
      setWishlist(data);
    } catch (err: any) {
      console.warn('Failed to fetch wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const productIds = wishlist?.productIds || wishlist?.items?.map((it) => it.product?._id).filter(Boolean) || [];

  const isWishlisted = useCallback(
    (productId: string) => {
      if (!productId) return false;
      return productIds.includes(productId);
    },
    [productIds]
  );

  const toggleWishlist = async (productId: string, productFallback?: Product): Promise<boolean> => {
    if (!isAuthenticated) {
      info('Please sign in to save coffees to your wishlist.');
      return false;
    }

    try {
      const res = await api.toggleWishlist(productId);
      setWishlist(res.data);
      if (res.inWishlist) {
        success(res.message || 'Saved to your wishlist');
      } else {
        info(res.message || 'Removed from wishlist');
      }
      return res.inWishlist;
    } catch (err: any) {
      error(err.message || 'Failed to update wishlist');
      return isWishlisted(productId);
    }
  };

  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      info('Please sign in to save coffees to your wishlist.');
      return false;
    }

    try {
      const data = await api.addToWishlist(productId);
      setWishlist(data);
      success('Item added to your wishlist');
      return true;
    } catch (err: any) {
      error(err.message || 'Failed to add item to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const data = await api.removeFromWishlist(productId);
      setWishlist(data);
      info('Item removed from wishlist');
      return true;
    } catch (err: any) {
      error(err.message || 'Failed to remove item from wishlist');
      return false;
    }
  };

  const clearWishlist = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const data = await api.clearWishlist();
      setWishlist(data);
      info('Wishlist cleared');
      return true;
    } catch (err: any) {
      error(err.message || 'Failed to clear wishlist');
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        items: wishlist?.items || [],
        itemCount: wishlist?.itemCount ?? (wishlist?.items?.length || 0),
        productIds,
        isLoading,
        isWishlisted,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
