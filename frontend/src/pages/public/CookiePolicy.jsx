import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/reusable/Card';
import Footer from '@/components/shared/Footer';
import { Cookie, CheckCircle, Settings, Eye } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-lg text-indigo-100">
              Learn about how we use cookies and similar technologies
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="mb-6">
            <CardBody>
              <p className="text-gray-700 mb-4">
                This Cookie Policy explains how TutorHub uses cookies and similar technologies to recognize you when you visit our platform. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
              </p>
            </CardBody>
          </Card>

          {/* What are Cookies */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Cookie className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="heading-md">What are Cookies?</h2>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 text-sm mb-4">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
              <p className="text-gray-700 text-sm">
                Cookies set by the website owner (in this case, TutorHub) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies".
              </p>
            </CardBody>
          </Card>

          {/* Types of Cookies */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="heading-md">Types of Cookies We Use</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-gray-700 text-sm">
                    These cookies are strictly necessary to provide you with services available through our platform and to use some of its features, such as access to secure areas. Without these cookies, services you have asked for cannot be provided.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Performance & Analytics Cookies</h3>
                  <p className="text-gray-700 text-sm">
                    These cookies collect information about how you use our platform, such as which pages you visit most often. This data helps us optimize our platform and improve user experience.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Functionality Cookies</h3>
                  <p className="text-gray-700 text-sm">
                    These cookies allow the platform to remember choices you make (such as your user name, language, or the region you are in) and provide enhanced, more personal features.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Targeting & Advertising Cookies</h3>
                  <p className="text-gray-700 text-sm">
                    These cookies may be set through our site by our advertising partners. They may be used to build a profile of your interests and show you relevant advertisements on other sites.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Cookie Management */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="heading-md">How to Manage Cookies</h2>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 text-sm mb-4">
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the appropriate opt-out links provided in the cookie banner when you first visit our platform.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> If you choose to reject cookies, you may still use our platform though your access to some functionality and areas may be restricted.
                </p>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Browser Settings</h3>
              <p className="text-gray-700 text-sm mb-2">
                Most web browsers allow you to control cookies through their settings. You can set your browser to:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Block all cookies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Block third-party cookies only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Delete cookies when you close your browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Alert you when a website sets a cookie</span>
                </li>
              </ul>
            </CardBody>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Eye className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="heading-md">Updates to This Policy</h2>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 text-sm mb-4">
                We may update this Cookie Policy from time to time to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Last Updated:</strong> January 2024<br />
                  <strong>Contact:</strong> privacy@tutorhub.com
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
