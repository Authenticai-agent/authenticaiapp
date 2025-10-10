import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Legal Column */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-emerald-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-emerald-400 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/hipaa-notice" className="hover:text-emerald-400 transition-colors">
                  HIPAA Notice
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies Column */}
          <div>
            <h3 className="font-semibold mb-4">Policies</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/acceptable-use" className="hover:text-emerald-400 transition-colors">
                  Acceptable Use
                </Link>
              </li>
              <li>
                <Link to="/security-policy" className="hover:text-emerald-400 transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="hover:text-emerald-400 transition-colors">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>

          {/* Games Column */}
          <div>
            <h3 className="font-semibold mb-4">🎮 Games</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/air-detective" className="hover:text-emerald-400 transition-colors">
                  🔍 AirDetective
                </Link>
              </li>
              <li className="text-gray-500">
                💧 Water Quality Quest (Coming Soon)
              </li>
              <li className="text-gray-500">
                ⚡ Energy Saver (Coming Soon)
              </li>
              <li className="text-gray-500">
                ♻️ Waste Warrior (Coming Soon)
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="hover:text-emerald-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:jura@authenticai.ai" 
                  className="hover:text-emerald-400 transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <Link to="/manage-donation" className="hover:text-emerald-400 transition-colors">
                  Manage Donations
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; 2025 AuthentiCare. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a 
                href="mailto:privacy@authenticai.ai" 
                className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
              >
                Privacy Inquiries
              </a>
              <span className="text-gray-600">•</span>
              <a 
                href="mailto:security@authenticai.ai" 
                className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
              >
                Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
