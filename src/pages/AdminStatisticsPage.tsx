
import { useState } from 'react';
import { Users, DollarSign, FileText } from 'lucide-react';
import StatsCard from '@/components/stats/StatsCard';
import SalesChart from '@/components/stats/SalesChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminStatisticsPage = () => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');

  // Mock data - replace with real API calls
  const mockRestaurants = [
    { name: "Restaurant A", orders: 156, revenue: 12500, customers: 98 },
    { name: "Restaurant B", orders: 132, revenue: 10800, customers: 85 },
    { name: "Restaurant C", orders: 98, revenue: 8900, customers: 67 },
  ];

  const mockMonthlyData = [
    { date: 'Jan', amount: 25000 },
    { date: 'Feb', amount: 30000 },
    { date: 'Mar', amount: 35000 },
    { date: 'Apr', amount: 32000 },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Platform Statistics</h1>
      
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatsCard
          title="Total Restaurants"
          value="24"
          icon={Users}
          description="Active restaurants"
          trend={{ value: 4, isPositive: true }}
        />
        <StatsCard
          title="Total Orders"
          value="2,543"
          icon={FileText}
          description="Platform-wide orders"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Revenue"
          value="$45,678"
          icon={DollarSign}
          description="Platform-wide revenue"
          trend={{ value: 18, isPositive: true }}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Top Performing Restaurants</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurant</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Customers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRestaurants.map((restaurant) => (
              <TableRow key={restaurant.name}>
                <TableCell className="font-medium">{restaurant.name}</TableCell>
                <TableCell>{restaurant.orders}</TableCell>
                <TableCell>${restaurant.revenue}</TableCell>
                <TableCell>{restaurant.customers}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SalesChart data={mockMonthlyData} title="Platform-wide Monthly Revenue" />
    </div>
  );
};

export default AdminStatisticsPage;
