import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/AuthService';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = AuthService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          try {
            // Fetch user data from backend
            const userData = await AuthService.getUserProfile();
            setUser(userData);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // Fallback to a basic user object
            setUser({ name: 'User', id: 'default-user' });
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const userData = await AuthService.login(credentials);
      
      setIsAuthenticated(true);
      
      // Ensure we capture the MongoDB _id from the response
      const userProfile = {
        ...userData.user,
        id: userData.user._id || userData.user.id || userData.userId
      };
      
      console.log('Setting user profile after login:', userProfile);
      setUser(userProfile);
      return true;
    } catch (error) {
      console.error('Login error in context:', error);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      await AuthService.register(userData);
      toast.success('Registration successful! Please log in.');
      return true;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.info('You have been logged out');
  };

  // Add a method to get the authentication token
  const getToken = () => {
    return AuthService.getToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
