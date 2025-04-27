
import React from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../types/models';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="block">
      <Card className="h-full restaurant-card">
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="h-full w-full object-cover transition-all hover:scale-105"
          />
        </div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle>{restaurant.name}</CardTitle>
            <Badge>{restaurant.cuisine}</Badge>
          </div>
          <CardDescription>{restaurant.description}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-gray-500 pb-4">
          <div>{restaurant.address}</div>
          <div>{restaurant.phone}</div>
        </CardContent>
        <CardFooter>
          <Link 
            to={`/restaurant/${restaurant.id}`}
            className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white py-2 rounded-md text-center"
          >
            View Menu
          </Link>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default RestaurantCard;
