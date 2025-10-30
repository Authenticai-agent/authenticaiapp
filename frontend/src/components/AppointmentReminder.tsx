import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Cloud, Wind, AlertCircle, X, Check } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
  requires_travel: boolean;
}

interface AppointmentReminderProps {
  userId: string;
  location: { lat: number; lon: number };
}

const AppointmentReminder: React.FC<AppointmentReminderProps> = ({ userId, location }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [recommendation, setRecommendation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    fetchUpcomingAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/calendar/upcoming-appointments/${userId}`);
      
      if (response.data.status === 'success') {
        const appts = response.data.appointments || [];
        // Filter out dismissed appointments
        const dismissedIds = JSON.parse(localStorage.getItem('dismissed_appointments') || '[]');
        const activeAppts = appts.filter((a: Appointment) => !dismissedIds.includes(a.id));
        setAppointments(activeAppts);
        
        // Auto-fetch recommendation for first appointment
        if (activeAppts.length > 0 && !selectedAppointment) {
          fetchRecommendation(activeAppts[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchRecommendation = async (appointment: Appointment) => {
    setLoading(true);
    setSelectedAppointment(appointment);
    
    try {
      // Fetch weather and air quality data
      const [weatherRes, airQualityRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/forecast/weather`, {
          params: { lat: location.lat, lon: location.lon }
        }),
        axios.get(`${API_BASE_URL}/air-quality/current`, {
          params: { lat: location.lat, lon: location.lon }
        })
      ]);

      // Generate recommendation
      const recommendationRes = await axios.post(`${API_BASE_URL}/calendar/appointment-recommendations`, {
        user_id: userId,
        appointment,
        weather_forecast: weatherRes.data,
        air_quality: airQualityRes.data
      });

      setRecommendation(recommendationRes.data.recommendation);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      setRecommendation('Unable to generate recommendation at this time.');
    } finally {
      setLoading(false);
    }
  };

  const dismissReminder = (appointmentId: string) => {
    const dismissedIds = JSON.parse(localStorage.getItem('dismissed_appointments') || '[]');
    dismissedIds.push(appointmentId);
    localStorage.setItem('dismissed_appointments', JSON.stringify(dismissedIds));
    
    setAppointments(appointments.filter(a => a.id !== appointmentId));
    setDismissed([...dismissed, appointmentId]);
    
    if (selectedAppointment?.id === appointmentId) {
      setSelectedAppointment(null);
      setRecommendation('');
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const isToday = date.toDateString() === now.toDateString();
      const isTomorrow = date.toDateString() === tomorrow.toDateString();
      
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      if (isToday) return `Today at ${timeStr}`;
      if (isTomorrow) return `Tomorrow at ${timeStr}`;
      
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return dateTimeStr;
    }
  };

  if (appointments.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Upcoming Appointments</h3>
            <p className="text-sm text-gray-600">Health-aware reminders for your schedule</p>
          </div>
        </div>
        {selectedAppointment && (
          <button
            onClick={() => dismissReminder(selectedAppointment.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Appointment List */}
      {appointments.length > 1 && (
        <div className="mb-4 space-y-2">
          {appointments.map((appt) => (
            <button
              key={appt.id}
              onClick={() => fetchRecommendation(appt)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedAppointment?.id === appt.id
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-white hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{appt.title}</p>
                  <p className="text-sm text-gray-600">{formatDateTime(appt.start_time)}</p>
                </div>
                {appt.requires_travel && (
                  <MapPin className="w-4 h-4 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected Appointment Details */}
      {selectedAppointment && (
        <div className="bg-white rounded-lg p-4 space-y-4">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">{selectedAppointment.title}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDateTime(selectedAppointment.start_time)}
              </div>
              {selectedAppointment.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedAppointment.location}
                </div>
              )}
            </div>
          </div>

          {/* AI Recommendation */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recommendation ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{recommendation}</ReactMarkdown>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => dismissReminder(selectedAppointment.id)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentReminder;
