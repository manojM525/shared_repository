// WishlistContext.tsx (new file in context folder)

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config';

interface ProductVariant {
  variant_id: string;
  quantity: number;
  unit_type: string;
  price: number | null;
}

interface ProductPoint {
  point_id: string;
  point_type: 'description' | 'nutritional';
  point_text: string;
  order_num: number;
}

interface Product {
  product_id: string;
  name: string;
  description: string;
  image_url: string;
  stock_status: 'in_stock' | 'out_of_stock';
  category_id: string;
  category_name: string;
  variants: ProductVariant[];
  points: ProductPoint[];
}

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setWishlist([]);
      setLoading(false);
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, authLoading]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch wishlist');
      }

      const data: Product[] = await response.json();
      data.forEach((product) => {
        product.variants = Array.isArray(product.variants) ? product.variants.filter(v => v.price != null) : [];
        product.variants.sort((a, b) => a.quantity - b.quantity);
        product.points = Array.isArray(product.points) ? product.points : [];
        product.points.sort((a, b) => a.order_num - b.order_num);
      });
      setWishlist(data);
    } catch (err) {
      console.error('Fetch wishlist error:', err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });
      if (!response.ok) throw new Error('Failed to add to wishlist');
      await fetchWishlist();
    } catch (err) {
      console.error('Add to wishlist error:', err);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to remove from wishlist');
      await fetchWishlist();
    } catch (err) {
      console.error('Remove from wishlist error:', err);
    }
  };

  const isInWishlist = (productId: string) => wishlist.some((item) => item.product_id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};