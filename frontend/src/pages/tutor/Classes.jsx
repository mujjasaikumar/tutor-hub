import React, { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getClassStatus, canJoinClass } from '@/utils/classHelpers';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Calendar as CalendarIcon, X, Video, Edit } from 'lucide-react';

export default function TutorClasses() {
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [absentDialogOpen, setAbsentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
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

  const handleMarkAbsent = async () => {
    try {
      const params = rescheduleDate ? `?reschedule_date=${rescheduleDate}` : '';
      await api.patch(`/classes/${selectedClass.id}/mark-absent${params}`);
      
      toast.success(rescheduleDate ? 'Class marked absent and rescheduled!' : 'Class marked as absent');
      setAbsentDialogOpen(false);
      setSelectedClass(null);
      setRescheduleDate('');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to mark absent');
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    
    try {
      await api.patch(`/classes/${selectedClass.id}`, {
        class_date: formData.class_date ? new Date(formData.class_date).toISOString() : undefined,
        class_time: formData.class_time,
        topic: formData.topic,
      });
      
      toast.success('Class updated successfully!');
      setEditDialogOpen(false);
      setSelectedClass(null);
      fetchClasses();
    } catch (error) {
      toast.error('Failed to update class');
    }
  };

  const openAbsentDialog = (classItem) => {
    setSelectedClass(classItem);
    setAbsentDialogOpen(true);
  };

  const openEditDialog = (classItem) => {
    setSelectedClass(classItem);
    setFormData({
      batch_id: classItem.batch_id,
      class_date: new Date(classItem.class_date).toISOString().split('T')[0],
      class_time: classItem.class_time,
      topic: classItem.topic || '',
    });
    setEditDialogOpen(true);
  };

  const handleJoinClass = (classItem) => {
    // In production, this would redirect to actual meeting link
    toast.info('Joining class... (Meeting link would open here)');
  };

  const handleWatchRecording = (classItem) => {
    // In production, this would redirect to recording link
    toast.info('Opening recording... (Recording link would open here)');
  };

  return (
    <Layout role=\"tutor\">
      <div className=\"space-y-6\" data-testid=\"tutor-classes-page\">
        <div className=\"flex justify-between items-center\">
          <div>
            <h1 className=\"text-3xl font-bold text-gray-900\" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Classes
            </h1>
            <p className=\"text-gray-600 mt-1\">Manage your class schedule</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className=\"bg-indigo-600 hover:bg-indigo-700\" data-testid=\"schedule-class-button\">
                <Plus className=\"w-4 h-4 mr-2\" />
                Schedule Class
              </Button>
            </DialogTrigger>
            <DialogContent className=\"max-w-md\" data-testid=\"schedule-class-dialog\">
              <DialogHeader>
                <DialogTitle>Schedule New Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className=\"space-y-4\">
                <div>
                  <Label htmlFor=\"batch_id\">Batch</Label>
                  <Select value={formData.batch_id} onValueChange={(value) => setFormData({ ...formData, batch_id: value })}>
                    <SelectTrigger data-testid=\"class-batch-select\">
                      <SelectValue placeholder=\"Select batch\" />
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
                  <Label htmlFor=\"class_date\">Date</Label>
                  <Input
                    id=\"class_date\"
                    type=\"date\"
                    value={formData.class_date}
                    onChange={(e) => setFormData({ ...formData, class_date: e.target.value })}
                    required
                    data-testid=\"class-date-input\"
                  />
                </div>
                <div>
                  <Label htmlFor=\"class_time\">Time</Label>
                  <Input
                    id=\"class_time\"
                    type=\"time\"
                    value={formData.class_time}
                    onChange={(e) => setFormData({ ...formData, class_time: e.target.value })}
                    required
                    data-testid=\"class-time-input\"
                  />
                </div>
                <div>
                  <Label htmlFor=\"topic\">Topic (Optional)</Label>
                  <Input
                    id=\"topic\"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder=\"Introduction to Algebra\"
                    data-testid=\"class-topic-input\"
                  />
                </div>
                <Button type=\"submit\" className=\"w-full\" data-testid=\"submit-class-button\">
                  Schedule Class
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className=\"text-center py-12\">Loading...</div>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className=\"py-12 text-center\">
              <CalendarIcon className=\"w-12 h-12 text-gray-400 mx-auto mb-4\" />
              <p className=\"text-gray-600\">No classes scheduled yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className=\"p-0\">
              <div className=\"overflow-x-auto\">
                <table className=\"w-full\" data-testid=\"classes-table\">
                  <thead className=\"bg-gray-50 border-b\">
                    <tr>
                      <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                        Date & Time
                      </th>
                      <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                        Topic
                      </th>
                      <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                        Batch
                      </th>
                      <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                        Status
                      </th>
                      <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className=\"bg-white divide-y divide-gray-200\">
                    {classes.map((classItem) => {
                      const status = getClassStatus(classItem.class_date, classItem.class_time);
                      const canJoin = canJoinClass(classItem.class_date, classItem.class_time);
                      
                      return (
                        <tr key={classItem.id} data-testid={`class-row-${classItem.id}`}>
                          <td className=\"px-6 py-4 whitespace-nowrap\">
                            <div className=\"text-sm font-medium text-gray-900\">
                              {new Date(classItem.class_date).toLocaleDateString()}
                            </div>
                            <div className=\"text-sm text-gray-600\">{classItem.class_time}</div>
                          </td>
                          <td className=\"px-6 py-4\">
                            <div className=\"text-sm text-gray-900\">{classItem.topic || 'Class'}</div>
                          </td>
                          <td className=\"px-6 py-4 whitespace-nowrap\">
                            <div className=\"text-sm text-gray-600\">{classItem.batch_name}</div>
                          </td>
                          <td className=\"px-6 py-4 whitespace-nowrap\">
                            <StatusBadge status={status} />
                          </td>
                          <td className=\"px-6 py-4 whitespace-nowrap\">
                            <div className=\"flex gap-2\">
                              {status === 'live' && (
                                <Button
                                  size=\"sm\"
                                  className=\"bg-green-600 hover:bg-green-700\"
                                  onClick={() => handleJoinClass(classItem)}
                                  data-testid={`join-class-${classItem.id}`}
                                >
                                  <Video className=\"w-4 h-4 mr-1\" />
                                  Join Now
                                </Button>
                              )}
                              {status === 'completed' && (
                                <Button
                                  size=\"sm\"
                                  variant=\"outline\"
                                  onClick={() => handleWatchRecording(classItem)}
                                  data-testid={`watch-recording-${classItem.id}`}
                                >
                                  <Video className=\"w-4 h-4 mr-1\" />
                                  Watch Recording
                                </Button>
                              )}
                              {status === 'upcoming' && (
                                <Button
                                  size=\"sm\"
                                  disabled
                                  variant=\"outline\"
                                  title=\"Class not started yet\"
                                  data-testid={`join-disabled-${classItem.id}`}
                                >
                                  Join Now
                                </Button>
                              )}
                              {status === 'upcoming' && (
                                <>
                                  <Button
                                    size=\"sm\"
                                    variant=\"outline\"
                                    onClick={() => openEditDialog(classItem)}
                                    data-testid={`edit-class-${classItem.id}`}
                                  >
                                    <Edit className=\"w-4 h-4\" />
                                  </Button>
                                  <Button
                                    size=\"sm\"
                                    variant=\"outline\"
                                    onClick={() => openAbsentDialog(classItem)}
                                    className=\"text-orange-600 hover:text-orange-700\"
                                    data-testid={`mark-absent-${classItem.id}`}
                                  >
                                    <X className=\"w-4 h-4\" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Class Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className=\"max-w-md\" data-testid=\"edit-class-dialog\">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditClass} className=\"space-y-4\">
            <div>
              <Label htmlFor=\"edit_class_date\">Date</Label>
              <Input
                id=\"edit_class_date\"
                type=\"date\"
                value={formData.class_date}
                onChange={(e) => setFormData({ ...formData, class_date: e.target.value })}
                data-testid=\"edit-date-input\"
              />
            </div>
            <div>
              <Label htmlFor=\"edit_class_time\">Time</Label>
              <Input
                id=\"edit_class_time\"
                type=\"time\"
                value={formData.class_time}
                onChange={(e) => setFormData({ ...formData, class_time: e.target.value })}
                data-testid=\"edit-time-input\"
              />
            </div>
            <div>
              <Label htmlFor=\"edit_topic\">Topic</Label>
              <Input
                id=\"edit_topic\"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                data-testid=\"edit-topic-input\"
              />
            </div>
            <Button type=\"submit\" className=\"w-full\" data-testid=\"submit-edit-class\">
              Update Class
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mark Absent Dialog */}
      <Dialog open={absentDialogOpen} onOpenChange={setAbsentDialogOpen}>
        <DialogContent className=\"max-w-md\" data-testid=\"absent-dialog\">
          <DialogHeader>
            <DialogTitle>Mark Class Absent</DialogTitle>
          </DialogHeader>
          <div className=\"space-y-4\">
            <p className=\"text-sm text-gray-600\">
              Marking this class as absent will notify students. You can optionally reschedule it.
            </p>
            <div>
              <Label htmlFor=\"reschedule_date\">Reschedule Date (Optional)</Label>
              <Input
                id=\"reschedule_date\"
                type=\"date\"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                data-testid=\"reschedule-date-input\"
              />
            </div>
            <div className=\"flex gap-2\">
              <Button
                variant=\"outline\"
                onClick={() => {
                  setAbsentDialogOpen(false);
                  setRescheduleDate('');
                }}
                className=\"flex-1\"
                data-testid=\"cancel-absent\"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkAbsent}
                className=\"flex-1 bg-orange-600 hover:bg-orange-700\"
                data-testid=\"confirm-absent\"
              >
                Mark Absent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

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

  const handleMarkAbsent = async () => {
    try {
      const params = rescheduleDate ? `?reschedule_date=${rescheduleDate}` : '';
      await api.patch(`/classes/${selectedClass.id}/mark-absent${params}`);
      
      toast.success(rescheduleDate ? 'Class marked absent and rescheduled!' : 'Class marked as absent');
      setAbsentDialogOpen(false);
      setSelectedClass(null);
      setRescheduleDate('');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to mark absent');
    }
  };

  const openAbsentDialog = (classItem) => {
    setSelectedClass(classItem);
    setAbsentDialogOpen(true);
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
                  {classItem.status === 'scheduled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-orange-600 hover:text-orange-700"
                      onClick={() => openAbsentDialog(classItem)}
                      data-testid={`mark-absent-${classItem.id}`}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Mark Absent
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={absentDialogOpen} onOpenChange={setAbsentDialogOpen}>
        <DialogContent className="max-w-md" data-testid="absent-dialog">
          <DialogHeader>
            <DialogTitle>Mark Class Absent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Marking this class as absent will notify students. You can optionally reschedule it.
            </p>
            <div>
              <Label htmlFor="reschedule_date">Reschedule Date (Optional)</Label>
              <Input
                id="reschedule_date"
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                data-testid="reschedule-date-input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAbsentDialogOpen(false);
                  setRescheduleDate('');
                }}
                className="flex-1"
                data-testid="cancel-absent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkAbsent}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                data-testid="confirm-absent"
              >
                Mark Absent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
