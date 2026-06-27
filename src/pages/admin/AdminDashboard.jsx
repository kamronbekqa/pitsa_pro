import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Zap, Users } from 'lucide-react';
import { apiUrl } from '../../api';
import StatCard from '../../components/admin/StatCard';
import RecentOrders from '../../components/admin/RecentOrders';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(apiUrl('/api/admin/stats/'), {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Welcome back! Here's what's happening with your business.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Orders"
          value={stats?.total_orders || 0}
          icon={ShoppingBag}
          color="orange"
          trend={stats?.pending_orders}
          trendLabel="pending orders"
        />
        <StatCard
          title="Revenue"
          value={`$${(stats?.revenue || 0).toFixed(2)}`}
          icon={TrendingUp}
          color="blue"
          trend={stats?.total_orders}
          trendLabel="from all orders"
        />
        <StatCard
          title="Active Promo Codes"
          value={stats?.active_promos || 0}
          icon={Zap}
          color="purple"
        />
        <StatCard
          title="Registered Users"
          value={stats?.total_users || 0}
          icon={Users}
          color="green"
        />
      </div>

      <div className="dashboard-content">
        <RecentOrders orders={stats?.recent_orders || []} />
      </div>
    </div>
  );
};

export default AdminDashboard;
