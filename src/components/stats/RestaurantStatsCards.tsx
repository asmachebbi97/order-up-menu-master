
import React from 'react';
import { Users, DollarSign, FileText } from 'lucide-react';
import StatsCard from '@/components/stats/StatsCard';

interface RestaurantStatsCardsProps {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  trends: {
    customers: { value: number; isPositive: boolean };
    orders: { value: number; isPositive: boolean };
    revenue: { value: number; isPositive: boolean };
  };
}

const RestaurantStatsCards = ({ 
  totalCustomers, 
  totalOrders, 
  totalRevenue, 
  trends 
}: RestaurantStatsCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <StatsCard
        title="Total Customers"
        value={totalCustomers.toLocaleString()}
        icon={Users}
        description="Total unique customers"
        trend={trends.customers}
      />
      <StatsCard
        title="Total Orders"
        value={totalOrders.toLocaleString()}
        icon={FileText}
        description="All-time orders"
        trend={trends.orders}
      />
      <StatsCard
        title="Total Revenue"
        value={`$${totalRevenue.toLocaleString()}`}
        icon={DollarSign}
        description="All-time revenue"
        trend={trends.revenue}
      />
    </div>
  );
};

export default RestaurantStatsCards;
