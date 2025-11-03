import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/shared/Layout';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Calendar } from 'lucide-react';

export default function TutorDashboard() {
  const navigate = useNavigate();
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
      title: "Today's Classes",
      value: stats?.today_classes || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      testId: 'today-classes'
    },
  ];

  return (
    <Layout role="tutor">
      <div className="space-y-6" data-testid="tutor-dashboard">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="hover:shadow-lg transition-shadow" data-testid={stat.testId}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/tutor/classes"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="quick-action-classes"
              >
                <Calendar className="w-6 h-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold">Manage Classes</h3>
                <p className="text-sm text-gray-600 mt-1">Schedule and track classes</p>
              </a>
              <a
                href="/tutor/materials"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="quick-action-materials"
              >
                <BookOpen className="w-6 h-6 text-indigo-600 mb-2" />
                <h3 className="font-semibold">Upload Materials</h3>
                <p className="text-sm text-gray-600 mt-1">Share study materials</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
