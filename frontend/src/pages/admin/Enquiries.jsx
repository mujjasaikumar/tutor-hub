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
import { Plus, UserPlus, Trash2 } from 'lucide-react';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    interested_subject: '',
    notes: '',
  });

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const response = await api.get('/enquiries');
      setEnquiries(response.data);
    } catch (error) {
      toast.error('Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/enquiries', formData);
      toast.success('Enquiry added successfully!');
      setDialogOpen(false);
      fetchEnquiries();
      setFormData({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        interested_subject: '',
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to add enquiry');
    }
  };

  const updateStatus = async (enquiryId, status) => {
    try {
      await api.patch(`/enquiries/${enquiryId}?status=${status}`);
      toast.success('Status updated!');
      fetchEnquiries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;

    try {
      await api.delete(`/enquiries/${enquiryId}`);
      toast.success('Enquiry deleted!');
      fetchEnquiries();
    } catch (error) {
      toast.error('Failed to delete enquiry');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'contacted': return 'bg-yellow-100 text-yellow-700';
      case 'enrolled': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-6" data-testid="admin-enquiries-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Enquiries / Leads
            </h1>
            <p className="text-gray-600 mt-1">Track potential students</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="add-enquiry-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Enquiry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" data-testid="add-enquiry-dialog">
              <DialogHeader>
                <DialogTitle>Add New Enquiry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="enquiry-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="enquiry-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    data-testid="enquiry-phone-input"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    data-testid="enquiry-whatsapp-input"
                  />
                </div>
                <div>
                  <Label htmlFor="interested_subject">Interested Subject</Label>
                  <Input
                    id="interested_subject"
                    value={formData.interested_subject}
                    onChange={(e) => setFormData({ ...formData, interested_subject: e.target.value })}
                    data-testid="enquiry-subject-input"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    data-testid="enquiry-notes-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-enquiry-button">
                  Add Enquiry
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : enquiries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No enquiries yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="enquiries-table">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enquiries.map((enquiry) => (
                      <tr key={enquiry.id} data-testid={`enquiry-row-${enquiry.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{enquiry.name}</div>
                          <div className="text-xs text-gray-500">{enquiry.notes}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{enquiry.email}</div>
                          <div className="text-xs text-gray-500">{enquiry.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{enquiry.interested_subject || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Select
                            value={enquiry.status}
                            onValueChange={(value) => updateStatus(enquiry.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(enquiry.status)}`}>
                                  {enquiry.status}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="enrolled">Enrolled</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(enquiry.id)}
                            data-testid={`delete-enquiry-${enquiry.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
