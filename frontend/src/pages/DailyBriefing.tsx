import React from 'react';
import { 
  NewspaperIcon,
  SparklesIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import DynamicDailyBriefing from '../components/DynamicDailyBriefing';
import LocationComparisonDemo from '../components/LocationComparisonDemo';

const DailyBriefing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <NewspaperIcon className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Daily Briefing
            </h1>
          </div>
          <p className="text-lg text-gray-600 ml-13">
            Your personalized health intelligence report — unique every day
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <SparklesIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Dynamic & Adaptive</h3>
            </div>
            <p className="text-sm text-gray-600">
              Every briefing is unique — adapts to live air quality and your personal health profile
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <AcademicCapIcon className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Science-Backed</h3>
            </div>
            <p className="text-sm text-gray-600">
              Based on WHO, EPA, CDC guidelines and 13+ peer-reviewed studies
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-gray-900">Actionable</h3>
            </div>
            <p className="text-sm text-gray-600">
              Specific recommendations with quantified benefits — know exactly what to do
            </p>
          </div>
        </div>

        {/* Main Briefing Component */}
        <DynamicDailyBriefing />

        {/* Location Comparison Demo */}
        <LocationComparisonDemo />

        {/* Educational Footer */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">
            📘 How Dynamic Briefings Work
          </h3>
          <div className="space-y-2 text-blue-50">
            <p>
              <strong>1. Live Data Integration:</strong> We pull real-time PM2.5, ozone, pollen, weather, and 35+ environmental factors from multiple APIs
            </p>
            <p>
              <strong>2. Personal Health Profiling:</strong> Your asthma severity, triggers, age, fitness goals, and preferences shape every recommendation
            </p>
            <p>
              <strong>3. Scientific Risk Calculation:</strong> WHO/EPA thresholds combined with synergistic effects (e.g., PM2.5 + ozone amplification)
            </p>
            <p>
              <strong>4. Adaptive Action Plans:</strong> Recommendations change based on primary risk driver — ozone days get different advice than pollen days
            </p>
            <p>
              <strong>5. Wellness Integration:</strong> Nutrition, sleep, and longevity tips tailored to today's conditions and your preferences
            </p>
          </div>
        </div>

        {/* What Makes This Unique */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🌟 What Makes This Different
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Traditional Air Quality Apps:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>❌ Generic "air quality is moderate" messages</li>
                <li>❌ Same advice for everyone</li>
                <li>❌ No health context or personalization</li>
                <li>❌ Static recommendations</li>
                <li>❌ No wellness integration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Authenticai Dynamic Briefings:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Specific pollutant levels with health impacts</li>
                <li>✅ Personalized to YOUR asthma & triggers</li>
                <li>✅ Adapts to your fitness goals & lifestyle</li>
                <li>✅ Changes daily with conditions</li>
                <li>✅ Holistic: exercise + nutrition + sleep + air quality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyBriefing;
