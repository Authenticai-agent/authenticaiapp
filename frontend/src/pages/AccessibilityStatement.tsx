import React from 'react';

const AccessibilityStatement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Accessibility Statement</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: October 4, 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Our Commitment</h2>
            <p>
              AuthentiCare is committed to ensuring digital accessibility for people with disabilities. We are 
              continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Conformance Status</h2>
            <p>
              We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>. 
              These guidelines explain how to make web content more accessible for people with disabilities.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-3">
              <p className="text-sm text-blue-800">
                <strong>Current Status:</strong> Partially conformant. We are actively working to achieve full 
                WCAG 2.1 Level AA compliance.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Accessibility Features</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.1 Keyboard Navigation</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>All interactive elements are keyboard accessible</li>
              <li>Logical tab order throughout the application</li>
              <li>Visible focus indicators</li>
              <li>Skip navigation links</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.2 Screen Reader Support</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Semantic HTML structure</li>
              <li>ARIA labels and descriptions</li>
              <li>Alternative text for images</li>
              <li>Descriptive link text</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.3 Visual Design</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>WCAG AA color contrast ratios (4.5:1 for normal text, 3:1 for large text)</li>
              <li>Resizable text up to 200% without loss of functionality</li>
              <li>Clear visual hierarchy</li>
              <li>No reliance on color alone to convey information</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.4 Content</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Clear, simple language</li>
              <li>Consistent navigation</li>
              <li>Descriptive headings and labels</li>
              <li>Error identification and suggestions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Assistive Technologies</h2>
            <p>AuthentiCare is designed to be compatible with the following assistive technologies:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Screen Readers:</strong> JAWS, NVDA, VoiceOver, TalkBack</li>
              <li><strong>Screen Magnification:</strong> ZoomText, built-in browser zoom</li>
              <li><strong>Speech Recognition:</strong> Dragon NaturallySpeaking, Voice Control</li>
              <li><strong>Keyboard Navigation:</strong> Full keyboard support without mouse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Browser Compatibility</h2>
            <p>We support the latest versions of:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Google Chrome</li>
              <li>Mozilla Firefox</li>
              <li>Apple Safari</li>
              <li>Microsoft Edge</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Known Limitations</h2>
            <p>
              Despite our best efforts, some limitations may exist. We are actively working to address the 
              following known issues:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Some third-party content (maps, charts) may have limited accessibility</li>
              <li>Complex data visualizations may require alternative text descriptions</li>
              <li>Some dynamic content updates may not be announced to screen readers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Accessibility Testing</h2>
            <p>We conduct regular accessibility testing using:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Automated Tools:</strong> axe DevTools, WAVE, Lighthouse</li>
              <li><strong>Manual Testing:</strong> Keyboard navigation, screen reader testing</li>
              <li><strong>User Testing:</strong> Feedback from users with disabilities</li>
              <li><strong>Third-Party Audits:</strong> Annual accessibility audits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Feedback & Contact</h2>
            <p>
              We welcome your feedback on the accessibility of AuthentiCare. Please let us know if you encounter 
              accessibility barriers:
            </p>
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg mt-3">
              <p className="text-sm text-emerald-800 mb-2">
                <strong>Accessibility Coordinator:</strong> accessibility@authenticai.ai
              </p>
              <p className="text-sm text-emerald-800">
                Please include:
              </p>
              <ul className="text-sm text-emerald-800 ml-4 mt-1 space-y-1">
                <li>• Description of the accessibility barrier</li>
                <li>• Page or feature where you encountered the issue</li>
                <li>• Assistive technology you were using (if applicable)</li>
                <li>• Browser and operating system</li>
              </ul>
            </div>
            <p className="mt-3">
              We aim to respond to accessibility feedback within 3 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Alternative Formats</h2>
            <p>
              If you need information in an alternative format:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Large Print:</strong> Available upon request</li>
              <li><strong>Audio:</strong> Screen reader compatible</li>
              <li><strong>Plain Text:</strong> Data export in accessible formats</li>
              <li><strong>Braille:</strong> Available upon request</li>
            </ul>
            <p className="mt-2">
              Contact us at <a href="mailto:accessibility@authenticai.ai" className="text-blue-600 hover:underline">accessibility@authenticai.ai</a> to request alternative formats.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Ongoing Improvements</h2>
            <p>
              We are committed to continuous improvement of our accessibility. Our roadmap includes:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Q1 2026:</strong> Complete WCAG 2.1 Level AA audit and remediation</li>
              <li><strong>Q2 2026:</strong> Implement enhanced screen reader announcements</li>
              <li><strong>Q3 2026:</strong> Add high contrast mode option</li>
              <li><strong>Q4 2026:</strong> Achieve WCAG 2.1 Level AAA for critical features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Accessibility Resources</h2>
            <p>
              Learn more about web accessibility:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                <a href="https://www.w3.org/WAI/WCAG21/quickref/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  WCAG 2.1 Quick Reference
                </a>
              </li>
              <li>
                <a href="https://www.ada.gov/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Americans with Disabilities Act (ADA)
                </a>
              </li>
              <li>
                <a href="https://www.section508.gov/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Section 508 Standards
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Formal Complaints</h2>
            <p>
              If you are not satisfied with our response to your accessibility concern, you may file a formal complaint:
            </p>
            <p className="mt-2">
              <strong>Internal:</strong> accessibility@authenticai.ai<br />
              <strong>External (US):</strong> U.S. Department of Justice, Civil Rights Division<br />
              <strong>External (EU):</strong> Your national data protection authority
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Updates to This Statement</h2>
            <p>
              This Accessibility Statement was last updated on October 4, 2025. We review and update this 
              statement regularly to reflect our ongoing accessibility improvements.
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

export default AccessibilityStatement;
