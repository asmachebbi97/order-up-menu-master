
import { toast } from 'sonner';
import { CartItem, MenuItem, Order, Restaurant, User } from '../types/models';
import { mockMenuItems, mockOrders, mockRestaurants, mockUsers } from './mockData';

// Base URL for the Laravel API
const API_BASE_URL = '/api'; // Should be updated to match your Laravel API URL

// Helper function for API requests
const apiRequest = async (endpoint: string, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('digital_menu_token')}`,
        ...(options.headers || {})
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Local storage keys
const STORAGE_KEYS = {
  USERS: 'digital_menu_users',
  RESTAURANTS: 'digital_menu_restaurants',
  MENU_ITEMS: 'digital_menu_items',
  ORDERS: 'digital_menu_orders',
  AUTH_USER: 'digital_menu_auth_user',
  CART: 'digital_menu_cart',
  TOKEN: 'digital_menu_token',
};

// Helper functions
const getStorageData = <T>(key: string, mockData: T[]): T[] => {
  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      return JSON.parse(storedData);
    }
    // Initialize with mock data
    localStorage.setItem(key, JSON.stringify(mockData));
    return mockData;
  } catch (error) {
    console.error(`Error retrieving ${key} from local storage:`, error);
    return mockData;
  }
};

const setStorageData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to local storage:`, error);
  }
};

// Initialize storage with mock data
const initializeStorage = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RESTAURANTS)) {
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(mockRestaurants));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MENU_ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(mockMenuItems));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(mockOrders));
  }
};

// Initialize on load for mock data fallback
initializeStorage();

// Auth services
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      // For demo: admin/admin is hardcoded
      if (email === 'admin' && password === 'admin') {
        const admin = mockUsers.find(u => u.role === 'admin')!;
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(admin));
        return admin;
      }

      // Call Laravel API login endpoint
      const response = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      const { user, token } = response;
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      return user;
    } catch (error) {
      // Fallback to mock data for demo
      const users = getStorageData<User>(STORAGE_KEYS.USERS, mockUsers);
      const user = users.find(u => u.email === email);
      
      if (user && user.isActive) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
        return user;
      }
      
      throw new Error('Invalid credentials or inactive account');
    }
  },

  register: async (email: string, password: string, name: string, role: "restaurant" | "customer"): Promise<User> => {
    try {
      // Call Laravel API register endpoint
      const response = await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role }),
      });
      
      const { user, token } = response;
      
      if (role === 'customer') {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      }
      
      return user;
    } catch (error) {
      // Fallback to mock data for demo
      const users = getStorageData<User>(STORAGE_KEYS.USERS, mockUsers);
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        role,
        // Restaurant users need admin approval
        isActive: role === 'customer',
        createdAt: new Date().toISOString(),
      };
      
      const updatedUsers = [...users, newUser];
      setStorageData(STORAGE_KEYS.USERS, updatedUsers);
      
      if (role === 'customer') {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(newUser));
      }
      
      if (role !== 'customer') {
        throw new Error('Restaurant account pending approval by admin');
      }
      
      return newUser;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Call Laravel API logout endpoint if user is logged in
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        await apiRequest('/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};

// User services
export const userService = {
  getUsers: async (): Promise<User[]> => {
    try {
      // Call Laravel API users endpoint
      return await apiRequest('/users');
    } catch (error) {
      // Fallback to mock data for demo
      return getStorageData<User>(STORAGE_KEYS.USERS, mockUsers);
    }
  },

  toggleUserActive: async (userId: string): Promise<User> => {
    try {
      // Call Laravel API toggle user active endpoint
      return await apiRequest(`/users/${userId}/toggle-active`, {
        method: 'POST',
      });
    } catch (error) {
      // Fallback to mock data for demo
      const users = getStorageData<User>(STORAGE_KEYS.USERS, mockUsers);
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, isActive: !user.isActive };
        }
        return user;
      });
      
      setStorageData(STORAGE_KEYS.USERS, updatedUsers);
      const updatedUser = updatedUsers.find(user => user.id === userId);
      
      if (!updatedUser) {
        throw new Error('User not found');
      }
      
      return updatedUser;
    }
  },
};

// Restaurant services
export const restaurantService = {
  getRestaurants: async (): Promise<Restaurant[]> => {
    try {
      // Call Laravel API restaurants endpoint
      return await apiRequest('/restaurants');
    } catch (error) {
      // Fallback to mock data for demo
      return getStorageData<Restaurant>(STORAGE_KEYS.RESTAURANTS, mockRestaurants);
    }
  },

  getRestaurant: async (id: string): Promise<Restaurant> => {
    try {
      // Call Laravel API restaurant endpoint
      return await apiRequest(`/restaurants/${id}`);
    } catch (error) {
      // Fallback to mock data for demo
      const restaurants = getStorageData<Restaurant>(STORAGE_KEYS.RESTAURANTS, mockRestaurants);
      const restaurant = restaurants.find(r => r.id === id);
      
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      
      return restaurant;
    }
  },

  createRestaurant: async (restaurant: Omit<Restaurant, 'id' | 'createdAt' | 'isActive'>): Promise<Restaurant> => {
    try {
      // Call Laravel API create restaurant endpoint
      return await apiRequest('/restaurants', {
        method: 'POST',
        body: JSON.stringify(restaurant),
      });
    } catch (error) {
      // Fallback to mock data for demo
      const restaurants = getStorageData<Restaurant>(STORAGE_KEYS.RESTAURANTS, mockRestaurants);
      const newRestaurant: Restaurant = {
        ...restaurant,
        id: `restaurant_${Date.now()}`,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      
      const updatedRestaurants = [...restaurants, newRestaurant];
      setStorageData(STORAGE_KEYS.RESTAURANTS, updatedRestaurants);
      
      return newRestaurant;
    }
  },

  updateRestaurant: async (id: string, updates: Partial<Restaurant>): Promise<Restaurant> => {
    try {
      // Call Laravel API update restaurant endpoint
      return await apiRequest(`/restaurants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      // Fallback to mock data for demo
      const restaurants = getStorageData<Restaurant>(STORAGE_KEYS.RESTAURANTS, mockRestaurants);
      const restaurantIndex = restaurants.findIndex(r => r.id === id);
      
      if (restaurantIndex === -1) {
        throw new Error('Restaurant not found');
      }
      
      const updatedRestaurant = {
        ...restaurants[restaurantIndex],
        ...updates,
      };
      
      const updatedRestaurants = [...restaurants];
      updatedRestaurants[restaurantIndex] = updatedRestaurant;
      
      setStorageData(STORAGE_KEYS.RESTAURANTS, updatedRestaurants);
      
      return updatedRestaurant;
    }
  },

  toggleRestaurantActive: async (id: string): Promise<Restaurant> => {
    try {
      // Call Laravel API toggle restaurant active endpoint
      return await apiRequest(`/restaurants/${id}/toggle-active`, {
        method: 'POST',
      });
    } catch (error) {
      // Fallback to mock data for demo
      const restaurants = getStorageData<Restaurant>(STORAGE_KEYS.RESTAURANTS, mockRestaurants);
      const restaurantIndex = restaurants.findIndex(r => r.id === id);
      
      if (restaurantIndex === -1) {
        throw new Error('Restaurant not found');
      }
      
      const updatedRestaurant = {
        ...restaurants[restaurantIndex],
        isActive: !restaurants[restaurantIndex].isActive,
      };
      
      const updatedRestaurants = [...restaurants];
      updatedRestaurants[restaurantIndex] = updatedRestaurant;
      
      setStorageData(STORAGE_KEYS.RESTAURANTS, updatedRestaurants);
      
      return updatedRestaurant;
    }
  },

  getRestaurantsByOwner: async (ownerId: string): Promise<Restaurant[]> => {
    try {
      // Call Laravel API restaurants by owner endpoint
      return await apiRequest(`/users/${ownerId}/restaurants`);
    } catch (error) {
      // Fallback to mock data for demo
      const restaurants = getStorageData<Restaurant>(STORAGE_KEYS.RESTAURANTS, mockRestaurants);
      return restaurants.filter(restaurant => restaurant.ownerId === ownerId);
    }
  },
};

// Menu item services
export const menuItemService = {
  getMenuItems: async (restaurantId: string): Promise<MenuItem[]> => {
    try {
      // Call Laravel API menu items endpoint
      return await apiRequest(`/restaurants/${restaurantId}/menu-items`);
    } catch (error) {
      // Fallback to mock data for demo
      const menuItems = getStorageData<MenuItem>(STORAGE_KEYS.MENU_ITEMS, mockMenuItems);
      return menuItems.filter(item => item.restaurantId === restaurantId);
    }
  },

  createMenuItem: async (menuItem: Omit<MenuItem, 'id' | 'createdAt'>): Promise<MenuItem> => {
    try {
      // Call Laravel API create menu item endpoint
      return await apiRequest('/menu-items', {
        method: 'POST',
        body: JSON.stringify(menuItem),
      });
    } catch (error) {
      // Fallback to mock data for demo
      const menuItems = getStorageData<MenuItem>(STORAGE_KEYS.MENU_ITEMS, mockMenuItems);
      const newMenuItem: MenuItem = {
        ...menuItem,
        id: `menuItem_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      const updatedMenuItems = [...menuItems, newMenuItem];
      setStorageData(STORAGE_KEYS.MENU_ITEMS, updatedMenuItems);
      
      return newMenuItem;
    }
  },

  updateMenuItem: async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
    try {
      // Call Laravel API update menu item endpoint
      return await apiRequest(`/menu-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      // Fallback to mock data for demo
      const menuItems = getStorageData<MenuItem>(STORAGE_KEYS.MENU_ITEMS, mockMenuItems);
      const menuItemIndex = menuItems.findIndex(item => item.id === id);
      
      if (menuItemIndex === -1) {
        throw new Error('Menu item not found');
      }
      
      const updatedMenuItem = {
        ...menuItems[menuItemIndex],
        ...updates,
      };
      
      const updatedMenuItems = [...menuItems];
      updatedMenuItems[menuItemIndex] = updatedMenuItem;
      
      setStorageData(STORAGE_KEYS.MENU_ITEMS, updatedMenuItems);
      
      return updatedMenuItem;
    }
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    try {
      // Call Laravel API delete menu item endpoint
      await apiRequest(`/menu-items/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // Fallback to mock data for demo
      const menuItems = getStorageData<MenuItem>(STORAGE_KEYS.MENU_ITEMS, mockMenuItems);
      const updatedMenuItems = menuItems.filter(item => item.id !== id);
      
      if (menuItems.length === updatedMenuItems.length) {
        throw new Error('Menu item not found');
      }
      
      setStorageData(STORAGE_KEYS.MENU_ITEMS, updatedMenuItems);
    }
  },
};

// Order services
export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    try {
      // This endpoint isn't explicitly in the routes, but would exist for admin
      return await apiRequest('/orders');
    } catch (error) {
      // Fallback to mock data for demo
      return getStorageData<Order>(STORAGE_KEYS.ORDERS, mockOrders);
    }
  },

  getOrdersByRestaurant: async (restaurantId: string): Promise<Order[]> => {
    try {
      // Call Laravel API orders by restaurant endpoint
      return await apiRequest(`/restaurants/${restaurantId}/orders`);
    } catch (error) {
      // Fallback to mock data for demo
      const orders = getStorageData<Order>(STORAGE_KEYS.ORDERS, mockOrders);
      return orders.filter(order => order.restaurantId === restaurantId);
    }
  },

  getOrdersByCustomer: async (customerId: string): Promise<Order[]> => {
    try {
      // Call Laravel API orders by customer endpoint
      return await apiRequest(`/users/${customerId}/orders`);
    } catch (error) {
      // Fallback to mock data for demo
      const orders = getStorageData<Order>(STORAGE_KEYS.ORDERS, mockOrders);
      return orders.filter(order => order.customerId === customerId);
    }
  },

  createOrder: async (customerId: string, restaurantId: string, items: CartItem[]): Promise<Order> => {
    try {
      // Call Laravel API create order endpoint
      const orderData = {
        restaurant_id: restaurantId,
        items: items.map(item => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity
        }))
      };
      
      return await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    } catch (error) {
      // Fallback to mock data for demo
      const totalAmount = items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );
      
      const newOrder: Order = {
        id: `order_${Date.now()}`,
        customerId,
        restaurantId,
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          name: item.menuItem.name,
          price: item.menuItem.price,
          quantity: item.quantity,
        })),
        status: 'pending',
        totalAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const orders = getStorageData<Order>(STORAGE_KEYS.ORDERS, mockOrders);
      const updatedOrders = [...orders, newOrder];
      setStorageData(STORAGE_KEYS.ORDERS, updatedOrders);
      
      return newOrder;
    }
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    try {
      // Call Laravel API update order status endpoint
      return await apiRequest(`/orders/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      // Fallback to mock data for demo
      const orders = getStorageData<Order>(STORAGE_KEYS.ORDERS, mockOrders);
      const orderIndex = orders.findIndex(order => order.id === id);
      
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }
      
      const updatedOrder = {
        ...orders[orderIndex],
        status,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedOrders = [...orders];
      updatedOrders[orderIndex] = updatedOrder;
      
      setStorageData(STORAGE_KEYS.ORDERS, updatedOrders);
      
      return updatedOrder;
    }
  },
};

// Cart services
export const cartService = {
  getCart: (): { items: CartItem[]; restaurantId: string | null } => {
    try {
      const cartData = localStorage.getItem(STORAGE_KEYS.CART);
      if (cartData) {
        return JSON.parse(cartData);
      }
      return { items: [], restaurantId: null };
    } catch (error) {
      console.error('Error retrieving cart from local storage:', error);
      return { items: [], restaurantId: null };
    }
  },

  saveCart: (items: CartItem[], restaurantId: string | null): void => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CART,
        JSON.stringify({ items, restaurantId })
      );
    } catch (error) {
      console.error('Error saving cart to local storage:', error);
    }
  },

  clearCart: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CART);
    } catch (error) {
      console.error('Error clearing cart from local storage:', error);
    }
  },
};

// Statistics services
export const statisticsService = {
  getAdminStats: async (): Promise<any> => {
    try {
      // This would be a custom endpoint for admin statistics
      return await apiRequest('/admin/statistics');
    } catch (error) {
      // Fallback to mock data
      return {
        totalRestaurants: 24,
        totalOrders: 2543,
        totalRevenue: 45678,
        trends: {
          restaurants: { value: 4, isPositive: true },
          orders: { value: 12, isPositive: true },
          revenue: { value: 18, isPositive: true }
        },
        topRestaurants: [
          { name: "Restaurant A", orders: 156, revenue: 12500, customers: 98 },
          { name: "Restaurant B", orders: 132, revenue: 10800, customers: 85 },
          { name: "Restaurant C", orders: 98, revenue: 8900, customers: 67 },
        ],
        monthlySales: [
          { date: 'Jan', amount: 25000 },
          { date: 'Feb', amount: 30000 },
          { date: 'Mar', amount: 35000 },
          { date: 'Apr', amount: 32000 },
        ]
      };
    }
  },
  
  getRestaurantStats: async (restaurantId: string): Promise<any> => {
    try {
      // This would be a custom endpoint for restaurant statistics
      return await apiRequest(`/restaurants/${restaurantId}/statistics`);
    } catch (error) {
      // Fallback to mock data
      return {
        totalCustomers: 1234,
        totalOrders: 856,
        totalRevenue: 12345,
        trends: {
          customers: { value: 12, isPositive: true },
          orders: { value: 8, isPositive: true },
          revenue: { value: 15, isPositive: true }
        },
        monthlySales: [
          { date: 'Jan', amount: 4000 },
          { date: 'Feb', amount: 3000 },
          { date: 'Mar', amount: 5000 },
          { date: 'Apr', amount: 4500 },
        ],
        yearlySales: [
          { date: '2023', amount: 45000 },
          { date: '2024', amount: 52000 },
        ]
      };
    }
  }
};

