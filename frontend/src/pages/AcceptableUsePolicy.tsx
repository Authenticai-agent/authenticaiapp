import React from 'react';

const AcceptableUsePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Acceptable Use Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: October 4, 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Purpose</h2>
            <p>
              This Acceptable Use Policy ("AUP") governs your use of AuthentiCare. By using the Service, you agree 
              to comply with this policy. Violations may result in account suspension or termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Prohibited Activities</h2>
            <p>You may NOT use AuthentiCare to:</p>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 Illegal Activities</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Violate any local, state, national, or international law</li>
              <li>Engage in fraud, theft, or money laundering</li>
              <li>Distribute illegal content or materials</li>
              <li>Harass, threaten, or harm others</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.2 Security Violations</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Attempt to gain unauthorized access to the Service or systems</li>
              <li>Bypass security measures or authentication mechanisms</li>
              <li>Probe, scan, or test vulnerabilities without permission</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Distribute viruses, malware, or harmful code</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.3 Data Misuse</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Scrape, crawl, or download data without permission</li>
              <li>Use automated tools to access the Service (bots, scrapers)</li>
              <li>Collect or harvest user information</li>
              <li>Reverse engineer or decompile the Service</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.4 Abuse and Spam</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Send spam, unsolicited messages, or advertisements</li>
              <li>Create multiple accounts to abuse the Service</li>
              <li>Impersonate any person or entity</li>
              <li>Use the Service for commercial purposes without authorization</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.5 Content Violations</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Post false, misleading, or fraudulent information</li>
              <li>Share copyrighted material without permission</li>
              <li>Distribute hate speech, discriminatory content, or violent material</li>
              <li>Post sexually explicit or inappropriate content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Acceptable Uses</h2>
            <p>You MAY use AuthentiCare to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Monitor air quality and environmental conditions</li>
              <li>Receive personalized health recommendations</li>
              <li>Track your health profile and preferences</li>
              <li>Access educational health information</li>
              <li>Make voluntary donations to support the Service</li>
              <li>Provide feedback and suggestions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Account Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of unauthorized access</li>
              <li>Providing accurate and truthful information</li>
              <li>Keeping your contact information up to date</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Reporting Violations</h2>
            <p>
              If you become aware of any violation of this AUP, please report it to:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> abuse@authenticai.ai<br />
              <strong>Subject:</strong> AUP Violation Report
            </p>
            <p className="mt-2">
              Include as much detail as possible, including:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Description of the violation</li>
              <li>Date and time</li>
              <li>Account or user involved (if known)</li>
              <li>Supporting evidence (screenshots, logs, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Enforcement</h2>
            <p>
              Violations of this AUP may result in:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Warning:</strong> First-time minor violations</li>
              <li><strong>Temporary Suspension:</strong> Repeated or moderate violations</li>
              <li><strong>Permanent Termination:</strong> Serious or repeated violations</li>
              <li><strong>Legal Action:</strong> Criminal activity or significant harm</li>
            </ul>
            <p className="mt-2">
              We reserve the right to suspend or terminate accounts at our discretion, with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. No Liability for User Actions</h2>
            <p>
              AuthentiCare is not responsible for user-generated content or actions. Users are solely responsible 
              for their use of the Service and compliance with all applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this AUP at any time. Material changes will be communicated via email or through the 
              Service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
            <p>
              Questions about this Acceptable Use Policy?
            </p>
            <p className="mt-2">
              <strong>Email:</strong> legal@authenticai.ai<br />
              <strong>Abuse Reports:</strong> abuse@authenticai.ai
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

export default AcceptableUsePolicy;
