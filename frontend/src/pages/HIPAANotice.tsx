import React from 'react';

const HIPAANotice: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">HIPAA Privacy Notice</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: October 4, 2025</p>

        <div className="space-y-6 text-gray-700">
          {/* Important Disclaimer */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              ℹ️ Important: AuthentiCare is NOT a HIPAA-Covered Entity
            </h2>
            <p className="text-blue-800">
              AuthentiCare is a wellness and environmental monitoring application, not a healthcare provider, 
              health plan, or healthcare clearinghouse. We are NOT subject to HIPAA regulations. However, we 
              implement HIPAA-level security standards as a best practice to protect your health information.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What is HIPAA?</h2>
            <p>
              The Health Insurance Portability and Accountability Act (HIPAA) is a federal law that protects the 
              privacy and security of health information. HIPAA applies to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Healthcare providers (doctors, hospitals, clinics)</li>
              <li>Health plans (insurance companies)</li>
              <li>Healthcare clearinghouses</li>
              <li>Business associates of the above entities</li>
            </ul>
            <p className="mt-2">
              <strong>AuthentiCare does not fall into any of these categories.</strong> We are a consumer wellness 
              application that you use voluntarily to track environmental health factors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Health Information We Collect</h2>
            <p>
              You may voluntarily provide the following health-related information:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Asthma severity level</li>
              <li>Allergies and sensitivities</li>
              <li>Environmental triggers</li>
              <li>Medications (names only, no dosages or prescriptions)</li>
              <li>Health goals and preferences</li>
            </ul>
            <p className="mt-2">
              <strong>We do NOT collect:</strong>
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Medical diagnoses or treatment records</li>
              <li>Prescription information or dosages</li>
              <li>Insurance information</li>
              <li>Social Security numbers</li>
              <li>Medical test results or lab values</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Protect Your Health Information</h2>
            <p>
              Even though we're not required to comply with HIPAA, we implement HIPAA-level security standards:
            </p>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.1 Technical Safeguards</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Encryption:</strong> AES-256 encryption at rest, TLS 1.3 in transit</li>
              <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication</li>
              <li><strong>Audit Logs:</strong> All data access is logged and monitored</li>
              <li><strong>Secure Infrastructure:</strong> Enterprise-grade cloud hosting (Supabase)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.2 Administrative Safeguards</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Regular security risk assessments</li>
              <li>Employee training on data privacy</li>
              <li>Incident response procedures</li>
              <li>Data breach notification protocols</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.3 Physical Safeguards</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Secure data centers with 24/7 monitoring</li>
              <li>Redundant backups in multiple locations</li>
              <li>Disaster recovery procedures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. How We Use Your Health Information</h2>
            <p>We use your health information only for:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Personalization:</strong> Tailoring air quality recommendations to your health profile</li>
              <li><strong>Alerts:</strong> Notifying you of environmental conditions that may affect you</li>
              <li><strong>Analytics:</strong> Improving our algorithms (anonymized data only)</li>
              <li><strong>Research:</strong> Understanding health trends (with your explicit consent, anonymized)</li>
            </ul>
            <p className="mt-2">
              <strong>We will NEVER:</strong>
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Sell your health information to third parties</li>
              <li>Share your health information with advertisers</li>
              <li>Use your health information for marketing without consent</li>
              <li>Disclose your health information to employers or insurers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights Regarding Health Information</h2>
            <p>You have the following rights:</p>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.1 Right to Access</h3>
            <p>
              You can view, download, and export all your health information at any time through your{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Dashboard</a>.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.2 Right to Correct</h3>
            <p>
              You can update or correct your health information at any time through your{' '}
              <a href="/profile" className="text-blue-600 hover:underline">Profile</a> page.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.3 Right to Delete</h3>
            <p>
              You can delete specific health information or your entire account at any time. Deletion is permanent 
              and cannot be undone.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.4 Right to Restrict</h3>
            <p>
              You can choose which health information to provide. All health profile fields are optional.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.5 Right to Withdraw Consent</h3>
            <p>
              You can withdraw consent for research participation or data sharing at any time through your 
              Privacy Dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. When We May Disclose Health Information</h2>
            <p>
              We may disclose your health information only in the following limited circumstances:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>With Your Consent:</strong> When you explicitly authorize disclosure</li>
              <li><strong>Legal Requirement:</strong> When required by law or court order</li>
              <li><strong>Public Health:</strong> To prevent serious health threats (e.g., disease outbreaks)</li>
              <li><strong>Research:</strong> Anonymized data only, with your consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Breach Notification</h2>
            <p>
              In the unlikely event of a data breach affecting your health information, we will:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Notify you within 72 hours of discovering the breach</li>
              <li>Provide details about what information was affected</li>
              <li>Explain steps we're taking to address the breach</li>
              <li>Offer guidance on protecting yourself</li>
              <li>Notify relevant authorities as required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Third-Party Service Providers</h2>
            <p>
              We use the following service providers who may have access to your health information:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Supabase:</strong> Database and authentication (HIPAA-compliant infrastructure)</li>
              <li><strong>Cloud Hosting:</strong> Secure cloud infrastructure providers</li>
            </ul>
            <p className="mt-2">
              All service providers are contractually required to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Implement appropriate security measures</li>
              <li>Use data only for providing services to us</li>
              <li>Not disclose data to unauthorized parties</li>
              <li>Notify us of any security incidents</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Children's Health Information</h2>
            <p>
              AuthentiCare is not intended for children under 13. We do not knowingly collect health information 
              from children under 13. If you believe we have collected information from a child under 13, please 
              contact us immediately at{' '}
              <a href="mailto:privacy@authenticai.ai" className="text-blue-600 hover:underline">
                privacy@authenticai.ai
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. International Data Transfers</h2>
            <p>
              Your health information may be transferred to and processed in countries other than your own. We 
              ensure appropriate safeguards are in place, including:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Standard Contractual Clauses (SCCs) for EU data transfers</li>
              <li>Adequate security measures in all locations</li>
              <li>Compliance with local data protection laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Retention of Health Information</h2>
            <p>We retain your health information:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Active Account:</strong> As long as your account is active</li>
              <li><strong>After Deletion Request:</strong> Permanently deleted within 30 days</li>
              <li><strong>Backup Systems:</strong> Removed from backups within 90 days</li>
              <li><strong>Anonymized Research Data:</strong> May be retained indefinitely (cannot be linked to you)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Changes to This Notice</h2>
            <p>
              We may update this HIPAA Privacy Notice to reflect changes in our practices or legal requirements. 
              Material changes will be communicated via email or through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact Us</h2>
            <p>
              Questions about how we handle your health information?
            </p>
            <p className="mt-2">
              <strong>Privacy Officer:</strong> privacy@authenticai.ai<br />
              <strong>Data Protection Officer:</strong> dpo@authenticai.ai<br />
              <strong>Security Team:</strong> security@authenticai.ai
            </p>
          </section>

          {/* Medical Disclaimer */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              ⚕️ Medical Disclaimer
            </h2>
            <p className="text-red-800">
              <strong>AuthentiCare is NOT a medical device and does not provide medical advice.</strong> All 
              information and recommendations are for educational and informational purposes only. Always consult 
              with a qualified healthcare provider for medical advice, diagnosis, and treatment. Never disregard 
              professional medical advice or delay seeking it because of information from AuthentiCare.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
};

export default HIPAANotice;
