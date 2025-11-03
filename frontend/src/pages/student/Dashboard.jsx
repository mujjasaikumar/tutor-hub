import React, { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, FileText, IndianRupee } from 'lucide-react';

export default function StudentDashboard() {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'partial': return 'bg-yellow-100 text-yellow-700';
      case 'unpaid': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout role="student">
      <div className="space-y-6" data-testid="student-dashboard">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow" data-testid="batch-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    My Batch
                  </CardTitle>
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-gray-900">{stats?.batch_name || 'N/A'}</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow" data-testid="classes-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Today's Classes
                  </CardTitle>
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats?.today_classes || 0}</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow" data-testid="homework-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pending Homework
                  </CardTitle>
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats?.pending_homework || 0}</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow" data-testid="payment-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Payment Status
                  </CardTitle>
                  <div className="bg-green-500 p-2 rounded-lg">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(stats?.payment_status)}`}>
                    {stats?.payment_status || 'N/A'}
                  </span>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Fees:</span>
                    <span className="font-semibold">₹{stats?.total_fees || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid Amount:</span>
                    <span className="font-semibold text-green-600">₹{stats?.paid_amount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Amount:</span>
                    <span className="font-semibold text-red-600">₹{stats?.pending_amount || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <a
                      href="/student/classes"
                      className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      data-testid="quick-link-classes"
                    >
                      <h3 className="font-semibold text-sm">View Classes</h3>
                    </a>
                    <a
                      href="/student/materials"
                      className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      data-testid="quick-link-materials"
                    >
                      <h3 className="font-semibold text-sm">Study Materials</h3>
                    </a>
                    <a
                      href="/student/homework"
                      className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      data-testid="quick-link-homework"
                    >
                      <h3 className="font-semibold text-sm">Submit Homework</h3>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
