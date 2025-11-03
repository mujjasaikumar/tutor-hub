import React, { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Download, Calendar as CalendarIcon, X } from 'lucide-react';

export default function AdminSchedule() {
  const [batches, setBatches] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [recurringData, setRecurringData] = useState({
    batch_id: '',
    start_date: '',
    end_date: '',
    days_of_week: [],
    class_time: '10:00 AM',
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches');
      setBatches(response.data);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  const downloadSampleCSV = async () => {
    try {
      const response = await api.get('/schedule/sample-csv', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'class_schedule_sample.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Sample CSV downloaded!');
    } catch (error) {
      toast.error('Failed to download sample CSV');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedBatch) {
      toast.error('Please select a batch first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/schedule/upload-csv?batch_id=${selectedBatch}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Class schedule uploaded successfully!');
      setUploadDialogOpen(false);
      setSelectedBatch('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload schedule');
    }
  };

  const handleRecurringSubmit = async (e) => {
    e.preventDefault();

    if (recurringData.days_of_week.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    try {
      await api.post('/schedule/generate-recurring', {
        batch_id: recurringData.batch_id,
        start_date: recurringData.start_date,
        end_date: recurringData.end_date,
        days_of_week: recurringData.days_of_week,
        class_time: recurringData.class_time,
      });
      
      toast.success('Recurring schedule generated successfully!');
      setRecurringDialogOpen(false);
      setRecurringData({
        batch_id: '',
        start_date: '',
        end_date: '',
        days_of_week: [],
        class_time: '10:00 AM',
      });
    } catch (error) {
      toast.error('Failed to generate schedule');
    }
  };

  const toggleDay = (day) => {
    setRecurringData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const daysOfWeek = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' },
  ];

  return (
    <Layout role="admin">
      <div className="space-y-6" data-testid="admin-schedule-page">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Class Schedule
          </h1>
          <p className="text-gray-600 mt-1">Upload or generate class schedules</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload CSV Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Upload className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Upload CSV Schedule</h3>
                  <p className="text-sm text-gray-600">Bulk upload class schedule from CSV</p>
                </div>
              </div>

              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" data-testid="open-upload-dialog">
                    Upload Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="upload-schedule-dialog">
                  <DialogHeader>
                    <DialogTitle>Upload Class Schedule CSV</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Batch</Label>
                      <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                        <SelectTrigger data-testid="batch-select-upload">
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
                      <Label>Upload CSV File</Label>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        data-testid="file-upload-input"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Required columns: date (YYYY-MM-DD), time, topic (optional)
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={downloadSampleCSV}
                      className="w-full"
                      data-testid="download-sample-csv"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Sample CSV
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Generate Recurring Schedule Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Generate Recurring Schedule</h3>
                  <p className="text-sm text-gray-600">Auto-generate recurring classes</p>
                </div>
              </div>

              <Dialog open={recurringDialogOpen} onOpenChange={setRecurringDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="open-recurring-dialog">
                    Generate Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" data-testid="recurring-schedule-dialog">
                  <DialogHeader>
                    <DialogTitle>Generate Recurring Schedule</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRecurringSubmit} className="space-y-4">
                    <div>
                      <Label>Batch</Label>
                      <Select
                        value={recurringData.batch_id}
                        onValueChange={(value) => setRecurringData({ ...recurringData, batch_id: value })}
                      >
                        <SelectTrigger data-testid="recurring-batch-select">
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={recurringData.start_date}
                          onChange={(e) => setRecurringData({ ...recurringData, start_date: e.target.value })}
                          required
                          data-testid="start-date-input"
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={recurringData.end_date}
                          onChange={(e) => setRecurringData({ ...recurringData, end_date: e.target.value })}
                          required
                          data-testid="end-date-input"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Class Time</Label>
                      <Input
                        type="time"
                        value={recurringData.class_time}
                        onChange={(e) => setRecurringData({ ...recurringData, class_time: e.target.value })}
                        required
                        data-testid="class-time-input"
                      />
                    </div>

                    <div>
                      <Label>Days of Week</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {daysOfWeek.map((day) => (
                          <div key={day.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${day.value}`}
                              checked={recurringData.days_of_week.includes(day.value)}
                              onCheckedChange={() => toggleDay(day.value)}
                              data-testid={`day-checkbox-${day.value}`}
                            />
                            <label
                              htmlFor={`day-${day.value}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {day.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" className="w-full" data-testid="submit-recurring-schedule">
                      Generate Schedule
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Instructions Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3">Instructions</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-indigo-600">CSV Upload:</span>
                <span>Upload a CSV file with columns: date (YYYY-MM-DD), time, and topic (optional). Download the sample CSV template for reference.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-green-600">Recurring Schedule:</span>
                <span>Select batch, date range, days of week, and class time to automatically generate recurring classes for the entire duration.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-orange-600">Note:</span>
                <span>Tutors can mark themselves absent and reschedule classes from the Classes page.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
