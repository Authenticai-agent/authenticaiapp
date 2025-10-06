import React from 'react';
import { ShieldCheckIcon, LockClosedIcon, KeyIcon, BellAlertIcon } from '@heroicons/react/24/outline';

const SecurityPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Security Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: October 4, 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Our Commitment to Security</h2>
            <p>
              At AuthentiCare, security is our top priority. We implement industry-leading security measures to 
              protect your data, including health information, personal details, and account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Security Measures</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <LockClosedIcon className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Encryption</h3>
                </div>
                <ul className="text-sm space-y-1">
                  <li>• <strong>At Rest:</strong> AES-256 encryption</li>
                  <li>• <strong>In Transit:</strong> TLS 1.3</li>
                  <li>• <strong>Passwords:</strong> Bcrypt hashing</li>
                  <li>• <strong>Database:</strong> Encrypted backups</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <KeyIcon className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Authentication</h3>
                </div>
                <ul className="text-sm space-y-1">
                  <li>• JWT token-based auth</li>
                  <li>• Secure session management</li>
                  <li>• Password strength requirements</li>
                  <li>• Account lockout protection</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <ShieldCheckIcon className="w-6 h-6 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Infrastructure</h3>
                </div>
                <ul className="text-sm space-y-1">
                  <li>• Enterprise-grade hosting (Supabase)</li>
                  <li>• DDoS protection</li>
                  <li>• Firewall protection</li>
                  <li>• Regular security updates</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <BellAlertIcon className="w-6 h-6 text-red-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Monitoring</h3>
                </div>
                <ul className="text-sm space-y-1">
                  <li>• 24/7 security monitoring</li>
                  <li>• Intrusion detection</li>
                  <li>• Access logging</li>
                  <li>• Anomaly detection</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Protection</h2>
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.1 Health Data</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>HIPAA-level security standards (even though not HIPAA-covered)</li>
              <li>Encrypted storage and transmission</li>
              <li>Access controls and audit logs</li>
              <li>Regular security assessments</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.2 Payment Data</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>PCI DSS Level 1 compliance via Stripe</li>
              <li>We do NOT store credit card information</li>
              <li>Tokenized payment processing</li>
              <li>3D Secure authentication</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.3 Personal Data</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>GDPR and CCPA compliant storage</li>
              <li>Data minimization principles</li>
              <li>Regular data audits</li>
              <li>Secure deletion procedures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Incident Response</h2>
            <p>In the event of a security incident, we will:</p>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.1 Detection & Assessment</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Immediately investigate the incident</li>
              <li>Assess the scope and impact</li>
              <li>Contain the threat</li>
              <li>Preserve evidence for analysis</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.2 Notification</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Users:</strong> Notify affected users within 72 hours</li>
              <li><strong>Authorities:</strong> Report to relevant authorities as required</li>
              <li><strong>Details:</strong> Provide clear information about what happened</li>
              <li><strong>Guidance:</strong> Offer steps to protect yourself</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.3 Remediation</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Fix vulnerabilities immediately</li>
              <li>Implement additional security measures</li>
              <li>Conduct post-incident review</li>
              <li>Update security procedures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Third-Party Security</h2>
            <p>We carefully vet all third-party service providers:</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Service</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Security</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">Supabase</td>
                    <td className="py-2">Database & Auth</td>
                    <td className="py-2">SOC 2 Type II, HIPAA-ready</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">Stripe</td>
                    <td className="py-2">Payments</td>
                    <td className="py-2">PCI DSS Level 1</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Cloud Hosting</td>
                    <td className="py-2">Infrastructure</td>
                    <td className="py-2">ISO 27001, SOC 2</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3">All third-party providers must:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Maintain appropriate security certifications</li>
              <li>Sign data processing agreements</li>
              <li>Undergo regular security audits</li>
              <li>Notify us of any security incidents</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Security Responsibilities</h2>
            <p>Help us keep your account secure by:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Strong Passwords:</strong> Use unique, complex passwords (12+ characters)</li>
              <li><strong>Keep Credentials Secret:</strong> Never share your password</li>
              <li><strong>Secure Devices:</strong> Use updated, secure devices</li>
              <li><strong>Report Suspicious Activity:</strong> Contact us immediately if you notice anything unusual</li>
              <li><strong>Log Out:</strong> Always log out on shared devices</li>
              <li><strong>Update Contact Info:</strong> Keep your email current for security notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Vulnerability Disclosure</h2>
            <p>
              We welcome responsible disclosure of security vulnerabilities. If you discover a security issue:
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-3">
              <h3 className="font-semibold text-blue-900 mb-2">Report Security Issues</h3>
              <p className="text-sm text-blue-800 mb-2">
                <strong>Email:</strong> security@authenticai.ai
              </p>
              <p className="text-sm text-blue-800">
                Please include:
              </p>
              <ul className="text-sm text-blue-800 ml-4 mt-1 space-y-1">
                <li>• Detailed description of the vulnerability</li>
                <li>• Steps to reproduce</li>
                <li>• Potential impact</li>
                <li>• Your contact information</li>
              </ul>
            </div>

            <p className="mt-3">
              <strong>We commit to:</strong>
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Acknowledge your report within 48 hours</li>
              <li>Investigate and validate the issue</li>
              <li>Keep you informed of our progress</li>
              <li>Credit you for the discovery (if desired)</li>
              <li>Not pursue legal action for good-faith research</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Compliance & Certifications</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>GDPR:</strong> EU General Data Protection Regulation compliant</li>
              <li><strong>CCPA:</strong> California Consumer Privacy Act compliant</li>
              <li><strong>HIPAA-level:</strong> Security standards (not HIPAA-covered entity)</li>
              <li><strong>PCI DSS:</strong> Level 1 via Stripe for payment processing</li>
              <li><strong>SOC 2:</strong> Type II via infrastructure providers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Security Audits</h2>
            <p>We conduct regular security assessments:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Quarterly:</strong> Internal security reviews</li>
              <li><strong>Annually:</strong> Third-party penetration testing</li>
              <li><strong>Continuous:</strong> Automated vulnerability scanning</li>
              <li><strong>Ongoing:</strong> Code security reviews</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Updates to This Policy</h2>
            <p>
              We may update this Security Policy to reflect new security measures or changes in best practices. 
              Material changes will be communicated via email or through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Security Team</h2>
            <p>
              Security questions or concerns?
            </p>
            <p className="mt-2">
              <strong>Security Team:</strong> security@authenticai.ai<br />
              <strong>Vulnerability Reports:</strong> security@authenticai.ai<br />
              <strong>Data Protection Officer:</strong> dpo@authenticai.ai<br />
              <strong>General Support:</strong> support@authenticai.ai
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

export default SecurityPolicy;
