import React, { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

export default function AdminTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'tutor',
  });

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await api.get('/tutors');
      setTutors(response.data);
    } catch (error) {
      toast.error('Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await api.put(`/tutors/${selectedTutor.id}`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
        toast.success('Tutor updated successfully!');
      } else {
        await api.post('/tutors', formData);
        toast.success('Tutor added successfully!');
      }
      
      setDialogOpen(false);
      fetchTutors();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || `Failed to ${editMode ? 'update' : 'add'} tutor`);
    }
  };

  const handleEdit = (tutor) => {
    setSelectedTutor(tutor);
    setFormData({
      name: tutor.name,
      email: tutor.email,
      phone: tutor.phone || '',
      password: '',
      role: 'tutor',
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (tutorId) => {
    if (!window.confirm('Are you sure you want to delete this tutor?')) return;

    try {
      await api.delete(`/tutors/${tutorId}`);
      toast.success('Tutor deleted successfully!');
      fetchTutors();
    } catch (error) {
      toast.error('Failed to delete tutor');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'tutor',
    });
    setEditMode(false);
    setSelectedTutor(null);
  };

  return (
    <Layout role="admin">
      <div className="space-y-6" data-testid="admin-tutors-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Tutors
            </h1>
            <p className="text-gray-600 mt-1">Manage all tutors</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="add-tutor-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Tutor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" data-testid="add-tutor-dialog">
              <DialogHeader>
                <DialogTitle>{editMode ? 'Edit Tutor' : 'Add New Tutor'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="tutor-name-input"
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
                    disabled={editMode}
                    data-testid="tutor-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="tutor-phone-input"
                  />
                </div>
                {!editMode && (
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      data-testid="tutor-password-input"
                    />
                  </div>
                )}
                <Button type="submit" className="w-full" data-testid="submit-tutor-button">
                  {editMode ? 'Update Tutor' : 'Add Tutor'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : tutors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tutors yet. Add your first tutor!</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="tutors-table">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tutors.map((tutor) => (
                      <tr key={tutor.id} data-testid={`tutor-row-${tutor.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tutor.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{tutor.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{tutor.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(tutor)}
                              data-testid={`edit-tutor-${tutor.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(tutor.id)}
                              data-testid={`delete-tutor-${tutor.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
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
