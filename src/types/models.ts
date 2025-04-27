
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "restaurant" | "customer";
  isActive: boolean;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  address: string;
  phone: string;
  image: string;
  cuisine: string;
  isActive: boolean;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (menuItem: MenuItem, quantity: number) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  restaurantId: string | null;
  setRestaurantId: (id: string | null) => void;
  totalItems: number;
  totalAmount: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: "restaurant" | "customer") => Promise<void>;
  logout: () => void;
}
