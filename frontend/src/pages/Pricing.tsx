import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  HeartIcon, 
  CheckCircleIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BeakerIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Pricing: React.FC = () => {
  const [contributionAmount, setContributionAmount] = useState(5);
  const [isAnnual, setIsAnnual] = useState(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContributionAmount(parseInt(e.target.value));
  };

  const getContributionLevel = (amount: number) => {
    if (amount === 0) return { name: 'Free User', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    if (amount < 5) return { name: 'Supporter', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (amount < 10) return { name: 'Contributor', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (amount < 20) return { name: 'Advocate', color: 'text-purple-600', bgColor: 'bg-purple-50' };
    return { name: 'Champion', color: 'text-pink-600', bgColor: 'bg-pink-50' };
  };

  const level = getContributionLevel(contributionAmount);
  const annualAmount = contributionAmount * 12;
  const annualSavings = Math.round(annualAmount * 0.15); // 15% discount

  const freeFeatures = [
    'Real-time air quality monitoring',
    'Daily health briefings',
    'Basic pollen tracking',
    'Weather integration',
    'Location-based alerts',
  ];

  const premiumFeatures = [
    'Advanced AI predictions (7-day forecast)',
    'Indoor air quality assessment',
    'Personalized health education',
    'Comprehensive health reports',
    'Priority support',
    'Early access to new features',
    'No ads, forever',
    'Support independent health tech',
  ];

  const impactStats = [
    { icon: UserGroupIcon, value: '50,000+', label: 'Users Protected' },
    { icon: GlobeAltIcon, value: '120+', label: 'Countries Served' },
    { icon: BeakerIcon, value: '35+', label: 'Data Sources' },
    { icon: ChartBarIcon, value: '1M+', label: 'Predictions Made' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Support Independent Health Tech
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AuthentiCare is free for everyone. Become a member to help us stay independent, 
            ad-free, and focused on your health.
          </p>
        </div>

        {/* Main Pricing Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Free vs Premium Toggle */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    !isAnnual 
                      ? 'bg-white text-blue-600 shadow-lg' 
                      : 'bg-blue-500/30 text-white hover:bg-blue-500/50'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    isAnnual 
                      ? 'bg-white text-purple-600 shadow-lg' 
                      : 'bg-purple-500/30 text-white hover:bg-purple-500/50'
                  }`}
                >
                  Annual <span className="text-xs ml-1">(Save 15%)</span>
                </button>
              </div>

              <div className="text-center">
                <div className={`inline-block px-6 py-2 rounded-full ${level.bgColor} mb-4`}>
                  <span className={`font-semibold ${level.color}`}>{level.name}</span>
                </div>
                <div className="text-5xl font-bold mb-2">
                  ${isAnnual ? annualAmount - annualSavings : contributionAmount}
                  <span className="text-2xl font-normal">/{isAnnual ? 'year' : 'month'}</span>
                </div>
                {isAnnual && contributionAmount > 0 && (
                  <p className="text-blue-100">Save ${annualSavings}/year</p>
                )}
              </div>
            </div>

            {/* Slider Section */}
            <div className="p-8">
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Choose your contribution amount
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={contributionAmount}
                  onChange={handleSliderChange}
                  className="w-full h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${(contributionAmount / 30) * 100}%, #e5e7eb ${(contributionAmount / 30) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Free</span>
                  <span>$15</span>
                  <span>$30+</span>
                </div>
              </div>

              {/* What You Get */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Free Features */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    Always Free
                  </h3>
                  <ul className="space-y-2">
                    {freeFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Premium Features */}
                <div className={`${contributionAmount > 0 ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <SparklesIcon className="w-5 h-5 text-purple-500 mr-2" />
                    Member Benefits
                  </h3>
                  <ul className="space-y-2">
                    {premiumFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <SparklesIcon className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all transform hover:scale-105 ${
                  contributionAmount > 0
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={contributionAmount === 0}
              >
                {contributionAmount > 0 ? (
                  <>
                    <HeartIcon className="w-5 h-5 inline mr-2" />
                    Become a Member - ${isAnnual ? annualAmount - annualSavings : contributionAmount}/{isAnnual ? 'year' : 'month'}
                  </>
                ) : (
                  'Continue with Free Plan'
                )}
              </button>

              {contributionAmount === 0 && (
                <Link
                  to="/dashboard"
                  className="block w-full py-4 mt-3 text-center rounded-xl font-semibold text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transition-all"
                >
                  Continue with Free Plan
                </Link>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                Cancel anytime. No questions asked. 30-day money-back guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* Why Support Us */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Why Become a Member?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Stay Independent</h3>
              <p className="text-sm text-gray-600">
                No ads, no data selling, no corporate influence. Just science-backed health insights.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BeakerIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fund Research</h3>
              <p className="text-sm text-gray-600">
                Your support helps us integrate more data sources and improve AI predictions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Help Others</h3>
              <p className="text-sm text-gray-600">
                Keep the platform free for everyone, especially those who can't afford it.
              </p>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold text-center mb-8">Our Impact Together</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {impactStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Is the free plan really free forever?
              </summary>
              <p className="mt-3 text-gray-600">
                Yes! All core features including real-time air quality monitoring, daily briefings, 
                and health alerts are 100% free, forever. We believe everyone deserves access to 
                clean air information.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What happens if I cancel my membership?
              </summary>
              <p className="mt-3 text-gray-600">
                You'll continue to have access to member features until the end of your billing period, 
                then automatically switch to the free plan. No data is lost, and you can rejoin anytime.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                How is my contribution used?
              </summary>
              <p className="mt-3 text-gray-600">
                100% goes to platform development: server costs, API fees, new data sources, 
                AI improvements, and keeping the service free for everyone. We're fully transparent 
                about our costs.
              </p>
            </details>

            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Can I change my contribution amount?
              </summary>
              <p className="mt-3 text-gray-600">
                Absolutely! You can increase, decrease, or cancel your membership at any time from 
                your account settings. No questions asked.
              </p>
            </details>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <HeartIcon className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Join 10,000+ Members Supporting Clean Air for All
            </h3>
            <p className="text-gray-600 mb-6">
              Every contribution, no matter the size, helps us stay independent and improve 
              health outcomes for millions worldwide.
            </p>
            <Link
              to="#pricing"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Choose Your Contribution
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
        }

        details summary::-webkit-details-marker {
          display: none;
        }

        details summary::after {
          content: '+';
          float: right;
          font-size: 1.5rem;
          font-weight: bold;
          color: #6b7280;
        }

        details[open] summary::after {
          content: '−';
        }
      `}</style>
    </div>
  );
};

export default Pricing;
