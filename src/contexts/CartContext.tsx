
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cartService } from '../services/apiService';
import { CartContextType, CartItem, MenuItem } from '../types/models';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Load cart from local storage on initial mount
  useEffect(() => {
    const { items: storedItems, restaurantId: storedRestaurantId } = cartService.getCart();
    setItems(storedItems);
    setRestaurantId(storedRestaurantId);
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    cartService.saveCart(items, restaurantId);
  }, [items, restaurantId]);

  const addToCart = (menuItem: MenuItem, quantity: number) => {
    // Check if adding from a different restaurant
    if (restaurantId && menuItem.restaurantId !== restaurantId && items.length > 0) {
      const proceed = window.confirm(
        'Your cart contains items from a different restaurant. Adding this item will clear your current cart. Continue?'
      );
      
      if (!proceed) return;
      
      // Clear cart and add the new item from the new restaurant
      setItems([{ menuItem, quantity }]);
      setRestaurantId(menuItem.restaurantId);
      toast.success(`${menuItem.name} added to cart`);
      return;
    }

    // Set restaurant ID if cart is empty
    if (items.length === 0) {
      setRestaurantId(menuItem.restaurantId);
    }

    // Check if item already in cart
    const existingItemIndex = items.findIndex(item => item.menuItem.id === menuItem.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      setItems(updatedItems);
    } else {
      setItems([...items, { menuItem, quantity }]);
    }
    
    toast.success(`${menuItem.name} added to cart`);
  };

  const removeFromCart = (menuItemId: string) => {
    setItems(items.filter(item => item.menuItem.id !== menuItemId));
    
    // Reset restaurant ID if cart becomes empty
    if (items.length === 1) {
      setRestaurantId(null);
    }
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    
    setItems(
      items.map(item =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    cartService.clearCart();
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalAmount = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    restaurantId,
    setRestaurantId,
    totalItems,
    totalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};
