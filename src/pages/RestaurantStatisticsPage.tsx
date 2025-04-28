
import { useState, useEffect } from 'react';
import { statisticsService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import RestaurantStatsCards from '@/components/stats/RestaurantStatsCards';
import SalesChart from '@/components/stats/SalesChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

const RestaurantStatisticsPage = () => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // For a restaurant owner, we'd get stats for their first restaurant
        // In a real app, you might have a restaurant selector
        const restaurantId = user.id; // Assuming user.id is the restaurant ID for simplicity
        const statsData = await statisticsService.getRestaurantStats(restaurantId);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
        setError('Failed to load statistics data');
        toast.error('Failed to load statistics data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Restaurant Statistics</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error || 'Failed to load statistics data'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Restaurant Statistics</h1>
      
      <RestaurantStatsCards 
        totalCustomers={stats.totalCustomers}
        totalOrders={stats.totalOrders}
        totalRevenue={stats.totalRevenue}
        trends={stats.trends}
      />

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger 
            value="monthly" 
            onClick={() => setTimeframe('monthly')}
          >
            Monthly View
          </TabsTrigger>
          <TabsTrigger 
            value="yearly" 
            onClick={() => setTimeframe('yearly')}
          >
            Yearly View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="monthly">
          <SalesChart data={stats.monthlySales} title="Monthly Sales" />
        </TabsContent>
        <TabsContent value="yearly">
          <SalesChart data={stats.yearlySales} title="Yearly Sales" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantStatisticsPage;
