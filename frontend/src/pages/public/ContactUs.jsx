import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/reusable/Card';
import { Button } from '@/components/reusable/Button';
import { FormInput, FormTextarea } from '@/components/reusable/FormInput';
import { useForm } from '@/hooks/useForm';
import { useApi } from '@/hooks/useApi';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/api/axios';
import Footer from '@/components/shared/Footer';

export default function ContactUs() {
  const { loading, execute } = useApi();
  const { values, errors, handleChange, validate, reset } = useForm(
    {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    },
    {
      name: { required: true, minLength: 2 },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: 'Please enter a valid email'
      },
      phone: { required: true, minLength: 10 },
      subject: { required: true, minLength: 5 },
      message: { required: true, minLength: 10 }
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    await execute(
      async () => {
        const response = await api.post('/contact', values);
        return response.data;
      },
      {
        onSuccess: () => {
          reset();
          toast.success('Message sent successfully! We\'ll get back to you soon.');
        },
        showErrorToast: true
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-indigo-100">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <Mail className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-sm text-gray-600">support@tutorhub.com</p>
                      <p className="text-sm text-gray-600">sales@tutorhub.com</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <p className="text-sm text-gray-600">+91 123 456 7890</p>
                      <p className="text-sm text-gray-600">Mon-Fri: 9AM - 6PM IST</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Office</h3>
                      <p className="text-sm text-gray-600">
                        123 Education Street<br />
                        Tech Park, Bangalore<br />
                        Karnataka 560001, India
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="heading-md">Send us a Message</h2>
                  <p className="caption-text mt-1">Fill out the form below and we'll get back to you within 24 hours</p>
                </CardHeader>
                <CardBody>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Full Name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        error={errors.name}
                        required
                        placeholder="John Doe"
                      />
                      <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Phone"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        required
                        placeholder="+91 98765 43210"
                      />
                      <FormInput
                        label="Subject"
                        name="subject"
                        value={values.subject}
                        onChange={handleChange}
                        error={errors.subject}
                        required
                        placeholder="How can we help?"
                      />
                    </div>

                    <FormTextarea
                      label="Message"
                      name="message"
                      value={values.message}
                      onChange={handleChange}
                      error={errors.message}
                      required
                      rows={6}
                      placeholder="Tell us more about your inquiry..."
                    />

                    <Button
                      type="submit"
                      loading={loading}
                      icon={Send}
                      className="w-full sm:w-auto"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
