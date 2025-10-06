import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: October 4, 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              AuthentiCare ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
            <p className="mt-2">
              <strong>GDPR & CCPA Compliance:</strong> We comply with the General Data Protection Regulation (GDPR) 
              and California Consumer Privacy Act (CCPA). You have rights regarding your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 Personal Information</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Account Information:</strong> Email address, name, password (encrypted)</li>
              <li><strong>Health Information:</strong> Asthma severity, allergies, triggers, health goals (optional)</li>
              <li><strong>Location Data:</strong> Geographic coordinates for air quality monitoring (optional)</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on Service</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.2 Automatically Collected Information</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.3 Payment Information</h3>
            <p>
              Payment processing is handled by Stripe. We do not store your credit card information. Stripe's 
              privacy policy applies to payment data: <a href="https://stripe.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Provide and maintain the Service</li>
              <li>Personalize air quality recommendations based on your health profile</li>
              <li>Send you environmental alerts and health notifications</li>
              <li>Process donations and manage subscriptions</li>
              <li>Improve and optimize the Service</li>
              <li>Communicate with you about updates, security alerts, and support</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Legal Basis for Processing (GDPR)</h2>
            <p>We process your personal data based on:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Consent:</strong> You have given clear consent for us to process your personal data for specific purposes</li>
              <li><strong>Contract:</strong> Processing is necessary to provide the Service you requested</li>
              <li><strong>Legal Obligation:</strong> Processing is necessary to comply with the law</li>
              <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate interests (e.g., improving the Service)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing and Disclosure</h2>
            <p>We do NOT sell your personal data. We may share your information with:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Service Providers:</strong> Stripe (payments), Supabase (database), cloud hosting providers</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            <p className="mt-2">
              <strong>We do NOT:</strong> Sell your data to third parties, share data with advertisers, or use your 
              health information for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Encryption in transit (HTTPS/TLS)</li>
              <li>Encryption at rest for sensitive data</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
            </ul>
            <p className="mt-2">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Privacy Rights</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">7.1 GDPR Rights (EU Users)</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">7.2 CCPA Rights (California Users)</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Right to Know:</strong> What personal information we collect and how we use it</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (we don't sell data)</li>
              <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
            </ul>

            <p className="mt-4">
              <strong>To exercise your rights, contact us at:</strong> privacy@authenticai.ai
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Data Retention</h2>
            <p>We retain your personal data only as long as necessary:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Account Data:</strong> Until you delete your account or request deletion</li>
              <li><strong>Health Data:</strong> Until you delete it or close your account</li>
              <li><strong>Donation Records:</strong> 7 years for tax and legal compliance</li>
              <li><strong>Usage Logs:</strong> 90 days for security and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies for:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
              <li><strong>Analytics Cookies:</strong> Understand how users interact with the Service</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p className="mt-2">
              You can control cookies through your browser settings. Disabling cookies may limit functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Children's Privacy</h2>
            <p>
              The Service is not intended for children under 13. We do not knowingly collect personal information 
              from children under 13. If you believe we have collected data from a child, please contact us 
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate 
              safeguards are in place, including Standard Contractual Clauses (SCCs) for EU data transfers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes via email 
              or through the Service. Your continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact Us</h2>
            <p>
              For privacy-related questions, requests, or concerns:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> privacy@authenticai.ai<br />
              <strong>Data Protection Officer:</strong> dpo@authenticai.ai
            </p>
            <p className="mt-2">
              <strong>EU Representative:</strong> [If applicable, add EU representative details]<br />
              <strong>UK Representative:</strong> [If applicable, add UK representative details]
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

export default PrivacyPolicy;
