
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MenuItem, Restaurant } from '../types/models';
import { menuItemService, restaurantService } from '../services/apiService';
import MenuItemComponent from '../components/MenuItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RestaurantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const restaurantData = await restaurantService.getRestaurant(id);
        
        if (!restaurantData.isActive) {
          throw new Error('Restaurant is not currently active');
        }
        
        setRestaurant(restaurantData);
        
        const menuItemsData = await menuItemService.getMenuItems(id);
        setMenuItems(menuItemsData);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(menuItemsData.map(item => item.category))
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-12 w-1/3 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Restaurant Not Found</h2>
        <p className="text-gray-600 mb-8">
          The restaurant you're looking for doesn't exist or is not active.
        </p>
        <a href="/" className="text-brand-orange hover:underline">
          Return to Home
        </a>
      </div>
    );
  }

  const filteredMenuItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10">
        <div className="h-64 w-full overflow-hidden rounded-lg mb-6">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
        <p className="text-gray-600 mb-4">{restaurant.description}</p>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <div>
            <strong>Cuisine:</strong> {restaurant.cuisine}
          </div>
          <div>
            <strong>Address:</strong> {restaurant.address}
          </div>
          <div>
            <strong>Phone:</strong> {restaurant.phone}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Menu</h2>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-6 overflow-x-auto flex w-full">
            <TabsTrigger value="all" onClick={() => setActiveCategory('all')}>
              All Items
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeCategory} className="mt-0">
            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600">No items found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenuItems.map(menuItem => (
                  <MenuItemComponent key={menuItem.id} menuItem={menuItem} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RestaurantDetailsPage;
