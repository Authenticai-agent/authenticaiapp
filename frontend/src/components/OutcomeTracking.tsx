import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface OutcomeTrackingProps {
  onClose: () => void;
}

const OutcomeTracking: React.FC<OutcomeTrackingProps> = ({ onClose }) => {
  const [eventType, setEventType] = useState<'flare_up_prevented' | 'symptom_reduced' | 'medication_avoided'>('flare_up_prevented');
  const [preventionMethod, setPreventionMethod] = useState('');
  const [severityBefore, setSeverityBefore] = useState(5);
  const [severityAfter, setSeverityAfter] = useState(2);
  const [timeSaved, setTimeSaved] = useState(0);
  const [costSaved, setCostSaved] = useState(0);
  const [userNotes, setUserNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!preventionMethod.trim()) {
      toast.error('Please describe what helped prevent the issue');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/outcome-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          prevention_method: preventionMethod.trim(),
          severity_before: severityBefore,
          severity_after: severityAfter,
          time_saved_minutes: timeSaved,
          cost_saved_cents: costSaved * 100, // Convert to cents
          user_notes: userNotes.trim(),
          verified: false
        }),
      });

      if (response.ok) {
        toast.success('🎉 Thank you for sharing your success! This helps us improve our recommendations.');
        onClose();
      } else {
        throw new Error('Failed to submit outcome');
      }
    } catch (error) {
      console.error('Outcome tracking error:', error);
      toast.error('Failed to submit outcome. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventTypeIcon = () => {
    switch (eventType) {
      case 'flare_up_prevented': return '🛡️';
      case 'symptom_reduced': return '📉';
      case 'medication_avoided': return '💊';
      default: return '✅';
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {getEventTypeIcon()} Share Your Success Story
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What happened?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'flare_up_prevented', label: '🛡️ Prevented a flare-up', desc: 'I avoided a breathing problem' },
                  { value: 'symptom_reduced', label: '📉 Reduced symptoms', desc: 'I felt better after following advice' },
                  { value: 'medication_avoided', label: '💊 Avoided medication', desc: 'I didn\'t need my rescue inhaler' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setEventType(type.value as any)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                      eventType === type.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What helped you? *
              </label>
              <input
                type="text"
                value={preventionMethod}
                onChange={(e) => setPreventionMethod(e.target.value)}
                placeholder="e.g., Used air purifier, stayed indoors, took medication early"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                maxLength={255}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Before (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severityBefore}
                  onChange={(e) => setSeverityBefore(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{severityBefore}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity After (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severityAfter}
                  onChange={(e) => setSeverityAfter(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{severityAfter}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Saved (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={timeSaved}
                  onChange={(e) => setTimeSaved(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Saved ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={costSaved}
                  onChange={(e) => setCostSaved(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (optional)
              </label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Tell us more about what happened..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {userNotes.length}/500 characters
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !preventionMethod.trim()}
                className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                  isSubmitting || !preventionMethod.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Share Success'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OutcomeTracking;
