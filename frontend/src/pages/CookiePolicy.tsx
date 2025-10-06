import React from 'react';

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: October 4, 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you 
              visit a website. They are widely used to make websites work more efficiently and provide information to 
              website owners.
            </p>
            <p className="mt-2">
              Cookies help us remember your preferences, understand how you use our Service, and improve your experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Cookies</h2>
            <p>AuthentiCare uses cookies for the following purposes:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Authentication:</strong> To keep you logged in and maintain your session</li>
              <li><strong>Security:</strong> To protect against fraud and unauthorized access</li>
              <li><strong>Preferences:</strong> To remember your settings and choices</li>
              <li><strong>Analytics:</strong> To understand how you use the Service (with your consent)</li>
              <li><strong>Performance:</strong> To improve site speed and functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Types of Cookies We Use</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.1 Necessary Cookies (Always Active)</h3>
            <p className="mb-2">
              These cookies are essential for the Service to function. They cannot be disabled.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Cookie Name</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">auth_token</td>
                    <td className="py-2">Authentication and session management</td>
                    <td className="py-2">7 days</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">csrf_token</td>
                    <td className="py-2">Security protection against CSRF attacks</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">cookieConsent</td>
                    <td className="py-2">Stores your cookie preferences</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.2 Analytics Cookies (Optional)</h3>
            <p className="mb-2">
              These cookies help us understand how visitors use our Service. All data is anonymized.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Cookie Name</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">_analytics_id</td>
                    <td className="py-2">Anonymous user identification for analytics</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">_page_views</td>
                    <td className="py-2">Track page views and navigation patterns</td>
                    <td className="py-2">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.3 Functional Cookies (Optional)</h3>
            <p className="mb-2">
              These cookies enable enhanced functionality and personalization.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Cookie Name</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">user_location</td>
                    <td className="py-2">Remember your location for air quality data</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">theme_preference</td>
                    <td className="py-2">Remember your theme/display preferences</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">language</td>
                    <td className="py-2">Remember your language preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-Party Cookies</h2>
            <p>We use the following third-party services that may set cookies:</p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>
                <strong>Stripe:</strong> For secure payment processing. See{' '}
                <a href="https://stripe.com/cookies-policy/legal" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Stripe's Cookie Policy
                </a>
              </li>
              <li>
                <strong>Supabase:</strong> For authentication and database services. See{' '}
                <a href="https://supabase.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Supabase's Privacy Policy
                </a>
              </li>
            </ul>
            <p className="mt-2">
              <strong>We do NOT use:</strong> Advertising cookies, social media tracking cookies, or any cookies that 
              track you across other websites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Managing Your Cookie Preferences</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.1 Through Our Cookie Banner</h3>
            <p>
              When you first visit AuthentiCare, you'll see a cookie consent banner. You can:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Accept all cookies</li>
              <li>Accept only necessary cookies</li>
              <li>Customize your preferences</li>
            </ul>
            <p className="mt-2">
              You can change your preferences at any time by clicking the cookie icon in the footer or visiting 
              your Privacy Dashboard.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.2 Through Your Browser</h3>
            <p>Most browsers allow you to control cookies through their settings:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                <strong>Chrome:</strong>{' '}
                <a href="https://support.google.com/chrome/answer/95647" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Cookie settings
                </a>
              </li>
              <li>
                <strong>Firefox:</strong>{' '}
                <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Cookie settings
                </a>
              </li>
              <li>
                <strong>Safari:</strong>{' '}
                <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Cookie settings
                </a>
              </li>
              <li>
                <strong>Edge:</strong>{' '}
                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Cookie settings
                </a>
              </li>
            </ul>
            <p className="mt-2 text-sm text-gray-600">
              <strong>Note:</strong> Disabling necessary cookies will prevent you from using essential features like 
              logging in and saving preferences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Do Not Track (DNT)</h2>
            <p>
              We respect the "Do Not Track" (DNT) browser setting. If you have DNT enabled, we will not set any 
              analytics or functional cookies, only necessary cookies required for the Service to function.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookie Retention</h2>
            <p>Cookies are retained for different periods depending on their purpose:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain until expiration date or manual deletion</li>
              <li><strong>Maximum Duration:</strong> No cookie lasts longer than 2 years</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or 
              our practices. We will notify you of material changes via email or through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
            <p>
              If you have questions about our use of cookies:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> privacy@authenticai.ai<br />
              <strong>Data Protection Officer:</strong> dpo@authenticai.ai
            </p>
          </section>

          <section className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Your Rights Under GDPR & CCPA</h3>
            <p className="text-sm text-blue-800">
              You have the right to withdraw your consent to cookies at any time. You can also request information 
              about what data we collect through cookies and request deletion of that data. Visit your{' '}
              <a href="/privacy" className="underline font-medium">Privacy Dashboard</a> to exercise your rights.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
