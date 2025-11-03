import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/shared/Layout';
import { Card, CardHeader, CardBody } from '@/components/reusable/Card';
import { Button } from '@/components/reusable/Button';
import { FormInput } from '@/components/reusable/FormInput';
import { useApi } from '@/hooks/useApi';
import { useForm } from '@/hooks/useForm';
import useAuthStore from '@/store/authStore';
import api from '@/api/axios';
import { 
  UserCircle, 
  Mail, 
  Phone, 
  Building2,
  Calendar,
  Save,
  BookOpen
} from 'lucide-react';

export default function TutorProfile() {
  const { user, setAuth } = useAuthStore();
  const { loading, execute } = useApi();
  const [editMode, setEditMode] = useState(false);
  const [tutorStats, setTutorStats] = useState({
    total_batches: 0,
    total_students: 0
  });

  const { values, errors, handleChange, validate, setValues } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || '',
  }, {
    name: { required: true, minLength: 2 },
    email: { 
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Please enter a valid email'
    },
    phone: { required: true, minLength: 10 }
  });

  useEffect(() => {
    if (user) {
      setValues({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
      });
    }
    fetchTutorStats();
  }, [user, setValues]);

  const fetchTutorStats = async () => {
    try {
      const batchesResponse = await api.get('/batches');
      const batches = batchesResponse.data.filter(b => b.tutor_id === user?.id);
      
      setTutorStats({
        total_batches: batches.length,
        total_students: batches.reduce((sum, batch) => sum + (batch.student_count || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching tutor stats:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    await execute(
      async () => {
        const response = await api.put(`/tutors/${user.id}`, values);
        return response.data;
      },
      {
        onSuccess: (data) => {
          const token = localStorage.getItem('token');
          setAuth({ ...user, ...values }, token);
          setEditMode(false);
          toast.success('Profile updated successfully');
        },
        showErrorToast: true
      }
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout role="tutor">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="heading-lg">Profile Settings</h1>
          <p className="body-text-sm mt-1">Manage your account information</p>
        </div>

        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <UserCircle className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="heading-md">Personal Information</h2>
                    <p className="caption-text">Update your personal details</p>
                  </div>
                </div>
                {!editMode && (
                  <Button onClick={() => setEditMode(true)} variant="secondary">
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleUpdateProfile}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    label="Full Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    error={errors.name}
                    icon={UserCircle}
                    disabled={!editMode}
                    required
                  />
                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    error={errors.email}
                    icon={Mail}
                    disabled={!editMode}
                    required
                  />
                  <FormInput
                    label="Phone"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    icon={Phone}
                    disabled={!editMode}
                    required
                  />
                  <FormInput
                    label="WhatsApp"
                    name="whatsapp"
                    value={values.whatsapp}
                    onChange={handleChange}
                    error={errors.whatsapp}
                    icon={Phone}
                    disabled={!editMode}
                  />
                </div>

                {editMode && (
                  <div className="flex gap-3 mt-6">
                    <Button
                      type="submit"
                      loading={loading}
                      icon={Save}
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditMode(false);
                        setValues({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          whatsapp: user?.whatsapp || '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardBody>
          </Card>

          {/* Teaching Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="heading-md">Teaching Stats</h2>
                    <p className="caption-text">Your teaching overview</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="caption-text text-blue-600">Total Batches</p>
                    <p className="text-3xl font-bold text-blue-700">{tutorStats.total_batches}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="caption-text text-green-600">Total Students</p>
                    <p className="text-3xl font-bold text-green-700">{tutorStats.total_students}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="heading-md">Institute Info</h2>
                    <p className="caption-text">Your institute details</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <p className="caption-text">Institute ID</p>
                    <p className="font-semibold text-gray-900">{user?.institute_id || 'default-institute'}</p>
                  </div>
                  <div>
                    <p className="caption-text">Role</p>
                    <p className="font-semibold text-gray-900 capitalize">{user?.role}</p>
                  </div>
                  <div>
                    <p className="caption-text">Member Since</p>
                    <p className="font-semibold text-gray-900">
                      {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
