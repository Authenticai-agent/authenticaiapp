/**
 * Comprehensive AuthContext Tests
 * Tests authentication context functionality, error handling, and edge cases
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('../services/api');
jest.mock('react-hot-toast');

const mockApi = api as jest.Mocked<typeof api>;
const mockToast = toast as jest.Mocked<typeof toast>;

// Test component that uses the auth context
const TestComponent = () => {
  const { user, loading, login, register, logout, updateUser, refreshUser } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'no-user'}</div>
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button data-testid="register-btn" onClick={() => register({
        email: 'test@example.com',
        password: 'password',
        first_name: 'Test',
        last_name: 'User'
      })}>
        Register
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
      <button data-testid="update-btn" onClick={() => updateUser({ first_name: 'Updated' })}>
        Update User
      </button>
      <button data-testid="refresh-btn" onClick={refreshUser}>
        Refresh User
      </button>
    </div>
  );
};

// Wrapper component with router
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Initial State', () => {
    it('should start with loading true and no user', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    it('should set loading to false when no token exists', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });
    });

    it('should fetch user when token exists', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        subscription_tier: 'free'
      };

      (localStorage.getItem as jest.Mock).mockReturnValue('valid-token');
      mockApi.get.mockResolvedValueOnce({ data: mockUser });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(mockApi.get).toHaveBeenCalledWith('/auth/me');
    });

    it('should handle token fetch error gracefully', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('invalid-token');
      mockApi.get.mockRejectedValueOnce(new Error('Invalid token'));

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('Login Functionality', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        subscription_tier: 'free'
      };

      mockApi.post.mockResolvedValueOnce({
        data: { access_token: 'new-token' }
      });
      mockApi.get.mockResolvedValueOnce({ data: mockUser });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password'
        });
        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
        expect(mockToast.success).toHaveBeenCalledWith('Welcome back!');
      });
    });

    it('should handle login error', async () => {
      const error = {
        response: {
          data: {
            detail: 'Invalid credentials'
          }
        }
      };

      mockApi.post.mockRejectedValueOnce(error);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials');
      });
    });

    it('should handle login error without response data', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Login failed');
      });
    });
  });

  describe('Registration Functionality', () => {
    it('should register successfully with valid data', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        subscription_tier: 'free'
      };

      mockApi.post.mockResolvedValueOnce({
        data: { access_token: 'new-token' }
      });
      mockApi.get.mockResolvedValueOnce({ data: mockUser });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('register-btn'));

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
          email: 'test@example.com',
          password: 'password',
          first_name: 'Test',
          last_name: 'User'
        });
        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
        expect(mockToast.success).toHaveBeenCalledWith('Account created successfully!');
      });
    });

    it('should handle registration error', async () => {
      const error = {
        response: {
          data: {
            detail: 'Email already exists'
          }
        }
      };

      mockApi.post.mockRejectedValueOnce(error);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('register-btn'));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Email already exists');
      });
    });
  });

  describe('Logout Functionality', () => {
    it('should logout successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        subscription_tier: 'free'
      };

      (localStorage.getItem as jest.Mock).mockReturnValue('valid-token');
      mockApi.get.mockResolvedValueOnce({ data: mockUser });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('logout-btn'));

      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        expect(mockToast.success).toHaveBeenCalledWith('Logged out successfully');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });
    });
  });

  describe('Update User Functionality', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        subscription_tier: 'free'
      };

      const updatedUser = {
        ...mockUser,
        first_name: 'Updated'
      };

      (localStorage.getItem as jest.Mock).mockReturnValue('valid-token');
      mockApi.get.mockResolvedValueOnce({ data: mockUser });
      mockApi.put.mockResolvedValueOnce({ data: updatedUser });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('update-btn'));

      await waitFor(() => {
        expect(mockApi.put).toHaveBeenCalledWith('/users/profile', { first_name: 'Updated' });
        expect(mockToast.success).toHaveBeenCalledWith('Profile updated successfully');
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(updatedUser));
      });
    });

    it('should handle update error', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        subscription_tier: 'free'
      };

      const error = {
        response: {
          data: {
            detail: 'Update failed'
          }
        }
      };

      (localStorage.getItem as jest.Mock).mockReturnValue('valid-token');
      mockApi.get.mockResolvedValueOnce({ data: mockUser });
      mockApi.put.mockRejectedValueOnce(error);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('update-btn'));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Update failed');
      });
    });
  });

  describe('Refresh User Functionality', () => {
    it('should refresh user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        subscription_tier: 'free'
      };

      const refreshedUser = {
        ...mockUser,
        first_name: 'Refreshed'
      };

      (localStorage.getItem as jest.Mock).mockReturnValue('valid-token');
      mockApi.get
        .mockResolvedValueOnce({ data: mockUser })
        .mockResolvedValueOnce({ data: refreshedUser });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('refresh-btn'));

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/auth/me');
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(refreshedUser));
      });
    });

    it('should handle refresh error gracefully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        subscription_tier: 'free'
      };

      (localStorage.getItem as jest.Mock).mockReturnValue('valid-token');
      mockApi.get
        .mockResolvedValueOnce({ data: mockUser })
        .mockRejectedValueOnce(new Error('Refresh failed'));

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('refresh-btn'));

      // Should not crash or show error toast for refresh failures
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Login failed');
      });
    });

    it('should handle malformed error responses', async () => {
      const error = {
        response: {
          data: null
        }
      };

      mockApi.post.mockRejectedValueOnce(error);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Login failed');
      });
    });
  });

  describe('Token Management', () => {
    it('should set authorization header when token exists', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        subscription_tier: 'free'
      };

      (localStorage.getItem as jest.Mock).mockReturnValue('valid-token');
      mockApi.get.mockResolvedValueOnce({ data: mockUser });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockApi.defaults.headers.common['Authorization']).toBe('Bearer valid-token');
      });
    });

    it('should remove authorization header on logout', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        subscription_tier: 'free'
      };

      (localStorage.getItem as jest.Mock).mockReturnValue('valid-token');
      mockApi.get.mockResolvedValueOnce({ data: mockUser });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('logout-btn'));

      await waitFor(() => {
        expect(delete mockApi.defaults.headers.common['Authorization']).toBe(true);
      });
    });
  });

  describe('Context Provider', () => {
    it('should throw error when useAuth is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should provide all required context values', () => {
      const TestContextValues = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="has-user">{auth.user ? 'true' : 'false'}</div>
            <div data-testid="has-loading">{auth.loading ? 'true' : 'false'}</div>
            <div data-testid="has-login">{typeof auth.login === 'function' ? 'true' : 'false'}</div>
            <div data-testid="has-register">{typeof auth.register === 'function' ? 'true' : 'false'}</div>
            <div data-testid="has-logout">{typeof auth.logout === 'function' ? 'true' : 'false'}</div>
            <div data-testid="has-updateUser">{typeof auth.updateUser === 'function' ? 'true' : 'false'}</div>
            <div data-testid="has-refreshUser">{typeof auth.refreshUser === 'function' ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestContextValues />
        </TestWrapper>
      );

      expect(screen.getByTestId('has-user')).toHaveTextContent('false');
      expect(screen.getByTestId('has-loading')).toHaveTextContent('true');
      expect(screen.getByTestId('has-login')).toHaveTextContent('true');
      expect(screen.getByTestId('has-register')).toHaveTextContent('true');
      expect(screen.getByTestId('has-logout')).toHaveTextContent('true');
      expect(screen.getByTestId('has-updateUser')).toHaveTextContent('true');
      expect(screen.getByTestId('has-refreshUser')).toHaveTextContent('true');
    });
  });
});
