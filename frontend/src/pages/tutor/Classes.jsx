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
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Calendar as CalendarIcon, X } from 'lucide-react';

export default function TutorClasses() {
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    batch_id: '',
    class_date: '',
    class_time: '',
    topic: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchBatches();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches');
      setBatches(response.data);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/classes', {
        ...formData,
        class_date: new Date(formData.class_date).toISOString(),
      });
      
      toast.success('Class scheduled successfully!');
      setDialogOpen(false);
      fetchClasses();
      setFormData({
        batch_id: '',
        class_date: '',
        class_time: '',
        topic: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to schedule class');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout role="tutor">
      <div className="space-y-6" data-testid="tutor-classes-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Classes
            </h1>
            <p className="text-gray-600 mt-1">Manage your class schedule</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="schedule-class-button">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" data-testid="schedule-class-dialog">
              <DialogHeader>
                <DialogTitle>Schedule New Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="batch_id">Batch</Label>
                  <Select value={formData.batch_id} onValueChange={(value) => setFormData({ ...formData, batch_id: value })}>
                    <SelectTrigger data-testid="class-batch-select">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="class_date">Date</Label>
                  <Input
                    id="class_date"
                    type="date"
                    value={formData.class_date}
                    onChange={(e) => setFormData({ ...formData, class_date: e.target.value })}
                    required
                    data-testid="class-date-input"
                  />
                </div>
                <div>
                  <Label htmlFor="class_time">Time</Label>
                  <Input
                    id="class_time"
                    type="time"
                    value={formData.class_time}
                    onChange={(e) => setFormData({ ...formData, class_time: e.target.value })}
                    required
                    data-testid="class-time-input"
                  />
                </div>
                <div>
                  <Label htmlFor="topic">Topic (Optional)</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="Introduction to Algebra"
                    data-testid="class-topic-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-class-button">
                  Schedule Class
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No classes scheduled yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow" data-testid={`class-card-${classItem.id}`}>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{classItem.batch_name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(classItem.status)}`}>
                      {classItem.status}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(classItem.class_date).toLocaleDateString()}
                    </div>
                    <div className="text-gray-600">Time: {classItem.class_time}</div>
                    {classItem.topic && (
                      <div className="text-gray-600">Topic: {classItem.topic}</div>
                    )}
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
