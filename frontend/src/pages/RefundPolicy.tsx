import React from 'react';

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Refund & Donation Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: October 4, 2025</p>

        <div className="space-y-6 text-gray-700">
          {/* Important Notice */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
            <h2 className="text-lg font-semibold text-amber-900 mb-2">
              ⚠️ Important: All Donations Are Non-Refundable
            </h2>
            <p className="text-amber-800">
              AuthentiCare operates on a donation-based model. All donations are voluntary, non-refundable, and 
              do not grant any special features or privileges. By making a donation, you acknowledge and agree 
              to this policy.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Donation Model</h2>
            <p>
              AuthentiCare is a free, ad-free health monitoring platform supported entirely by voluntary donations 
              from our community. We believe in keeping health technology accessible to everyone, regardless of 
              their ability to pay.
            </p>
            <p className="mt-2">
              <strong>Key Principles:</strong>
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>The Service is completely free for all users</li>
              <li>Donations are voluntary and optional</li>
              <li>Donations support infrastructure, development, and keeping the Service free</li>
              <li>All users have access to the same features, regardless of donation status</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. No Refund Policy</h2>
            <p className="mb-2">
              <strong>All donations to AuthentiCare are final and non-refundable.</strong>
            </p>
            <p>This policy exists because:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Donations are voluntary contributions, not purchases of goods or services</li>
              <li>Funds are immediately allocated to operational costs (servers, APIs, development)</li>
              <li>Processing refunds would divert resources from improving the Service</li>
              <li>You retain full access to the Service regardless of donation status</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Recurring Donations</h2>
            <p>
              Recurring donations are charged annually at the amount you selected ($10, $20, or $35 per year).
            </p>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.1 How Recurring Donations Work</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Charged automatically on the anniversary of your first donation</li>
              <li>You will receive an email reminder 7 days before the next charge</li>
              <li>You can stop recurring donations at any time</li>
              <li>No refunds for partial periods</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.2 Stopping Recurring Donations</h3>
            <p>You can stop your recurring donation at any time by:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Visiting your <a href="/manage-donation" className="text-blue-600 hover:underline">Manage Donations</a> page</li>
              <li>Clicking "Stop Recurring Donation"</li>
              <li>Confirming your choice</li>
            </ul>
            <p className="mt-2">
              <strong>Important:</strong> When you stop a recurring donation:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>You will continue to have full access to the Service</li>
              <li>You will not be charged again after the current period ends</li>
              <li>No refund will be issued for the current period</li>
              <li>You can resume donations at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. What Your Donation Supports</h2>
            <p>Your donations help us:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Infrastructure:</strong> Server costs, database hosting, API services</li>
              <li><strong>Data Sources:</strong> Access to air quality, pollen, and weather APIs</li>
              <li><strong>Development:</strong> New features, bug fixes, and improvements</li>
              <li><strong>Security:</strong> Regular security audits and updates</li>
              <li><strong>Accessibility:</strong> Keeping the Service free for everyone</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Exceptions to No Refund Policy</h2>
            <p>
              We may consider refunds only in the following exceptional circumstances:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Technical Error:</strong> If you were charged multiple times due to a system error</li>
              <li><strong>Unauthorized Charge:</strong> If your payment method was used without your authorization</li>
              <li><strong>Service Discontinuation:</strong> If we permanently shut down the Service</li>
            </ul>
            <p className="mt-2">
              To request a refund under these exceptional circumstances, contact us at{' '}
              <a href="mailto:support@authenticai.ai" className="text-blue-600 hover:underline">
                support@authenticai.ai
              </a>{' '}
              with:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Your account email</li>
              <li>Transaction date and amount</li>
              <li>Detailed explanation of the issue</li>
              <li>Supporting documentation (if applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Tax Deductibility</h2>
            <p>
              <strong>Donations to AuthentiCare are NOT tax-deductible.</strong>
            </p>
            <p className="mt-2">
              AuthentiCare is not a registered 501(c)(3) nonprofit organization. Your donations are considered 
              voluntary contributions to support a free service, not charitable donations for tax purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Payment Processing</h2>
            <p>
              All donations are processed securely through Stripe, a PCI-compliant payment processor. We do not 
              store your credit card information.
            </p>
            <p className="mt-2">
              <strong>Payment Security:</strong>
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>256-bit SSL encryption</li>
              <li>PCI DSS Level 1 compliance</li>
              <li>3D Secure authentication when required</li>
              <li>Fraud detection and prevention</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Failed Payments</h2>
            <p>
              If a recurring donation payment fails:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>We will attempt to charge your payment method up to 3 times over 7 days</li>
              <li>You will receive email notifications about the failed payment</li>
              <li>You can update your payment method in your <a href="/manage-donation" className="text-blue-600 hover:underline">Manage Donations</a> page</li>
              <li>If all attempts fail, your recurring donation will be automatically stopped</li>
              <li>You will continue to have full access to the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Chargebacks and Disputes</h2>
            <p>
              If you initiate a chargeback or payment dispute with your bank:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Your recurring donation will be immediately stopped</li>
              <li>You will continue to have access to the Service (it's free for everyone)</li>
              <li>We may contact you to resolve the dispute</li>
              <li>Fraudulent chargebacks may result in account suspension</li>
            </ul>
            <p className="mt-2">
              <strong>Please contact us first</strong> at{' '}
              <a href="mailto:support@authenticai.ai" className="text-blue-600 hover:underline">
                support@authenticai.ai
              </a>{' '}
              before initiating a chargeback. We're happy to help resolve any issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Refund Policy from time to time. Material changes will be communicated via email 
              or through the Service. Your continued donations after changes constitute acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
            <p>
              Questions about donations or this policy?
            </p>
            <p className="mt-2">
              <strong>Email:</strong> support@authenticai.ai<br />
              <strong>Donation Support:</strong> donations@authenticai.ai
            </p>
          </section>

          {/* Thank You Message */}
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-lg">
            <h2 className="text-lg font-semibold text-emerald-900 mb-2">
              💚 Thank You for Your Support
            </h2>
            <p className="text-emerald-800">
              Your donations make it possible to keep AuthentiCare free, ad-free, and accessible to everyone who 
              needs it. We're deeply grateful for your generosity and trust in our mission to help people breathe 
              easier and live healthier lives.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
          <a href="/manage-donation" className="text-emerald-600 hover:underline font-medium">
            Manage Donations →
          </a>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
