
import { toast } from 'sonner';
import { CartItem, MenuItem, Order, Restaurant, User } from '../types/models';
import { mockMenuItems, mockOrders, mockRestaurants, mockUsers } from './mockData';

// Local storage keys
const STORAGE_KEYS = {
  USERS: 'digital_menu_users',
  RESTAURANTS: 'digital_menu_restaurants',
  MENU_ITEMS: 'digital_menu_items',
  ORDERS: 'digital_menu_orders',
  AUTH_USER: 'digital_menu_auth_user',
  CART: 'digital_menu_cart',
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

// Initialize on load
initializeStorage();

// Auth services
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo: admin/admin is hardcoded
    if (email === 'admin' && password === 'admin') {
      const admin = mockUsers.find(u => u.role === 'admin')!;
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(admin));
      return admin;
    }

    const users = getStorageData<User>(STORAGE_KEYS.USERS, mockUsers);
    const user = users.find(u => u.email === email);
    
    if (user && user.isActive) {
      // In a real app, we would check the password hash
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      return user;
    }
    
    throw new Error('Invalid credentials or inactive account');
  },

  register: async (email: string, password: string, name: string, role: "restaurant" | "customer"): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
      return newUser;
    }
    
    throw new Error('Restaurant account pending approval by admin');
  },

  logout: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return getStorageData<User>(STORAGE_KEYS.USERS, mockUsers);
  },

  toggleUserActive: async (userId: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
  },
};

// Restaurant services
export const restaurantService = {
  getRestaurants: async (): Promise<Restaurant[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return getStorageData<Restaurant>(STORAGE_KEYS.RESTAURANTS, mockRestaurants);
  },

  getRestaurant: async (id: string): Promise<Restaurant> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const restaurants = getStorageData<Restaurant>(STORAGE_KEYS.RESTAURANTS, mockRestaurants);
    const restaurant = restaurants.find(r => r.id === id);
    
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }
    
    return restaurant;
  },

  createRestaurant: async (restaurant: Omit<Restaurant, 'id' | 'createdAt' | 'isActive'>): Promise<Restaurant> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
  },

  updateRestaurant: async (id: string, updates: Partial<Restaurant>): Promise<Restaurant> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
  },

  toggleRestaurantActive: async (id: string): Promise<Restaurant> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
  },

  getRestaurantsByOwner: async (ownerId: string): Promise<Restaurant[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const restaurants = getStorageData<Restaurant>(STORAGE_KEYS.RESTAURANTS, mockRestaurants);
    return restaurants.filter(restaurant => restaurant.ownerId === ownerId);
  },
};

// Menu item services
export const menuItemService = {
  getMenuItems: async (restaurantId: string): Promise<MenuItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const menuItems = getStorageData<MenuItem>(STORAGE_KEYS.MENU_ITEMS, mockMenuItems);
    return menuItems.filter(item => item.restaurantId === restaurantId);
  },

  createMenuItem: async (menuItem: Omit<MenuItem, 'id' | 'createdAt'>): Promise<MenuItem> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const menuItems = getStorageData<MenuItem>(STORAGE_KEYS.MENU_ITEMS, mockMenuItems);
    const newMenuItem: MenuItem = {
      ...menuItem,
      id: `menuItem_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    const updatedMenuItems = [...menuItems, newMenuItem];
    setStorageData(STORAGE_KEYS.MENU_ITEMS, updatedMenuItems);
    
    return newMenuItem;
  },

  updateMenuItem: async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const menuItems = getStorageData<MenuItem>(STORAGE_KEYS.MENU_ITEMS, mockMenuItems);
    const updatedMenuItems = menuItems.filter(item => item.id !== id);
    
    if (menuItems.length === updatedMenuItems.length) {
      throw new Error('Menu item not found');
    }
    
    setStorageData(STORAGE_KEYS.MENU_ITEMS, updatedMenuItems);
  },
};

// Order services
export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return getStorageData<Order>(STORAGE_KEYS.ORDERS, mockOrders);
  },

  getOrdersByRestaurant: async (restaurantId: string): Promise<Order[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const orders = getStorageData<Order>(STORAGE_KEYS.ORDERS, mockOrders);
    return orders.filter(order => order.restaurantId === restaurantId);
  },

  getOrdersByCustomer: async (customerId: string): Promise<Order[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const orders = getStorageData<Order>(STORAGE_KEYS.ORDERS, mockOrders);
    return orders.filter(order => order.customerId === customerId);
  },

  createOrder: async (customerId: string, restaurantId: string, items: CartItem[]): Promise<Order> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
