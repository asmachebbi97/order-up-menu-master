
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Menu, X, User, LogOut, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-brand-orange">
            OrderUp
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMenu} size="icon">
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-brand-orange">
              Home
            </Link>
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="text-gray-700 hover:text-brand-orange">
                  Admin Dashboard
                </Link>
                <Link to="/admin/statistics" className="text-gray-700 hover:text-brand-orange">
                  Statistics
                </Link>
              </>
            )}
            {user?.role === 'restaurant' && (
              <>
                <Link to="/restaurant" className="text-gray-700 hover:text-brand-orange">
                  Restaurant Dashboard
                </Link>
                <Link to="/restaurant/statistics" className="text-gray-700 hover:text-brand-orange">
                  Statistics
                </Link>
              </>
            )}
            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="outline">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>{user.name}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.role === 'customer' && (
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="w-full">My Orders</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/statistics" className="w-full">
                        <BarChart className="mr-2 h-4 w-4" />
                        <span>Statistics</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'restaurant' && (
                    <DropdownMenuItem asChild>
                      <Link to="/restaurant/statistics" className="w-full">
                        <BarChart className="mr-2 h-4 w-4" />
                        <span>Statistics</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-gray-700">
                <ShoppingCart />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-orange text-white rounded-full text-xs px-2 py-1">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-brand-orange" onClick={toggleMenu}>
                Home
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className="text-gray-700 hover:text-brand-orange" onClick={toggleMenu}>
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/statistics" className="text-gray-700 hover:text-brand-orange" onClick={toggleMenu}>
                    Statistics
                  </Link>
                </>
              )}
              {user?.role === 'restaurant' && (
                <>
                  <Link to="/restaurant" className="text-gray-700 hover:text-brand-orange" onClick={toggleMenu}>
                    Restaurant Dashboard
                  </Link>
                  <Link to="/restaurant/statistics" className="text-gray-700 hover:text-brand-orange" onClick={toggleMenu}>
                    Statistics
                  </Link>
                </>
              )}
              {user?.role === 'customer' && (
                <Link to="/orders" className="text-gray-700 hover:text-brand-orange" onClick={toggleMenu}>
                  My Orders
                </Link>
              )}
              <Link to="/cart" className="text-gray-700 hover:text-brand-orange" onClick={toggleMenu}>
                Cart {totalItems > 0 && `(${totalItems})`}
              </Link>
              {!user ? (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" onClick={toggleMenu}>
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/register" onClick={toggleMenu}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              ) : (
                <Button onClick={logout} variant="outline" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
