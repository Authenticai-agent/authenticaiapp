import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CalendarCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle OAuth callback from Google
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // Remove # and parse
    
    const accessToken = params.get('access_token');
    const error = params.get('error');

    if (error) {
      // Send error to parent window
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: error
      }, window.location.origin);
      
      window.close();
      return;
    }

    if (accessToken) {
      // Send success message to parent window
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_SUCCESS',
        accessToken: accessToken
      }, window.location.origin);
      
      window.close();
      return;
    }

    // If no access token or error, redirect to dashboard with error
    toast.error('Google Calendar connection failed');
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connecting your Google Calendar...</p>
      </div>
    </div>
  );
};

export default CalendarCallback;
