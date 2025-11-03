import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/reusable/Card';
import { Button } from '@/components/reusable/Button';
import Footer from '@/components/shared/Footer';
import { Link } from 'react-router-dom';
import { Target, Users, Zap, Shield, Heart, Award } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">About TutorHub</h1>
            <p className="text-lg text-indigo-100">
              Empowering educators and institutes with modern technology
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Our Story */}
          <Card className="mb-8">
            <CardBody>
              <h2 className="heading-lg text-center mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  TutorHub was founded in 2023 with a simple yet powerful vision: to transform the way tutors and coaching institutes manage their operations and connect with students. We recognized the challenges faced by educators in managing administrative tasks while focusing on what they do best – teaching.
                </p>
                <p>
                  Our platform combines the power of Customer Relationship Management (CRM) with Learning Management System (LMS) capabilities, creating an all-in-one solution that streamlines operations, enhances student engagement, and drives educational excellence.
                </p>
                <p>
                  Today, TutorHub serves hundreds of tutors and institutes across India, helping them manage thousands of students and deliver quality education more efficiently than ever before.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Mission & Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="heading-md">Our Mission</h2>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-gray-700 text-sm">
                  To empower educators with technology that simplifies management, enhances teaching, and creates better learning experiences for students worldwide.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="heading-md">Our Values</h2>
                </div>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Innovation in education technology</li>
                  <li>• User-centric design and experience</li>
                  <li>• Data security and privacy</li>
                  <li>• Continuous improvement</li>
                  <li>• Exceptional customer support</li>
                </ul>
              </CardBody>
            </Card>
          </div>

          {/* Key Features */}
          <div className="mb-8">
            <h2 className="heading-lg text-center mb-8">Why Choose TutorHub?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardBody>
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-green-100 p-3 rounded-lg mb-4">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Complete CRM</h3>
                    <p className="text-sm text-gray-600">
                      Manage students, batches, enquiries, and communications all in one place.
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-100 p-3 rounded-lg mb-4">
                      <Zap className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Automated Workflows</h3>
                    <p className="text-sm text-gray-600">
                      Automate class scheduling, payment reminders, and notifications.
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-purple-100 p-3 rounded-lg mb-4">
                      <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                    <p className="text-sm text-gray-600">
                      Enterprise-grade security with 99.9% uptime guarantee.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Stats */}
          <Card className="mb-8">
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">500+</div>
                  <div className="text-sm text-gray-600">Active Institutes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">10,000+</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">1,500+</div>
                  <div className="text-sm text-gray-600">Tutors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* CTA */}
          <Card>
            <CardBody>
              <div className="text-center py-8">
                <div className="bg-indigo-100 p-4 rounded-full inline-block mb-4">
                  <Award className="w-12 h-12 text-indigo-600" />
                </div>
                <h2 className="heading-lg mb-4">Ready to Transform Your Institute?</h2>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  Join hundreds of educators who trust TutorHub to manage their operations and deliver exceptional educational experiences.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup">
                    <Button size="lg">Get Started Free</Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="secondary" size="lg">Contact Sales</Button>
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
