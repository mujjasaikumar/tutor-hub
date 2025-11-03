import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/shared/Layout';
import useAuthStore from '@/store/authStore';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Calendar, FileText } from 'lucide-react';

export default function BatchDetails() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatchActivities();
  }, [batchId]);

  const fetchBatchActivities = async () => {
    try {
      const response = await api.get(`/batches/${batchId}/activities`);
      setData(response.data);
    } catch (error) {
      toast.error('Failed to fetch batch details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout role={user?.role}>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout role={user?.role}>
        <div className="text-center py-12">Batch not found</div>
      </Layout>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout role={user?.role}>
      <div className="space-y-6" data-testid="batch-details-page">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {data.batch.name}
            </h1>
            <p className="text-gray-600 mt-1">{data.batch.subject}</p>
          </div>
        </div>

        {/* Batch Info */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Tutor</span>
                <p className="font-semibold">{data.batch.tutor_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Timing</span>
                <p className="font-semibold">{data.batch.timing}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Duration</span>
                <p className="font-semibold">{data.batch.duration_months} months</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Start Date</span>
                <p className="font-semibold">{new Date(data.batch.start_date).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{data.students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold">{data.classes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Study Materials</p>
                  <p className="text-2xl font-bold">{data.materials.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Students ({data.students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {data.students.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No students enrolled yet</p>
            ) : (
              <div className="space-y-2">
                {data.students.map((student) => (
                  <div
                    key={student.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/student/${student.id}`)}
                    data-testid={`student-item-${student.id}`}
                  >
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      student.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                      student.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {student.payment_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classes List */}
        <Card>
          <CardHeader>
            <CardTitle>Classes ({data.classes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {data.classes.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No classes scheduled yet</p>
            ) : (
              <div className="space-y-2">
                {data.classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                    data-testid={`class-item-${classItem.id}`}
                  >
                    <div>
                      <p className="font-semibold">{classItem.topic || 'Class'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(classItem.class_date).toLocaleDateString()} at {classItem.class_time}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(classItem.status)}`}>
                      {classItem.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Materials List */}
        <Card>
          <CardHeader>
            <CardTitle>Study Materials ({data.materials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {data.materials.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No materials uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {data.materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                    data-testid={`material-item-${material.id}`}
                  >
                    <div>
                      <p className="font-semibold">{material.title}</p>
                      <p className="text-sm text-gray-600">{material.description}</p>
                    </div>
                    <a
                      href={material.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
