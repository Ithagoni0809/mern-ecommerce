import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], totalAmount: 0 });
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.get('/cart');
      setCart(data.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      alert('Please log in with a customer account to add items to your cart.');
      return false;
    }
    if (user.role === 'delivery') {
      alert('Delivery agent accounts are in Fulfillment Mode and cannot add items to cart. Please use a Customer account.');
      return false;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/cart', { productId, quantity });
      setCart(data.data);
      alert('Product added to your shopping cart!');
      return true;
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const { data } = await API.put(`/cart/items/${productId}`, { quantity });
      setCart(data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const { data } = await API.delete(`/cart/items/${productId}`);
      setCart(data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const { data } = await API.delete('/cart');
      setCart(data.data);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
