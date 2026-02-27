// cartcontext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useAuth } from './AuthContext';

export interface ProductVariant {
  variant_id: string;
  quantity: number;
  unit_type: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: ProductVariant;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!isAuthenticated || !user) {
        setItems([]);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }

        const cartItems = await response.json();
        setItems(cartItems);
      } catch (err) {
        console.error('Fetch cart items error:', err);
        setItems([]);
      }
    };

    fetchCartItems();
  }, [isAuthenticated, user]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    if (!isAuthenticated) {
      console.error('User must be logged in to add to cart');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          variant_id: item.variant.variant_id,
          quantity: qty,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      const newItem = await response.json();
      setItems((prev) => {
        const existingItem = prev.find((i) => i.id === item.id);
        if (existingItem) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
          );
        }
        return [...prev, { ...item, quantity: qty }];
      });
    } catch (err) {
      console.error('Add to cart error:', err);
    }
  };

  const removeFromCart = async (id: string) => {
    if (!isAuthenticated) {
      console.error('User must be logged in to remove from cart');
      return;
    }

    try {
      const parts = id.split('_');
      const variant_id = parts.slice(1).join('_');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cart/${variant_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Remove from cart error:', err);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!isAuthenticated) {
      console.error('User must be logged in to update cart');
      return;
    }

    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    try {
      const parts = id.split('_');
      const variant_id = parts.slice(1).join('_');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cart/${variant_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart item quantity');
      }

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    } catch (err) {
      console.error('Update cart quantity error:', err);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      console.error('User must be logged in to clear cart');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      setItems([]);
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};