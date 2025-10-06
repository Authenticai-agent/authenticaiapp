import React, { Suspense, lazy } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  unstable_HistoryRouter as HistoryRouter,
  type HistoryRouterProps
} from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import CookieConsent from './components/CookieConsent';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const AirQuality = lazy(() => import('./pages/AirQuality'));
const Predictions = lazy(() => import('./pages/Predictions'));
const PremiumDashboard = lazy(() => import('./pages/PremiumDashboard'));
const SmartHome = lazy(() => import('./pages/SmartHome'));
const Subscription = lazy(() => import('./pages/Subscription'));
const GamificationDashboard = lazy(() => import('./pages/GamificationDashboard'));
const HealthTracking = lazy(() => import('./pages/HealthTracking'));
const PrivacyDashboard = lazy(() => import('./pages/PrivacyDashboard'));
const Coaching = lazy(() => import('./pages/Coaching'));
const FAQ = lazy(() => import('./pages/FAQ'));
const ManageDonation = lazy(() => import('./pages/ManageDonation'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const HIPAANotice = lazy(() => import('./pages/HIPAANotice'));
const AcceptableUsePolicy = lazy(() => import('./pages/AcceptableUsePolicy'));
const SecurityPolicy = lazy(() => import('./pages/SecurityPolicy'));
const AccessibilityStatement = lazy(() => import('./pages/AccessibilityStatement'));
const APIMonitoring = lazy(() => import('./pages/APIMonitoring'));
const AirQualityGame = lazy(() => import('./pages/AirQualityGame'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Add cache control headers to prevent back button access after logout
  React.useEffect(() => {
    // Prevent caching of protected pages
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Suspense fallback={<LoadingSpinner fullScreen={true} />}>{children}</Suspense>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Suspense fallback={<LoadingSpinner fullScreen={true} />}>{children}</Suspense>;
}

// Define route configuration
const routes = [
  { 
    path: '/', 
    element: <ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute> 
  },
  {
    path: '/login',
    element: <PublicRoute><Login /></PublicRoute>
  },
  {
    path: '/register',
    element: <PublicRoute><Register /></PublicRoute>
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  },
  {
    path: '/profile',
    element: <ProtectedRoute><Profile /></ProtectedRoute>
  },
  {
    path: '/air-quality',
    element: <ProtectedRoute><AirQuality /></ProtectedRoute>
  },
  {
    path: '/predictions',
    element: <ProtectedRoute><Predictions /></ProtectedRoute>
  },
  {
    path: '/premium',
    element: <ProtectedRoute><PremiumDashboard /></ProtectedRoute>
  },
  {
    path: '/smart-home',
    element: <ProtectedRoute><SmartHome /></ProtectedRoute>
  },
  {
    path: '/subscription',
    element: <ProtectedRoute><Subscription /></ProtectedRoute>
  },
  {
    path: '/gamification',
    element: <ProtectedRoute><GamificationDashboard /></ProtectedRoute>
  },
  {
    path: '/health-tracking',
    element: <ProtectedRoute><HealthTracking /></ProtectedRoute>
  },
  {
    path: '/privacy',
    element: <ProtectedRoute><PrivacyDashboard /></ProtectedRoute>
  },
  {
    path: '/coaching',
    element: <ProtectedRoute><Coaching /></ProtectedRoute>
  },
  {
    path: '/faq',
    element: <FAQ />
  },
  {
    path: '/manage-donation',
    element: <ProtectedRoute><ManageDonation /></ProtectedRoute>
  },
  // Public policy pages
  {
    path: '/terms',
    element: <TermsOfService />
  },
  {
    path: '/privacy-policy',
    element: <PrivacyPolicy />
  },
  {
    path: '/cookie-policy',
    element: <CookiePolicy />
  },
  {
    path: '/refund-policy',
    element: <RefundPolicy />
  },
  {
    path: '/hipaa-notice',
    element: <HIPAANotice />
  },
  {
    path: '/acceptable-use',
    element: <AcceptableUsePolicy />
  },
  {
    path: '/security-policy',
    element: <SecurityPolicy />
  },
  {
    path: '/accessibility',
    element: <AccessibilityStatement />
  },
  {
    path: '/api-monitoring',
    element: <ProtectedRoute><APIMonitoring /></ProtectedRoute>
  },
  {
    path: '/air-quality-game',
    element: <AirQualityGame />
  },
  // Add a catch-all route for 404s
  { 
    path: '*', 
    element: <ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute> 
  }
];

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {user && <Navbar />}
      <main className={`flex-grow ${user ? 'pt-16' : ''}`}>
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
      
      <Footer />
      
      {/* Onboarding overlay - TEMPORARILY DISABLED */}
      {/* <OnboardingOverlay
        isVisible={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      /> */}
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

// Create a custom history object with proper typing
const history = createBrowserHistory() as unknown as HistoryRouterProps['history'];

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <LocationProvider>
          <HistoryRouter
            history={history}
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <Suspense fallback={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Loading application...</p>
                </div>
              </div>
            }>
              <AppContent />
              {/* Temporarily disabled feedback button to fix navigation */}
              {/* <FeedbackButton /> */}
            </Suspense>
            <CookieConsent />
          </HistoryRouter>
        </LocationProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
