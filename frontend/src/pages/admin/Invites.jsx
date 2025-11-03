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
import { Plus, Mail, Copy, Check } from 'lucide-react';

export default function AdminInvites() {
  const [invites, setInvites] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedBatchForBulk, setSelectedBatchForBulk] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    role: 'student',
    batch_id: '',
  });

  useEffect(() => {
    fetchInvites();
    fetchBatches();
  }, []);

  const fetchInvites = async () => {
    try {
      const response = await api.get('/invites');
      setInvites(response.data);
    } catch (error) {
      toast.error('Failed to fetch invites');
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
      const payload = {
        ...formData,
        batch_id: formData.batch_id || null,
      };
      
      await api.post('/invites', payload);
      toast.success('Invite sent successfully!');
      setDialogOpen(false);
      fetchInvites();
      setFormData({
        email: '',
        role: 'student',
        batch_id: '',
      });
    } catch (error) {
      toast.error('Failed to send invite');
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedBatchForBulk) {
      toast.error('Please select a batch first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/invites/bulk?batch_id=${selectedBatchForBulk}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Bulk invites sent successfully!');
      setBulkDialogOpen(false);
      fetchInvites();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send bulk invites');
    }
  };

  const downloadSampleCSV = async () => {
    try {
      const response = await api.get('/invites/sample-csv', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bulk_invites_sample.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Sample CSV downloaded!');
    } catch (error) {
      toast.error('Failed to download sample CSV');
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Invite code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusColor = (status) => {
    return status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
  };

  return (
    <Layout role="admin">
      <div className="space-y-6" data-testid="admin-invites-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Invites
            </h1>
            <p className="text-gray-600 mt-1">Send invitations to tutors and students</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="bulk-invite-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Bulk Invite
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="bulk-invite-dialog">
                <DialogHeader>
                  <DialogTitle>Bulk Invite Students</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Batch</Label>
                    <Select value={selectedBatchForBulk} onValueChange={setSelectedBatchForBulk}>
                      <SelectTrigger data-testid="bulk-batch-select">
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
                      onChange={handleBulkUpload}
                      data-testid="bulk-file-upload"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Required column: email
                    </p>
                    <Button
                      variant="outline"
                      onClick={downloadSampleCSV}
                      className="w-full mt-2"
                      type="button"
                      data-testid="download-bulk-sample"
                    >
                      Download Sample CSV
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="send-invite-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Send Invite
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md" data-testid="send-invite-dialog">
              <DialogHeader>
                <DialogTitle>Send Invitation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="invite-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger data-testid="invite-role-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === 'student' && (
                  <div>
                    <Label htmlFor="batch_id">Batch (Optional)</Label>
                    <Select value={formData.batch_id} onValueChange={(value) => setFormData({ ...formData, batch_id: value })}>
                      <SelectTrigger data-testid="invite-batch-select">
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
                )}
                <Button type="submit" className="w-full" data-testid="submit-invite-button">
                  Send Invite
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : invites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No invites sent yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invites.map((invite) => (
              <Card key={invite.id} className="hover:shadow-lg transition-shadow" data-testid={`invite-card-${invite.id}`}>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{invite.email}</h3>
                      <p className="text-sm text-gray-600 capitalize">{invite.role}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invite.status)}`}>
                      {invite.status}
                    </span>
                  </div>
                  {invite.batch_name && (
                    <div className="text-sm text-gray-600">Batch: {invite.batch_name}</div>
                  )}
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <code className="text-xs flex-1 truncate">{invite.invite_code}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyInviteCode(invite.invite_code)}
                      data-testid={`copy-code-${invite.id}`}
                    >
                      {copiedCode === invite.invite_code ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Sent: {new Date(invite.created_at).toLocaleDateString()}
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
