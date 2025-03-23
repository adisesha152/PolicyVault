import { API_URL, ENDPOINTS, USE_MOCK_AUTH, apiRequest } from '../config/api';

export const AuthService = {
  async login(credentials) {
    if (USE_MOCK_AUTH) {
      // Mock authentication for development
      return new Promise((resolve) => {
        setTimeout(() => {
          // For mock auth, set a dummy token
          localStorage.setItem('token', 'mock-jwt-token');
          resolve({
            token: 'mock-jwt-token',
            user: {
              id: 'user-1',
              name: credentials.email.split('@')[0],
              email: credentials.email
            }
          });
        }, 500);
      });
    }
    
    try {
      const result = await apiRequest(ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      
      if (!result.ok) {
        throw new Error(result.error?.message || 'Login failed');
      }
      
      // Ensure the user data has id/userId
      const responseData = result.data;
      
      // Store the token in localStorage
      localStorage.setItem('token', responseData.token);
      
      console.log('Login response:', responseData);
      
      // Make sure user data includes userId for later reference
      if (responseData.user && !responseData.user.id && !responseData.user._id) {
        responseData.user.id = responseData.userId || 'user-default';
      }
      
      return responseData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async register(userData) {
    if (USE_MOCK_AUTH) {
      // Mock registration for development
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 500);
      });
    }
    
    try {
      const result = await apiRequest(ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      if (!result.ok) {
        throw new Error(result.error?.message || 'Registration failed');
      }
      
      return result.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  async forgotPassword(email) {
    if (USE_MOCK_AUTH) {
      // Mock password reset for development
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 500);
      });
    }
    
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Password reset request failed');
      }
      
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  async getUserProfile() {
    if (USE_MOCK_AUTH) {
      // Mock user profile for development
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: 'user-1',
            name: 'Demo User',
            email: 'demo@example.com'
          });
        }, 200);
      });
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token for user profile request:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // The endpoint should be /api/user/profile instead of /user/profile
      const result = await apiRequest(ENDPOINTS.USER_PROFILE);
      
      if (!result.ok) {
        // If the server returns an error, fall back to mock data during development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using fallback mock data for user profile');
          return {
            id: 'fallback-user',
            name: 'Fallback User',
            email: 'fallback@example.com'
          };
        }
        throw new Error(result.error?.message || 'Failed to fetch user profile');
      }
      
      return result.data;
    } catch (error) {
      console.error('Get user profile error:', error);
      // In development, return fallback data instead of throwing to keep the app running
      if (process.env.NODE_ENV === 'development') {
        return {
          id: 'fallback-user',
          name: 'Fallback User',
          email: 'fallback@example.com'
        };
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
  
  getToken() {
    return localStorage.getItem('token');
  }
};
