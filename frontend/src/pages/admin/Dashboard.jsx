import React, { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, CreditCard, TrendingUp, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Batches',
      value: stats?.total_batches || 0,
      icon: BookOpen,
      color: 'bg-blue-500',
      testId: 'total-batches'
    },
    {
      title: 'Total Students',
      value: stats?.total_students || 0,
      icon: Users,
      color: 'bg-green-500',
      testId: 'total-students'
    },
    {
      title: 'Total Tutors',
      value: stats?.total_tutors || 0,
      icon: Users,
      color: 'bg-purple-500',
      testId: 'total-tutors'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats?.total_revenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      testId: 'total-revenue'
    },
    {
      title: 'Pending Fees',
      value: `₹${stats?.pending_fees?.toLocaleString() || 0}`,
      icon: IndianRupee,
      color: 'bg-orange-500',
      testId: 'pending-fees'
    },
  ];

  return (
    <Layout role="admin">
      <div className="space-y-6" data-testid="admin-dashboard">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your institute.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.title}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    if (stat.title === 'Total Batches') navigate('/admin/batches');
                    else if (stat.title === 'Total Students') navigate('/admin/students');
                    else if (stat.title === 'Total Tutors') navigate('/admin/tutors');
                    else if (stat.title === 'Total Revenue' || stat.title === 'Pending Fees') navigate('/admin/payments');
                  }}
                  data-testid={stat.testId}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.color} p-2 rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/batches"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="quick-action-batches"
              >
                <BookOpen className="w-6 h-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold">Manage Batches</h3>
                <p className="text-sm text-gray-600 mt-1">Create and manage batches</p>
              </a>
              <a
                href="/admin/students"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="quick-action-students"
              >
                <Users className="w-6 h-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold">Add Students</h3>
                <p className="text-sm text-gray-600 mt-1">Add or import students</p>
              </a>
              <a
                href="/admin/payments"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="quick-action-payments"
              >
                <CreditCard className="w-6 h-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold">Track Payments</h3>
                <p className="text-sm text-gray-600 mt-1">Record and monitor fees</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
