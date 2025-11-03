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
  Building2,
  Key,
  Calendar,
  Shield,
  Save
} from 'lucide-react';

export default function AdminProfile() {
  const { user, setAuth } = useAuthStore();
  const { loading, execute } = useApi();
  const [editMode, setEditMode] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState({
    license_type: 'Professional',
    expiry_date: '2025-12-31',
    status: 'active'
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
  }, [user, setValues]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    await execute(
      async () => {
        const response = await api.put('/users/profile', values);
        return response.data;
      },
      {
        onSuccess: (data) => {
          // Update auth store with new user data
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

  const daysUntilExpiry = () => {
    const expiry = new Date(subscriptionInfo.expiry_date);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = () => {
    const days = daysUntilExpiry();
    if (days < 0) return 'error';
    if (days < 30) return 'warning';
    return 'success';
  };

  return (
    <Layout role="admin">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="heading-lg">Profile Settings</h1>
          <p className="body-text-sm mt-1">Manage your account information and subscription</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <div className="md:col-span-2">
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
          </div>

          {/* Subscription Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="heading-md">Subscription</h2>
                  <p className="caption-text">Your license details</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="caption-text">License Type</p>
                      <p className="font-semibold text-gray-900">{subscriptionInfo.license_type}</p>
                    </div>
                  </div>
                  <StatusBadge status={subscriptionInfo.status} />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="caption-text">Expiry Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(subscriptionInfo.expiry_date)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge 
                    status={getExpiryStatus()} 
                    label={`${daysUntilExpiry()} days left`}
                  />
                </div>
              </div>

              <Button className="w-full mt-4" variant="secondary">
                Upgrade Plan
              </Button>
            </CardBody>
          </Card>

          {/* Institute Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="heading-md">Institute</h2>
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
    </Layout>
  );
}
