import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { AuthProvider } from '../contexts/AuthContext';
import * as api from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
  predictionsAPI: {
    getFlareupRisk: jest.fn(),
    getDailyForecast: jest.fn(),
    getHistory: jest.fn(),
    getRiskFactors: jest.fn(),
  },
  airQualityAPI: {
    getCurrent: jest.fn(),
    getHistory: jest.fn(),
    getForecast: jest.fn(),
  },
  paymentsAPI: {
    getUsageStats: jest.fn(),
    getPlans: jest.fn(),
    createSubscription: jest.fn(),
    getCurrentSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
  },
  coachingAPI: {
    getDailyBriefing: jest.fn(),
    voiceQuery: jest.fn(),
    getEducationSnippet: jest.fn(),
    getSessions: jest.fn(),
    provideFeedback: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));


const mockDashboardData = {
  daily_risk: {
    risk_score: 65,
    risk_level: 'moderate',
    primary_factors: ['High pollen count', 'Poor air quality'],
  },
  air_quality: {
    aqi: 85,
    quality: 'Moderate',
    primary_pollutant: 'PM2.5',
  },
  subscription: {
    tier: 'free',
    usage: {
      predictions_used: 3,
      predictions_limit: 5,
      coaching_sessions_used: 7,
      coaching_sessions_limit: 10,
    },
  },
};

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API calls
    (mockedApi.predictionsAPI.getFlareupRisk as jest.Mock).mockResolvedValue({
      data: mockDashboardData.daily_risk,
    });
    
    (mockedApi.airQualityAPI.getCurrent as jest.Mock).mockResolvedValue({
      data: mockDashboardData.air_quality,
    });
    
    (mockedApi.paymentsAPI.getUsageStats as jest.Mock).mockResolvedValue({
      data: mockDashboardData.subscription,
    });
    
    (mockedApi.coachingAPI.getDailyBriefing as jest.Mock).mockResolvedValue({
      data: {
        briefing: 'Today is a moderate risk day for asthma flareups.',
        recommendations: ['Use air purifier', 'Take preventive medication'],
      },
    });
  });

  test('renders dashboard with loading state initially', () => {
    renderDashboard();
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('displays risk score and level', async () => {
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('65')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/moderate/i)).toBeInTheDocument();
    });
  });

  test('displays air quality information', async () => {
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/moderate/i)).toBeInTheDocument();
    });
  });

  test('displays subscription usage', async () => {
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('3 / 5')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('7 / 10')).toBeInTheDocument();
    });
  });

  test('displays navigation links', async () => {
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('View Forecast')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Manage Devices')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    (mockedApi.predictionsAPI.getFlareupRisk as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });
});
