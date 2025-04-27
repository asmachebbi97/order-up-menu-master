
import React from 'react';
import { MenuItem as MenuItemType } from '../types/models';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface MenuItemProps {
  menuItem: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = ({ menuItem }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart(menuItem, 1);
  };

  return (
    <Card className="menu-item-card h-full flex flex-col">
      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
        <img
          src={menuItem.image}
          alt={menuItem.name}
          className="h-full w-full object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{menuItem.name}</CardTitle>
          <span className="font-semibold text-brand-orange">{formatCurrency(menuItem.price)}</span>
        </div>
        <CardDescription className="line-clamp-2">{menuItem.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Badge className="bg-brand-orangeLight text-brand-orange">{menuItem.category}</Badge>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
          disabled={!menuItem.isAvailable || !user}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {!user 
            ? 'Log in to order' 
            : !menuItem.isAvailable 
            ? 'Not available' 
            : 'Add to cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <span 
    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

export default MenuItem;
