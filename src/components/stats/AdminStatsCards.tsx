
import React from 'react';
import { Users, DollarSign, FileText } from 'lucide-react';
import StatsCard from '@/components/stats/StatsCard';

interface AdminStatsCardsProps {
  totalRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
  trends: {
    restaurants: { value: number; isPositive: boolean };
    orders: { value: number; isPositive: boolean };
    revenue: { value: number; isPositive: boolean };
  };
}

const AdminStatsCards = ({ 
  totalRestaurants, 
  totalOrders, 
  totalRevenue, 
  trends 
}: AdminStatsCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <StatsCard
        title="Total Restaurants"
        value={totalRestaurants}
        icon={Users}
        description="Active restaurants"
        trend={trends.restaurants}
      />
      <StatsCard
        title="Total Orders"
        value={totalOrders.toLocaleString()}
        icon={FileText}
        description="Platform-wide orders"
        trend={trends.orders}
      />
      <StatsCard
        title="Total Revenue"
        value={`$${totalRevenue.toLocaleString()}`}
        icon={DollarSign}
        description="Platform-wide revenue"
        trend={trends.revenue}
      />
    </div>
  );
};

export default AdminStatsCards;
