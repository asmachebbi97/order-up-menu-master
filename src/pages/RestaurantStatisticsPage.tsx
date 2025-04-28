
import { useState } from 'react';
import { Users, DollarSign, FileText } from 'lucide-react';
import StatsCard from '@/components/stats/StatsCard';
import SalesChart from '@/components/stats/SalesChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RestaurantStatisticsPage = () => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');

  // Mock data - replace with real API calls
  const mockMonthlyData = [
    { date: 'Jan', amount: 4000 },
    { date: 'Feb', amount: 3000 },
    { date: 'Mar', amount: 5000 },
    { date: 'Apr', amount: 4500 },
  ];

  const mockYearlyData = [
    { date: '2023', amount: 45000 },
    { date: '2024', amount: 52000 },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Restaurant Statistics</h1>
      
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatsCard
          title="Total Customers"
          value="1,234"
          icon={Users}
          description="Total unique customers"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Orders"
          value="856"
          icon={FileText}
          description="All-time orders"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Total Revenue"
          value="$12,345"
          icon={DollarSign}
          description="All-time revenue"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          <TabsTrigger value="yearly">Yearly View</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly">
          <SalesChart data={mockMonthlyData} title="Monthly Sales" />
        </TabsContent>
        <TabsContent value="yearly">
          <SalesChart data={mockYearlyData} title="Yearly Sales" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantStatisticsPage;
