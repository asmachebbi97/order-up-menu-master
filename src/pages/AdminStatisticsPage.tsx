
import { useState, useEffect } from 'react';
import { statisticsService } from '../services/apiService';
import AdminStatsCards from '@/components/stats/AdminStatsCards';
import RestaurantsTable from '@/components/stats/RestaurantsTable';
import SalesChart from '@/components/stats/SalesChart';
import { toast } from 'sonner';

const AdminStatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsData = await statisticsService.getAdminStats();
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
  }, []);

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
        <h1 className="text-3xl font-bold mb-8">Platform Statistics</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error || 'Failed to load statistics data'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Platform Statistics</h1>
      
      <AdminStatsCards 
        totalRestaurants={stats.totalRestaurants}
        totalOrders={stats.totalOrders}
        totalRevenue={stats.totalRevenue}
        trends={stats.trends}
      />

      <RestaurantsTable 
        restaurants={stats.topRestaurants}
        title="Top Performing Restaurants"
      />

      <SalesChart data={stats.monthlySales} title="Platform-wide Monthly Revenue" />
    </div>
  );
};

export default AdminStatisticsPage;
