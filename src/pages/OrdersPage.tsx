
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../types/models';
import { orderService } from '../services/apiService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'sonner';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await orderService.getOrdersByCustomer(user.id);
        // Sort orders by date, newest first
        const sortedOrders = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading order history...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
        <p className="text-gray-600 mb-8">
          You haven't placed any orders yet. Browse our restaurants and place your first order!
        </p>
        <Link to="/">
          <Button>Browse Restaurants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Order #{order.id.substring(0, 8)}...</CardTitle>
                  <CardDescription>
                    Placed on {formatDate(order.createdAt)}
                  </CardDescription>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Quantity</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Price</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.menuItemId}>
                          <td className="px-4 py-3 text-sm">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium" colSpan={3}>Total</td>
                        <td className="px-4 py-3 text-sm font-medium text-right">{formatCurrency(order.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Link to={`/restaurant/${order.restaurantId}`}>
                    <Button variant="outline">Order Again</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
