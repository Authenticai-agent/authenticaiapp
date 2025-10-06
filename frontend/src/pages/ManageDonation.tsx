import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageDonation: React.FC = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchDonations();
    }
  }, [user]);

  const fetchDonations = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/stripe/donations/${user?.id}`
      );
      setDonations(response.data.donations || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStopDonation = async (donationId: string) => {
    if (!window.confirm('Are you sure you want to stop this recurring donation? You will continue to have access until the end of your current period, but no refund will be issued.')) {
      return;
    }

    setStopping(donationId);
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/stripe/stop-donation`,
        { user_id: user?.id }
      );

      toast.success(response.data.message || 'Recurring donation stopped successfully');
      fetchDonations(); // Refresh donations list
    } catch (error: any) {
      console.error('Stop donation error:', error);
      
      // Handle different error response formats
      let errorMessage = 'Failed to stop recurring donation';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Check if detail is a string
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        }
        // Check if detail is an array (validation errors)
        else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(', ');
        }
        // Check if there's a message field
        else if (data.message) {
          errorMessage = data.message;
        }
        // Fallback to stringifying the error
        else if (typeof data.detail === 'object') {
          errorMessage = 'Validation error occurred';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setStopping(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  const activeDonations = donations.filter(d => d.status === 'active');
  const totalMonthly = activeDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Manage Your Donations</h1>
            <a href="/dashboard" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </a>
          </div>

          {donations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You don't have any donations yet.</p>
              <a href="/dashboard" className="text-blue-600 hover:underline">
                Return to Dashboard to make a donation
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Total Summary */}
              {activeDonations.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-300 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    💚 Thank You for Your Generous Support!
                  </h2>
                  <p className="text-3xl font-bold text-emerald-700 mb-2">
                    ${totalMonthly.toFixed(2)}
                    <span className="text-base font-normal text-gray-600">/month total</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    Your {activeDonations.length} active {activeDonations.length === 1 ? 'donation' : 'donations'} help us keep AuthentiCare free, ad-free, and accessible to everyone. 
                    We're deeply grateful for your trust and generosity. 🙏
                  </p>
                </div>
              )}

              {/* Individual Donations */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Donations</h2>
                {donations.map((donation, index) => {
                  const periodEndDate = donation.current_period_end 
                    ? new Date(donation.current_period_end * 1000).toLocaleDateString()
                    : 'Not available';
                  
                  return (
                    <div
                      key={donation.id}
                      className={`border rounded-lg p-6 ${
                        donation.status === 'active'
                          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              Donation #{donations.length - index}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              donation.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : donation.status === 'cancelled'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {donation.status}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-emerald-600">
                            ${donation.amount.toFixed(2)}
                            <span className="text-sm font-normal text-gray-600">
                              /{donation.interval}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Started</p>
                          <p className="font-medium">
                            {new Date(donation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {donation.current_period_end && (
                          <div>
                            <p className="text-sm text-gray-600">
                              {donation.cancel_at_period_end ? 'Ends on' : 'Next payment'}
                            </p>
                            <p className="font-medium">{periodEndDate}</p>
                          </div>
                        )}
                      </div>

                      {donation.status === 'active' && (
                        <>
                          {donation.cancel_at_period_end ? (
                            <div className="bg-orange-50 border border-orange-200 rounded p-4">
                              <p className="text-sm text-orange-700">
                                ⚠️ This recurring donation will end on <strong>{periodEndDate}</strong>.
                                You won't be charged again.
                              </p>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStopDonation(donation.id)}
                              disabled={stopping === donation.id}
                              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                            >
                              {stopping === donation.id ? 'Stopping...' : 'Stop Recurring Donation'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add More */}
              <div className="border-t pt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Want to increase your support? You can add another donation at any time.
                </p>
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border-2 border-emerald-300 text-sm font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50"
                >
                  Add Another Donation
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageDonation;
