import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import OutcomeTracking from './OutcomeTracking';

interface FeedbackButtonProps {
  className?: string;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOutcomeTracking, setShowOutcomeTracking] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'success' | 'confusion'>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in both title and description');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback_type: feedbackType,
          title: title.trim(),
          description: description.trim(),
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          device_info: {
            screen: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            platform: navigator.platform,
          }
        }),
      });

      if (response.ok) {
        toast.success('Thank you for your feedback! We\'ll review it soon.');
        setTitle('');
        setDescription('');
        setIsOpen(false);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeedbackIcon = () => {
    switch (feedbackType) {
      case 'bug': return '🐛';
      case 'feature': return '💡';
      case 'success': return '🎉';
      case 'confusion': return '❓';
      default: return '💬';
    }
  };

  const getFeedbackColor = () => {
    switch (feedbackType) {
      case 'bug': return 'bg-red-500 hover:bg-red-600';
      case 'feature': return 'bg-blue-500 hover:bg-blue-600';
      case 'success': return 'bg-green-500 hover:bg-green-600';
      case 'confusion': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (showOutcomeTracking) {
    return <OutcomeTracking onClose={() => setShowOutcomeTracking(false)} />;
  }

  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {getFeedbackIcon()} Share Your Feedback
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of feedback is this?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'bug', label: '🐛 Bug Report', desc: 'Something isn\'t working' },
                    { value: 'feature', label: '💡 Feature Request', desc: 'I have an idea' },
                    { value: 'success', label: '🎉 Success Story', desc: 'This helped me!' },
                    { value: 'confusion', label: '❓ Confusion', desc: 'I need help' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFeedbackType(type.value as any)}
                      className={`p-3 text-left rounded-lg border-2 transition-colors ${
                        feedbackType === type.value
                          ? 'border-blue-500 bg-blue-50'
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
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of your feedback"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more details..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={2000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {description.length}/2000 characters
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowOutcomeTracking(true);
                  }}
                  className="px-4 py-2 text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                  title="Share a success story"
                >
                  🎉 Success
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                    isSubmitting || !title.trim() || !description.trim()
                      ? 'bg-gray-300 cursor-not-allowed'
                      : getFeedbackColor()
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={`fixed bottom-6 right-6 ${getFeedbackColor()} text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 ${className}`}
      title="Share feedback, report bugs, or tell us about your success!"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>
  );
};

export default FeedbackButton;
