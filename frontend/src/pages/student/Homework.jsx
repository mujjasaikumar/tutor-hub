import React, { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Upload } from 'lucide-react';

export default function StudentHomework() {
  const [homework, setHomework] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submissionLink, setSubmissionLink] = useState('');

  useEffect(() => {
    fetchHomework();
  }, []);

  const fetchHomework = async () => {
    try {
      const response = await api.get('/homework');
      setHomework(response.data);
    } catch (error) {
      toast.error('Failed to fetch homework');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedHomework) return;

    try {
      await api.post('/homework/submit', {
        homework_id: selectedHomework.id,
        submission_link: submissionLink,
      });
      
      toast.success('Homework submitted successfully!');
      setDialogOpen(false);
      setSubmissionLink('');
      setSelectedHomework(null);
      fetchHomework();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit homework');
    }
  };

  const openSubmitDialog = (hw) => {
    setSelectedHomework(hw);
    setDialogOpen(true);
  };

  return (
    <Layout role="student">
      <div className="space-y-6" data-testid="student-homework-page">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Homework
          </h1>
          <p className="text-gray-600 mt-1">View and submit your homework</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : homework.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No homework assigned yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {homework.map((hw) => (
              <Card key={hw.id} className="hover:shadow-lg transition-shadow" data-testid={`homework-card-${hw.id}`}>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{hw.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{hw.description}</p>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="text-gray-600">Batch: {hw.batch_name}</div>
                    <div className="text-gray-600">
                      Due Date: {new Date(hw.due_date).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    onClick={() => openSubmitDialog(hw)}
                    className="w-full"
                    data-testid={`submit-homework-button-${hw.id}`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Homework
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md" data-testid="submit-homework-dialog">
            <DialogHeader>
              <DialogTitle>Submit Homework</DialogTitle>
            </DialogHeader>
            {selectedHomework && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Submitting for: <span className="font-semibold">{selectedHomework.title}</span>
                  </p>
                  <Label htmlFor="submission_link">Submission Link</Label>
                  <Input
                    id="submission_link"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    placeholder="Google Drive link or document URL"
                    required
                    data-testid="submission-link-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your work to Google Drive and paste the shareable link here
                  </p>
                </div>
                <Button type="submit" className="w-full" data-testid="submit-homework-confirm-button">
                  Submit
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
