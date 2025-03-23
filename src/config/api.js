/**
 * API configuration for PolicyVault
 */

// Use relative URL for API requests - Vite will proxy these to the backend
// This leverages the proxy configuration in vite.config.ts
export const API_URL = '/api';

// Feature flag for using mock authentication
export const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true' || false;

// API Endpoints
export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  USER_PROFILE: '/user/profile', // Should match the server endpoint
  
  // Policy endpoints
  POLICIES: '/policies',
  POLICY_BY_ID: (id) => `/policies/${id}`,
  
  // Nominee endpoints
  NOMINEES: '/nominees',
  NOMINEE_BY_ID: (id) => `/nominees/${id}`,
  NOMINEES_BY_POLICY: (policyId) => `/policies/${policyId}/nominees`,
  VERIFY_NOMINEE: (id) => `/nominees/${id}/verify`,
};

// Request headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper function for API requests with proper error handling
export async function apiRequest(endpoint, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };
  
  const token = localStorage.getItem('token');
  console.log(`API Request to ${endpoint} - Auth Token: ${token ? 'exists' : 'missing'}`);
  
  try {
    // Use the configured API_URL (which will be handled by Vite's proxy)
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Log the response status to help with debugging
    console.log(`API Response from ${endpoint} - Status: ${response.status}`);
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }
      
      return { ok: true, data };
    } else {
      // Handle non-JSON responses (like HTML error pages)
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return { ok: true, data: text };
    }
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    return { ok: false, error };
  }
}

// Mock data for development when backend is not available
function getMockData(endpoint) {
  // Generate some random IDs
  const makeId = (prefix) => `${prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  // Mock policy data
  if (endpoint === ENDPOINTS.POLICIES) {
    return [
      {
        id: makeId('POL'),
        name: 'Term Life Insurance',
        company: 'Prudential Insurance',
        value: 250000,
        premium: 45,
        startDate: '2023-01-01',
        endDate: '2033-01-01',
        nominees: 2,
        status: 'Active',
      },
      {
        id: makeId('POL'),
        name: 'Health Insurance',
        company: 'Blue Cross',
        value: 100000,
        premium: 120,
        startDate: '2023-02-15',
        endDate: '2024-02-15',
        nominees: 1,
        status: 'Active',
      }
    ];
  }
  
  // Mock nominee data
  if (endpoint === ENDPOINTS.NOMINEES) {
    return [
      {
        id: makeId('NOM'),
        name: 'Sarah Johnson',
        relationship: 'Spouse',
        email: 'sarah@example.com',
        phone: '123-456-7890',
        policyId: 'POL-ABC123',
        status: 'Active',
        verified: true,
      },
      {
        id: makeId('NOM'),
        name: 'Michael Johnson',
        relationship: 'Child',
        email: 'michael@example.com',
        phone: '123-456-7891',
        policyId: 'POL-ABC123',
        status: 'Active',
        verified: false,
      }
    ];
  }
  
  // Default empty response
  return [];
}
