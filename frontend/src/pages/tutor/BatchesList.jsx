import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/shared/Layout';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function TutorBatchesList() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches');
      setBatches(response.data);
    } catch (error) {
      toast.error('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="tutor">
      <div className="space-y-6" data-testid="tutor-batches-list">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            My Batches
          </h1>
          <p className="text-gray-600 mt-1">View all batches you're teaching</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : batches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No batches assigned yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <Card
                key={batch.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/batch/${batch.id}`)}
                data-testid={`batch-card-${batch.id}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{batch.name}</CardTitle>
                  <p className="text-sm text-gray-600">{batch.subject}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Timing:</span> {batch.timing}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Duration:</span> {batch.duration_months} months
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Start Date:</span>{' '}
                    {new Date(batch.start_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
