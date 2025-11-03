import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/reusable/Card';
import Footer from '@/components/shared/Footer';
import { Shield, Lock, Eye, UserCheck, Database, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-indigo-100">
              Last updated: January 2024
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="mb-6">
            <CardBody>
              <p className="text-gray-700 mb-4">
                At TutorHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </CardBody>
          </Card>

          {/* Information We Collect */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="heading-md">Information We Collect</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-700 text-sm">
                    We collect personal information that you provide to us such as name, email address, phone number, and payment information when you register on our platform.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Usage Data</h3>
                  <p className="text-gray-700 text-sm">
                    We automatically collect certain information when you visit, use, or navigate the platform. This information includes device information, log data, and usage statistics.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Academic Data</h3>
                  <p className="text-gray-700 text-sm">
                    For students and tutors, we collect and store academic information including course materials, attendance records, grades, and homework submissions.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* How We Use Your Information */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="heading-md">How We Use Your Information</h2>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>To provide, operate, and maintain our platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>To improve, personalize, and expand our services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>To process your transactions and manage your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>To communicate with you about updates, offers, and support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>To send you marketing and promotional communications (with your consent)</span>
                </li>
              </ul>
            </CardBody>
          </Card>

          {/* Data Security */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="heading-md">Data Security</h2>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 text-sm mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information. However, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>SSL/TLS encryption for data transmission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Regular security audits and updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Secure password storage using industry-standard encryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Limited access to personal data by authorized personnel only</span>
                </li>
              </ul>
            </CardBody>
          </Card>

          {/* Your Rights */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="heading-md">Your Privacy Rights</h2>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 text-sm mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>The right to access your personal data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>The right to rectify or update your information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>The right to request deletion of your data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>The right to object to processing of your data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>The right to data portability</span>
                </li>
              </ul>
            </CardBody>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="heading-md">Contact Us</h2>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 text-sm mb-4">
                If you have questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Email:</strong> privacy@tutorhub.com<br />
                  <strong>Phone:</strong> +91 123 456 7890<br />
                  <strong>Address:</strong> 123 Education Street, Tech Park, Bangalore, Karnataka 560001, India
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
