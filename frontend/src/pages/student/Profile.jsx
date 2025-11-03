import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/shared/Layout';
import { Card, CardHeader, CardBody } from '@/components/reusable/Card';
import { Button } from '@/components/reusable/Button';
import { FormInput } from '@/components/reusable/FormInput';
import { StatusBadge } from '@/components/reusable/StatusBadge';
import { useApi } from '@/hooks/useApi';
import { useForm } from '@/hooks/useForm';
import useAuthStore from '@/store/authStore';
import api from '@/api/axios';
import { 
  UserCircle, 
  Mail, 
  Phone, 
  BookOpen,
  Calendar,
  Save,
  CreditCard
} from 'lucide-react';

export default function StudentProfile() {
  const { user, setAuth } = useAuthStore();
  const { loading, execute } = useApi();
  const [editMode, setEditMode] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);

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
    fetchStudentInfo();
  }, [user, setValues]);

  const fetchStudentInfo = async () => {
    try {
      const response = await api.get(`/students/${user?.id}`);
      setStudentInfo(response.data);
    } catch (error) {
      console.error('Error fetching student info:', error);
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
        const response = await api.put(`/students/${user.id}`, values);
        return response.data;
      },
      {
        onSuccess: (data) => {
          const token = localStorage.getItem('token');
          setAuth({ ...user, ...values }, token);
          setEditMode(false);
          fetchStudentInfo();
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
    <Layout role="student">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="heading-lg">Profile Settings</h1>
          <p className="body-text-sm mt-1">Manage your account information</p>
        </div>

        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                  <Button onClick={() => setEditMode(true)} variant="secondary" size="sm">
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleUpdateProfile}>
                <div className="grid gap-4 sm:grid-cols-2">
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
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                      type="submit"
                      loading={loading}
                      icon={Save}
                      className="w-full sm:w-auto"
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
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardBody>
          </Card>

          {/* Academic Information */}
          {studentInfo && (
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="heading-md">Academic Info</h2>
                      <p className="caption-text">Your course details</p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div>
                      <p className="caption-text">Batch</p>
                      <p className="font-semibold text-gray-900">{studentInfo.batch_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="caption-text">Enrolled Since</p>
                      <p className="font-semibold text-gray-900">
                        {studentInfo.created_at ? formatDate(studentInfo.created_at) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="heading-md">Payment Info</h2>
                      <p className="caption-text">Fee status</p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="caption-text">Total Fees</p>
                        <p className="text-xl font-bold text-gray-900">₹{studentInfo.total_fees || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="caption-text">Paid Amount</p>
                        <p className="text-xl font-bold text-green-600">₹{studentInfo.paid_amount || 0}</p>
                      </div>
                      <StatusBadge status={studentInfo.payment_status} />
                    </div>
                    {studentInfo.total_fees - studentInfo.paid_amount > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="caption-text text-yellow-700">Pending</p>
                        <p className="text-xl font-bold text-yellow-700">
                          ₹{studentInfo.total_fees - studentInfo.paid_amount}
                        </p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
