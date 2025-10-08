import React, { useState } from 'react';
import { 
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface FAQItem {
  question: string;
  answer: string;
  category: 'getting-started' | 'features' | 'health' | 'privacy' | 'technical';
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    // Getting Started
    {
      question: "What is AuthentiCare and how does it work?",
      answer: "AuthentiCare is a wellness-focused air quality monitoring platform that helps you make informed decisions about outdoor activities based on real-time environmental data. We combine air quality measurements (PM2.5, ozone, pollen, etc.) with your personal health profile to provide personalized daily briefings and recommendations. The app uses data from trusted sources like OpenWeather, PurpleAir, and Pollen.com to give you accurate, location-specific insights.",
      category: 'getting-started'
    },
    {
      question: "How do I get started with the Daily Briefing?",
      answer: "Simply navigate to the 'Daily Briefing' tab in the navigation menu and click 'Generate'. The system will automatically use your current location to fetch real-time environmental data and create a personalized briefing. For the best experience, make sure to complete your health profile in Settings so we can tailor recommendations to your specific needs.",
      category: 'getting-started'
    },
    {
      question: "Do I need to create an account?",
      answer: "Yes, you need a free account to use AuthentiCare. The good news? It's completely free to sign up and use! Your free account includes personalized Daily Briefings, custom health profiles, location-based air quality data, and wellness recommendations. In the future, we'll introduce premium features with advanced analytics and forecasting, but the core app will always remain free.",
      category: 'getting-started'
    },
    {
      question: "How do I add a profile photo or avatar?",
      answer: "To add a profile photo:\n\n1. Click on the user icon in the top-right corner of the navigation bar\n2. Select 'Profile' from the dropdown menu\n3. On the Profile page, you'll see a circular avatar at the top\n4. Click on the avatar circle to open the avatar selector\n5. Choose from 5 preset emoji avatars (😊 🌟 🦋 🌸 💚) OR click 'Click to upload' to upload your own photo\n6. If uploading a photo, select an image file (max 2MB, any image format)\n7. Your avatar will update immediately\n8. Click 'Save Changes' at the bottom of the profile form to save your avatar\n\nYour avatar will then appear in the navigation bar on all pages!",
      category: 'getting-started'
    },

    // Features
    {
      question: "What information does the Daily Briefing include?",
      answer: "Each Daily Briefing includes: (1) Current environmental conditions with health effects for PM2.5, ozone, pollen, NO₂, and other pollutants, (2) Pollutant interactions and synergistic effects, (3) Personalized action plan based on your health profile and current conditions, (4) Wellness boost with nutrition, sleep, hydration, and exercise tips, (5) Longevity insights and health impact information. The briefing is unique every day and adapts to real-time conditions.",
      category: 'features'
    },
    {
      question: "How often is the data updated?",
      answer: "Environmental data is fetched in real-time when you generate a briefing. Air quality data updates every hour, pollen data updates daily, and weather data updates every 10 minutes. We recommend generating a new briefing each morning and whenever conditions change significantly (e.g., after rain, during high pollution alerts).",
      category: 'features'
    },
    {
      question: "Can I use the app in different locations?",
      answer: "Yes! The app automatically detects your location and provides location-specific data. You can also manually search for any location using the search bar in the Air Quality tab - just type a city name or address, and the Daily Briefing will instantly update with data for that location. You can also change your default location in Settings. The Daily Briefing adapts to each location's unique environmental conditions, so you'll get accurate information whether you're at home, traveling, or anywhere in the world.",
      category: 'features'
    },
    {
      question: "What are pollutant interactions?",
      answer: "Pollutant interactions occur when multiple environmental factors combine to create worse health effects than each factor alone. For example, high ozone + heat creates photochemical smog that's more harmful than either condition separately. Our system identifies 18+ interaction types including PM2.5+Ozone, Humidity+Pollen, UV+Ozone, and more, explaining the combined health effects and providing specific guidance.",
      category: 'features'
    },

    // Health & Medical
    {
      question: "Is this medical advice?",
      answer: "NO. AuthentiCare is a wellness and informational tool, NOT a medical device or medical advice service. All information provided is for general wellness purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with your healthcare provider before making any decisions about your health, medications, or treatment plans. If you're experiencing a medical emergency, call 911 or your local emergency services immediately.",
      category: 'health'
    },
    {
      question: "Can I use this app if I have asthma or allergies?",
      answer: "Yes, the app can provide helpful environmental awareness for people with asthma or allergies, but it is NOT a substitute for your asthma action plan or medical treatment. Continue following your doctor's instructions and prescribed medications. Use our information as supplementary wellness guidance only. Never adjust your medications based solely on our recommendations - always consult your healthcare provider first.",
      category: 'health'
    },
    {
      question: "What should I do if I have symptoms?",
      answer: "If you're experiencing respiratory symptoms, chest tightness, difficulty breathing, or any concerning health issues: (1) Follow your doctor's prescribed asthma action plan if you have one, (2) Use your rescue inhaler if prescribed, (3) Seek immediate medical attention if symptoms are severe or worsening, (4) Call 911 for emergency symptoms. Our app provides environmental awareness but cannot diagnose or treat medical conditions.",
      category: 'health'
    },
    {
      question: "How accurate are the health effect descriptions?",
      answer: "Our health effect descriptions are based on peer-reviewed scientific research from WHO, EPA, CDC, and 13+ published studies. However, individual responses to environmental factors vary greatly. The information represents general population effects and may not apply to your specific situation. Some people are more sensitive, while others are less affected. Always listen to your body and consult healthcare professionals for personalized medical guidance.",
      category: 'health'
    },
    {
      question: "Can I rely on this for medication decisions?",
      answer: "Absolutely NOT. Never start, stop, or change any medications based on information from this app. All medication decisions must be made in consultation with your licensed healthcare provider. Our medication reminders (e.g., 'pre-medicate 30 minutes before exercise') are general wellness suggestions based on typical asthma management practices, not personalized medical advice for you specifically.",
      category: 'health'
    },

    // Privacy & Data
    {
      question: "What data do you collect?",
      answer: "We collect: (1) Location data (only when you use the app, to provide local environmental information), (2) Health profile information you voluntarily provide (asthma severity, triggers, age), (3) Usage data (features accessed, briefings generated), (4) Account information (email, name if you create an account). We do NOT sell your personal data. See our Privacy Policy for complete details.",
      category: 'privacy'
    },
    {
      question: "Is my health information private?",
      answer: "Yes. Your health profile is encrypted and stored securely using Supabase's enterprise-grade security (AES-256 encryption at rest, TLS 1.2+ in transit). We follow GDPR and CCPA compliance standards. You can view, export, or delete your data at any time from the Privacy Dashboard. We never share your personal health information with third parties without your explicit consent. See our SECURITY.md documentation for complete details.",
      category: 'privacy'
    },
    {
      question: "How do you use my location?",
      answer: "Your location is used solely to fetch relevant environmental data (air quality, pollen, weather) for your area. We don't track your movements or share your location with third parties. You can manually set your location in Settings if you prefer not to use automatic location detection.",
      category: 'privacy'
    },

    // Technical
    {
      question: "Why does the briefing say 'VERY UNHEALTHY' when PM2.5 is excellent?",
      answer: "Air quality is determined by multiple factors, not just PM2.5. You might see 'VERY UNHEALTHY' if ozone, pollen, or other pollutants are elevated even when PM2.5 is low. The briefing will specify which pollutant is causing the high risk (e.g., 'driven by Smog (Ozone)'). Always read the full conditions section to understand what's affecting air quality today.",
      category: 'technical'
    },
    {
      question: "What do the risk scores mean?",
      answer: "Risk scores (0-100) represent overall environmental risk based on all pollutants and weather factors: 0-25 = LOW (excellent conditions), 25-50 = MODERATE (some precautions recommended), 50-75 = HIGH (limit outdoor exposure), 75-100 = VERY HIGH (minimize outdoor activities). The score considers PM2.5, ozone, pollen, NO₂, humidity, temperature, and their interactions.",
      category: 'technical'
    },
    {
      question: "Why do I see different times (local vs UTC)?",
      answer: "All timestamps in the app are displayed in your local timezone for convenience. The 'Generated at' timestamp shows when the briefing was created in your local time. Environmental data timestamps may show the time when measurements were taken, also converted to your local timezone.",
      category: 'technical'
    },
    {
      question: "What if the app shows 'temporary data issues'?",
      answer: "This means we couldn't fetch real-time environmental data, usually due to API rate limits, network issues, or temporary service outages from our data providers. Try again in a few minutes. If the issue persists, check your internet connection or contact support.",
      category: 'technical'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: QuestionMarkCircleIcon },
    { id: 'getting-started', name: 'Getting Started', icon: InformationCircleIcon },
    { id: 'features', name: 'Features', icon: HeartIcon },
    { id: 'health', name: 'Health & Medical', icon: ExclamationTriangleIcon },
    { id: 'privacy', name: 'Privacy & Data', icon: ShieldCheckIcon },
    { id: 'technical', name: 'Technical', icon: InformationCircleIcon }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <QuestionMarkCircleIcon className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Everything you need to know about using AuthentiCare
          </p>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-r-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">
                Important: Not Medical Advice
              </h3>
              <p className="text-red-800 text-sm leading-relaxed">
                AuthentiCare is a <strong>wellness and informational tool only</strong>. It is NOT a medical device and does NOT provide medical advice, diagnosis, or treatment. All information is for general wellness purposes. Always consult with qualified healthcare professionals for medical decisions. In case of emergency, call 911 immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-left font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUpIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-blue-800 mb-4">
            Can't find the answer you're looking for? We're here to help!
          </p>
          <a
            href="mailto:jura@authenticai.ai"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
