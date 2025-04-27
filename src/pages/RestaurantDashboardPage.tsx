
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MenuItem, Order, Restaurant } from '../types/models';
import { menuItemService, orderService, restaurantService } from '../services/apiService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileEdit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '../utils/formatters';

const RestaurantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);

  // Menu item form state
  const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isAvailable: true
  });

  // Restaurant form state
  const [isRestaurantDialogOpen, setIsRestaurantDialogOpen] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    cuisine: '',
    image: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const restaurantsData = await restaurantService.getRestaurantsByOwner(user.id);
        setRestaurants(restaurantsData);

        if (restaurantsData.length > 0) {
          const firstRestaurantId = restaurantsData[0].id;
          setActiveRestaurantId(firstRestaurantId);
          
          // Fetch menu items and orders for the first restaurant
          const [menuItemsData, ordersData] = await Promise.all([
            menuItemService.getMenuItems(firstRestaurantId),
            orderService.getOrdersByRestaurant(firstRestaurantId),
          ]);
          
          setMenuItems(menuItemsData);
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        toast.error('Failed to load restaurant data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleRestaurantChange = async (restaurantId: string) => {
    setActiveRestaurantId(restaurantId);
    
    try {
      const [menuItemsData, ordersData] = await Promise.all([
        menuItemService.getMenuItems(restaurantId),
        orderService.getOrdersByRestaurant(restaurantId),
      ]);
      
      setMenuItems(menuItemsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      toast.error('Failed to load restaurant data');
    }
  };

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      const { name, description, address, phone, cuisine, image } = restaurantForm;
      
      if (!name || !description || !address || !phone || !cuisine) {
        toast.error('Please fill in all required fields');
        return;
      }

      const newRestaurant = await restaurantService.createRestaurant({
        name,
        description,
        ownerId: user.id,
        address,
        phone,
        image: image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', // Default image
        cuisine,
      });
      
      setRestaurants([...restaurants, newRestaurant]);
      setActiveRestaurantId(newRestaurant.id);
      setMenuItems([]);
      setOrders([]);
      
      setIsRestaurantDialogOpen(false);
      resetRestaurantForm();
      
      toast.success('Restaurant created successfully');
    } catch (error) {
      console.error('Error creating restaurant:', error);
      toast.error('Failed to create restaurant');
    }
  };

  const resetRestaurantForm = () => {
    setRestaurantForm({
      name: '',
      description: '',
      address: '',
      phone: '',
      cuisine: '',
      image: '',
    });
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeRestaurantId) return;
    
    try {
      const { name, description, price, category, image, isAvailable } = menuItemForm;
      
      if (!name || !description || !price || !category) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (editingMenuItem) {
        // Update existing menu item
        const updatedItem = await menuItemService.updateMenuItem(editingMenuItem.id, {
          name,
          description,
          price: parseFloat(price),
          category,
          image: image || editingMenuItem.image,
          isAvailable,
        });
        
        setMenuItems(menuItems.map(item => 
          item.id === editingMenuItem.id ? updatedItem : item
        ));
        
        toast.success('Menu item updated successfully');
      } else {
        // Create new menu item
        const newMenuItem = await menuItemService.createMenuItem({
          restaurantId: activeRestaurantId,
          name,
          description,
          price: parseFloat(price),
          category,
          image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', // Default image
          isAvailable,
        });
        
        setMenuItems([...menuItems, newMenuItem]);
        toast.success('Menu item created successfully');
      }
      
      setIsMenuItemDialogOpen(false);
      resetMenuItemForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleEditMenuItem = (menuItem: MenuItem) => {
    setEditingMenuItem(menuItem);
    setMenuItemForm({
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price.toString(),
      category: menuItem.category,
      image: menuItem.image,
      isAvailable: menuItem.isAvailable,
    });
    setIsMenuItemDialogOpen(true);
  };

  const handleDeleteMenuItem = async (menuItemId: string) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }
    
    try {
      await menuItemService.deleteMenuItem(menuItemId);
      setMenuItems(menuItems.filter(item => item.id !== menuItemId));
      toast.success('Menu item deleted successfully');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const resetMenuItemForm = () => {
    setEditingMenuItem(null);
    setMenuItemForm({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      isAvailable: true,
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading restaurant dashboard...</div>;
  }

  if (restaurants.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Restaurant Dashboard</h1>
        <p className="text-gray-600 mb-8">
          You don't have any restaurants yet. Create your first restaurant to get started.
        </p>
        
        <Dialog open={isRestaurantDialogOpen} onOpenChange={setIsRestaurantDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Your Restaurant</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Restaurant</DialogTitle>
              <DialogDescription>
                Provide details about your restaurant. You'll be able to add menu items after creation.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddRestaurant} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    value={restaurantForm.name}
                    onChange={(e) => setRestaurantForm({...restaurantForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine Type *</Label>
                  <Input
                    id="cuisine"
                    value={restaurantForm.cuisine}
                    onChange={(e) => setRestaurantForm({...restaurantForm, cuisine: e.target.value})}
                    placeholder="Italian, French, Indian, etc."
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={restaurantForm.description}
                    onChange={(e) => setRestaurantForm({...restaurantForm, description: e.target.value})}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={restaurantForm.address}
                    onChange={(e) => setRestaurantForm({...restaurantForm, address: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={restaurantForm.phone}
                    onChange={(e) => setRestaurantForm({...restaurantForm, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={restaurantForm.image}
                    onChange={(e) => setRestaurantForm({...restaurantForm, image: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsRestaurantDialogOpen(false);
                    resetRestaurantForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Restaurant</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
          
          <Dialog open={isRestaurantDialogOpen} onOpenChange={setIsRestaurantDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Restaurant
              </Button>
            </DialogTrigger>
            {/* Restaurant form content (same as above) */}
          </Dialog>
        </div>
        
        {restaurants.length > 1 && (
          <div className="mb-6">
            <Label htmlFor="restaurant-select">Select Restaurant</Label>
            <Select
              value={activeRestaurantId || ""}
              onValueChange={handleRestaurantChange}
            >
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select a restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Tabs defaultValue="menu">
        <TabsList className="mb-6">
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Menu Management</CardTitle>
                  <CardDescription>
                    Add, edit or remove items from your menu
                  </CardDescription>
                </div>
                
                <Dialog
                  open={isMenuItemDialogOpen}
                  onOpenChange={(open) => {
                    setIsMenuItemDialogOpen(open);
                    if (!open) resetMenuItemForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Menu Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingMenuItem 
                          ? 'Update the details of this menu item'
                          : 'Add a new item to your restaurant menu'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleAddMenuItem} className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="item-name">Item Name *</Label>
                          <Input
                            id="item-name"
                            value={menuItemForm.name}
                            onChange={(e) => setMenuItemForm({...menuItemForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item-price">Price *</Label>
                          <Input
                            id="item-price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={menuItemForm.price}
                            onChange={(e) => setMenuItemForm({...menuItemForm, price: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="item-description">Description *</Label>
                          <Textarea
                            id="item-description"
                            value={menuItemForm.description}
                            onChange={(e) => setMenuItemForm({...menuItemForm, description: e.target.value})}
                            rows={2}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item-category">Category *</Label>
                          <Input
                            id="item-category"
                            value={menuItemForm.category}
                            onChange={(e) => setMenuItemForm({...menuItemForm, category: e.target.value})}
                            placeholder="Appetizer, Main Course, Dessert, etc."
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item-image">Image URL</Label>
                          <Input
                            id="item-image"
                            value={menuItemForm.image}
                            onChange={(e) => setMenuItemForm({...menuItemForm, image: e.target.value})}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2 flex items-center">
                          <input
                            id="item-available"
                            type="checkbox"
                            className="mr-2"
                            checked={menuItemForm.isAvailable}
                            onChange={(e) => setMenuItemForm({...menuItemForm, isAvailable: e.target.checked})}
                          />
                          <Label htmlFor="item-available" className="cursor-pointer">
                            Item is available for ordering
                          </Label>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsMenuItemDialogOpen(false);
                            resetMenuItemForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingMenuItem ? 'Update Item' : 'Add Item'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {menuItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    You don't have any menu items yet. Add your first menu item to get started.
                  </p>
                  <Button
                    onClick={() => setIsMenuItemDialogOpen(true)}
                    variant="outline"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Menu Item
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.isAvailable
                                  ? 'bg-brand-greenLight text-brand-green'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleEditMenuItem(item)}
                              >
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteMenuItem(item.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                View and manage customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">You don't have any orders yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.id.substring(0, 8)}...</TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>
                            {order.items.map((item) => (
                              <div key={item.menuItemId} className="text-sm">
                                {item.quantity}x {item.name}
                              </div>
                            ))}
                          </TableCell>
                          <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                                order.status === 'preparing' ? 'bg-purple-100 text-purple-600' :
                                order.status === 'ready' ? 'bg-green-100 text-green-600' :
                                order.status === 'delivered' ? 'bg-brand-greenLight text-brand-green' :
                                'bg-red-100 text-red-600'
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={order.status}
                              onValueChange={(value) => 
                                handleUpdateOrderStatus(order.id, value as Order['status'])
                              }
                              disabled={order.status === 'delivered' || order.status === 'cancelled'}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantDashboardPage;
