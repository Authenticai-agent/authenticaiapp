import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle, X, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface GoogleCalendarConnectProps {
  onConnect?: () => void;
}

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({ onConnect }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkCalendarConnection();
  }, [user]);

  const checkCalendarConnection = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/calendar/upcoming-appointments/${user.id}`);
      setIsConnected(response.data.status === 'success');
    } catch (error) {
      setIsConnected(false);
    }
  };

  const handleGoogleAuth = () => {
    // Google OAuth configuration
    const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const REDIRECT_URI = `${window.location.origin}/calendar-callback`;
    const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
    
    if (!CLIENT_ID) {
      toast.error('Google Calendar integration is not configured');
      return;
    }

    // Generate OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', SCOPE);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('access_type', 'online');
    authUrl.searchParams.set('prompt', 'consent');

    // Open Google OAuth in popup
    const popup = window.open(
      authUrl.toString(),
      'google-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      toast.error('Popup blocked. Please allow popups for this site.');
      return;
    }

    // Listen for messages from popup
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        popup.close();
        handleAuthSuccess(event.data.accessToken);
        window.removeEventListener('message', messageListener);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        popup.close();
        toast.error('Google Calendar connection failed');
        window.removeEventListener('message', messageListener);
      }
    };

    window.addEventListener('message', messageListener);

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
      }
    }, 1000);
  };

  const handleAuthSuccess = async (accessToken: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/calendar/connect-calendar`, {
        access_token: accessToken,
        user_id: user.id
      });

      setIsConnected(true);
      toast.success('Google Calendar connected successfully! 🎉');
      setShowModal(false);
      onConnect?.();
    } catch (error) {
      console.error('Error connecting calendar:', error);
      toast.error('Failed to connect Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/calendar/disconnect-calendar/${user.id}`);
      setIsConnected(false);
      toast.success('Google Calendar disconnected');
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      toast.error('Failed to disconnect Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 mb-6 border-l-4 border-green-500">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Google Calendar Connected</h3>
              <p className="text-sm text-gray-600">Your appointments will appear with health recommendations</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Disconnect calendar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Connect Google Calendar</h3>
              <p className="text-sm text-gray-600">Get health-aware reminders for your appointments</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Connect
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Connect Google Calendar</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">What this enables:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>See upcoming appointments in your dashboard</li>
                      <li>Get health recommendations based on air quality</li>
                      <li>Weather-aware travel suggestions</li>
                      <li>Personalized preparation tips</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Privacy note:</strong> We only read your calendar to show upcoming appointments. 
                  We don't store or share your calendar data.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Permissions needed:</strong> Read-only access to your calendar events
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5 mr-2" />
                      Connect Google Calendar
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleCalendarConnect;
