
import React, { useEffect, useState } from 'react';
import { Restaurant, User } from '../types/models';
import { restaurantService, userService } from '../services/apiService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { formatDate } from '../utils/formatters';

const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, restaurantsData] = await Promise.all([
          userService.getUsers(),
          restaurantService.getRestaurants(),
        ]);
        
        setUsers(usersData);
        setRestaurants(restaurantsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleToggleUserActive = async (userId: string) => {
    try {
      const updatedUser = await userService.toggleUserActive(userId);
      setUsers(users.map(user => (user.id === userId ? updatedUser : user)));
      
      toast.success(`User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleToggleRestaurantActive = async (restaurantId: string) => {
    try {
      const updatedRestaurant = await restaurantService.toggleRestaurantActive(restaurantId);
      setRestaurants(
        restaurants.map(restaurant => (restaurant.id === restaurantId ? updatedRestaurant : restaurant))
      );
      
      toast.success(
        `Restaurant ${updatedRestaurant.isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      console.error('Error toggling restaurant status:', error);
      toast.error('Failed to update restaurant status');
    }
  };

  const filteredRestaurantUsers = users.filter(user => user.role === 'restaurant');
  const filteredCustomerUsers = users.filter(user => user.role === 'customer');

  if (loading) {
    return <div className="container mx-auto p-4">Loading admin dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="restaurants">
        <TabsList className="mb-6">
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
          <TabsTrigger value="restaurant-users">Restaurant Owners</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurants">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Manage Restaurants</h2>
              <p className="text-sm text-gray-500">
                Approve or disable restaurant listings
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Cuisine</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell className="font-medium">{restaurant.name}</TableCell>
                      <TableCell>{restaurant.cuisine}</TableCell>
                      <TableCell>{restaurant.address}</TableCell>
                      <TableCell>{formatDate(restaurant.createdAt)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            restaurant.isActive
                              ? 'bg-brand-greenLight text-brand-green'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {restaurant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={restaurant.isActive ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleToggleRestaurantActive(restaurant.id)}
                        >
                          {restaurant.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {restaurants.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No restaurants found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="restaurant-users">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Restaurant Owners</h2>
              <p className="text-sm text-gray-500">
                Approve or disable restaurant owner accounts
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRestaurantUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-brand-greenLight text-brand-green'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Pending'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={user.isActive ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleToggleUserActive(user.id)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRestaurantUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No restaurant owners found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Customers</h2>
              <p className="text-sm text-gray-500">
                Manage customer accounts
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomerUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-brand-greenLight text-brand-green'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={user.isActive ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleToggleUserActive(user.id)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCustomerUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No customers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;
