
import React, { useEffect, useState } from 'react';
import { Restaurant } from '../types/models';
import { restaurantService } from '../services/apiService';
import RestaurantCard from '../components/RestaurantCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const HomePage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [cuisines, setCuisines] = useState<string[]>([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantService.getRestaurants();
        const activeRestaurants = data.filter(restaurant => restaurant.isActive);
        setRestaurants(activeRestaurants);
        
        // Extract unique cuisines
        const uniqueCuisines = Array.from(
          new Set(activeRestaurants.map(restaurant => restaurant.cuisine))
        );
        setCuisines(uniqueCuisines);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = filter === 'All' || restaurant.cuisine === filter;
    
    return matchesSearch && matchesCuisine;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Discover Restaurants</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Browse our selection of restaurants and order your favorite meals for delivery or takeout.
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          <button
            onClick={() => setFilter('All')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              filter === 'All'
                ? 'bg-brand-orange text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All Cuisines
          </button>
          {cuisines.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setFilter(cuisine)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                filter === cuisine
                  ? 'bg-brand-orange text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold mb-4">No restaurants found</h2>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
