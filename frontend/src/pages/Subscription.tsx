import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, CreditCardIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { paymentsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

interface Plan {
  name: string;
  price: number;
  features: string[];
}

interface Plans {
  [key: string]: Plan;
}

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  current_period_end: string;
}

interface UsageStats {
  coaching_sessions_this_month: number;
  predictions_this_month: number;
  active_devices: number;
  subscription_tier: string;
  limits: {
    coaching_sessions: number | string;
    predictions: number | string;
    devices: number | string;
  };
}

const Subscription: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plans>({});
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      const [plansRes, usageRes] = await Promise.all([
        paymentsAPI.getPlans(),
        paymentsAPI.getUsageStats()
      ]);

      setPlans(plansRes.data.plans || {});
      setUsageStats(usageRes.data || null);

      // Try to get current subscription
      try {
        const subRes = await paymentsAPI.getCurrentSubscription();
        setCurrentSubscription(subRes.data);
      } catch (error) {
        // No active subscription
        setCurrentSubscription(null);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return;
    }

    try {
      await paymentsAPI.cancelSubscription();
      toast.success('Subscription canceled successfully');
      await loadSubscriptionData();
      await refreshUser();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to cancel subscription';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="mt-4 text-lg text-gray-600">
            Upgrade your Authenticai experience with advanced features
          </p>
        </div>

        {/* Current Usage Stats */}
        {usageStats && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {usageStats.coaching_sessions_this_month}
                </p>
                <p className="text-sm text-gray-500">
                  Coaching Sessions / {usageStats.limits.coaching_sessions}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {usageStats.predictions_this_month}
                </p>
                <p className="text-sm text-gray-500">
                  Predictions / {usageStats.limits.predictions}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {usageStats.active_devices}
                </p>
                <p className="text-sm text-gray-500">
                  Smart Devices / {usageStats.limits.devices}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Subscription */}
        {currentSubscription && (
          <div className="card mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Current Subscription</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {currentSubscription.plan_type} Plan • Status: {currentSubscription.status}
                </p>
                {currentSubscription.current_period_end && (
                  <p className="text-sm text-gray-500">
                    {currentSubscription.status === 'canceled' ? 'Access ends' : 'Renews'} on{' '}
                    {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              {currentSubscription.status === 'active' && (
                <button
                  onClick={cancelSubscription}
                  className="btn-outline text-danger-600 border-danger-300 hover:bg-danger-50"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <div className={clsx(
            'card border-2',
            user?.subscription_tier === 'free' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
          )}>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">Free</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
            </div>
            
            <ul className="mt-6 space-y-3">
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                <span className="text-sm text-gray-700">Basic AQI alerts</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                <span className="text-sm text-gray-700">5 predictions per month</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                <span className="text-sm text-gray-700">10 coaching sessions</span>
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                <span className="text-sm text-gray-700">1 smart device</span>
              </li>
              <li className="flex items-center">
                <XMarkIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-400">Proactive notifications</span>
              </li>
              <li className="flex items-center">
                <XMarkIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-400">Advanced personalization</span>
              </li>
            </ul>

            {user?.subscription_tier === 'free' && (
              <div className="mt-6">
                <div className="btn-outline w-full opacity-50 cursor-not-allowed">
                  Current Plan
                </div>
              </div>
            )}
          </div>

          {/* Premium Plan */}
          <div className={clsx(
            'card border-2 relative',
            user?.subscription_tier === 'premium' ? 'border-primary-500 bg-primary-50' : 'border-primary-500'
          )}>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-primary-600 text-white px-3 py-1 text-sm font-medium rounded-full">
                Most Popular
              </span>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">Premium</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${plans.premium ? (plans.premium.price / 100).toFixed(2) : '9.99'}
                </span>
                <span className="text-gray-500">/month</span>
              </div>
            </div>
            
            <ul className="mt-6 space-y-3">
              {plans.premium?.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              )) || (
                <>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-sm text-gray-700">Everything in Free</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-sm text-gray-700">Unlimited predictions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-sm text-gray-700">Unlimited coaching</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-sm text-gray-700">Up to 10 smart devices</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-sm text-gray-700">Proactive notifications</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-sm text-gray-700">Advanced personalization</span>
                  </li>
                </>
              )}
            </ul>

            <div className="mt-6">
              {user?.subscription_tier === 'premium' ? (
                <div className="btn-outline w-full opacity-50 cursor-not-allowed">
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => setSelectedPlan('premium')}
                  className="btn-primary w-full"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className={clsx(
            'card border-2',
            user?.subscription_tier === 'enterprise' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
          )}>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">Enterprise</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${plans.enterprise ? (plans.enterprise.price / 100).toFixed(2) : '29.99'}
                </span>
                <span className="text-gray-500">/month</span>
              </div>
            </div>
            
            <ul className="mt-6 space-y-3">
              {plans.enterprise?.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              )) || (
                <>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-sm text-gray-700">Everything in Premium</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-sm text-gray-700">Multi-location monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-sm text-gray-700">Team management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-sm text-gray-700">Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-sm text-gray-700">Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-sm text-gray-700">Unlimited devices</span>
                  </li>
                </>
              )}
            </ul>

            <div className="mt-6">
              {user?.subscription_tier === 'enterprise' ? (
                <div className="btn-outline w-full opacity-50 cursor-not-allowed">
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => setSelectedPlan('enterprise')}
                  className="btn-secondary w-full"
                >
                  Upgrade to Enterprise
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {selectedPlan && (
          <Elements stripe={stripePromise}>
            <PaymentModal
              planType={selectedPlan}
              planName={plans[selectedPlan]?.name || selectedPlan}
              planPrice={plans[selectedPlan]?.price || 0}
              onClose={() => setSelectedPlan(null)}
              onSuccess={() => {
                setSelectedPlan(null);
                loadSubscriptionData();
                refreshUser();
              }}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

// Payment Modal Component
interface PaymentModalProps {
  planType: string;
  planName: string;
  planPrice: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  planType,
  planName,
  planPrice,
  onClose,
  onSuccess
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw error;
      }

      // Create subscription
      await paymentsAPI.createSubscription(planType, paymentMethod.id);
      
      toast.success('Subscription created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Payment error:', error);
      const message = error.response?.data?.detail || error.message || 'Payment failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Subscribe to {planName}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-900">{planName} Plan</span>
              <span className="text-xl font-bold text-gray-900">
                ${(planPrice / 100).toFixed(2)}/month
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCardIcon className="h-4 w-4 inline mr-1" />
                Payment Information
              </label>
              <div className="p-3 border border-gray-300 rounded-md">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !stripe}
                className="btn-primary"
              >
                {loading ? <LoadingSpinner size="sm" /> : `Subscribe for $${(planPrice / 100).toFixed(2)}/mo`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
