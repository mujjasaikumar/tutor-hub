import React, { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, Edit, Trash2 } from 'lucide-react';

export default function AdminBatches() {
  const [batches, setBatches] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    tutor_id: '',
    timing: '',
    duration_months: 3,
    start_date: '',
    days_per_week: 3,
    class_time: '10:00 AM',
  });

  useEffect(() => {
    fetchBatches();
    fetchTutors();
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

  const fetchTutors = async () => {
    try {
      // This would need a tutors endpoint, for now we'll handle it simply
      // In production, add GET /users?role=tutor endpoint
      setTutors([]);
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/batches', {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        duration_months: parseInt(formData.duration_months),
      });
      
      toast.success('Batch created successfully!');
      setDialogOpen(false);
      fetchBatches();
      setFormData({
        name: '',
        subject: '',
        tutor_id: '',
        timing: '',
        duration_months: 3,
        start_date: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create batch');
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-6" data-testid="admin-batches-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Batches
            </h1>
            <p className="text-gray-600 mt-1">Manage all batches</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="create-batch-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" data-testid="create-batch-dialog">
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Batch Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Mathematics Grade 10"
                    required
                    data-testid="batch-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Mathematics"
                    required
                    data-testid="batch-subject-input"
                  />
                </div>
                <div>
                  <Label htmlFor="tutor_id">Tutor ID</Label>
                  <Input
                    id="tutor_id"
                    value={formData.tutor_id}
                    onChange={(e) => setFormData({ ...formData, tutor_id: e.target.value })}
                    placeholder="Enter tutor ID"
                    required
                    data-testid="batch-tutor-input"
                  />
                </div>
                <div>
                  <Label htmlFor="timing">Timing</Label>
                  <Input
                    id="timing"
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                    placeholder="Mon-Wed-Fri 4PM-5PM"
                    required
                    data-testid="batch-timing-input"
                  />
                </div>
                <div>
                  <Label htmlFor="duration_months">Duration (Months)</Label>
                  <Input
                    id="duration_months"
                    type="number"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                    min="1"
                    required
                    data-testid="batch-duration-input"
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    data-testid="batch-startdate-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-batch-button">
                  Create Batch
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : batches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No batches yet. Create your first batch!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <Card key={batch.id} className="hover:shadow-lg transition-shadow" data-testid={`batch-card-${batch.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{batch.name}</CardTitle>
                  <p className="text-sm text-gray-600">{batch.subject}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Tutor:</span> {batch.tutor_name || 'N/A'}
                  </div>
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
