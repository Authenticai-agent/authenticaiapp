import React, { useState } from 'react';
import { HeartIcon, CheckIcon, ShieldCheckIcon, BeakerIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const DonationCTA: React.FC = () => {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const tiers = [
    { amount: 10, label: 'Supporter', priceId: process.env.REACT_APP_STRIPE_PRICE_SUPPORTER || '', icon: '💙' },
    { amount: 20, label: 'Contributor', priceId: process.env.REACT_APP_STRIPE_PRICE_CONTRIBUTOR || '', icon: '💚' },
    { amount: 35, label: 'Champion', priceId: process.env.REACT_APP_STRIPE_PRICE_CHAMPION || '', icon: '💜' },
  ];

  const handleDonate = async () => {
    if (!selectedTier) return;
    
    setLoading(true);
    
    try {
      const selectedTierData = tiers.find(t => t.amount === selectedTier);
      
      // Create checkout session
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'}/stripe/create-checkout-session`,
        {
          price_id: selectedTierData?.priceId,
          user_id: user?.id,
          user_email: user?.email,
        }
      );
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.checkout_url;
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start donation process. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main CTA Card */}
      <div className="card bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-pink-100 rounded-full mb-3">
            <HeartIcon className="w-8 h-8 text-pink-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Support Independent Health Tech
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            AuthentiCare is free for everyone. Help us stay independent, ad-free, and focused on your health.
          </p>
        </div>

        {/* Why We Stay Ad-Free */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 text-center">Why We Stay Ad-Free & Independent</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h5 className="font-semibold text-sm text-gray-900 mb-1">Stay Independent</h5>
              <p className="text-xs text-gray-600">
                No ads, no data selling, no corporate influence. Just science-backed health insights.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BeakerIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h5 className="font-semibold text-sm text-gray-900 mb-1">Fund Research</h5>
              <p className="text-xs text-gray-600">
                Your support helps us integrate more data sources and improve AI predictions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <UserGroupIcon className="w-6 h-6 text-pink-600" />
              </div>
              <h5 className="font-semibold text-sm text-gray-900 mb-1">Help Others</h5>
              <p className="text-xs text-gray-600">
                Keep the platform free for everyone, especially those who can't afford it.
              </p>
            </div>
          </div>
        </div>

      {/* Donation Tiers */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {tiers.map((tier) => (
          <button
            key={tier.amount}
            onClick={() => setSelectedTier(tier.amount)}
            className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
              selectedTier === tier.amount
                ? 'border-pink-500 bg-white shadow-lg'
                : 'border-gray-200 bg-white hover:border-pink-300'
            }`}
          >
            {selectedTier === tier.amount && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="text-3xl mb-2">{tier.icon}</div>
            <p className="text-2xl font-bold text-gray-900">${tier.amount}</p>
            <p className="text-xs text-gray-500 mt-1">{tier.label}</p>
            <p className="text-xs text-gray-400 mt-1">per year</p>
          </button>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleDonate}
        disabled={!selectedTier || loading}
        className={`block w-full py-3 px-4 rounded-lg font-semibold text-white text-center transition-all transform hover:scale-105 ${
          selectedTier && !loading
            ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? 'Processing...' : selectedTier ? `Donate $${selectedTier}/year` : 'Select an amount'}
      </button>

      {/* Donation Policy */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">DONATION POLICY:</h4>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>• Donations are 100% voluntary - you have full access whether you donate or not</li>
          <li>• All donations are non-refundable</li>
          <li>• Recurring donations are charged annually ($10, $20, or $35/year)</li>
          <li>• You can cancel recurring donations anytime - no access will be lost</li>
          <li>• After canceling, you will not be charged again</li>
          <li>• Your donations help us build and improve the app for everyone</li>
        </ul>
      </div>

      {/* Trust Indicators */}
      <div className="mt-3 flex flex-col items-center space-y-2">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <span>🔒 Secure payment</span>
          <span>•</span>
          <span>💚 Stop anytime</span>
          <span>•</span>
          <span>🌍 100% independent</span>
        </div>
        <a 
          href="/manage-donation" 
          className="text-xs text-blue-600 hover:underline mt-2"
        >
          Manage existing donations →
        </a>
      </div>
      </div>
    </div>
  );
};

export default DonationCTA;
