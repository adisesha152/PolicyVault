import { apiRequest, ENDPOINTS, USE_MOCK_AUTH } from '../config/api';

/**
 * Service for backend operations and data synchronization
 */
export const BackendService = {
  /**
   * Get user data with related policies and nominees
   */
  async getUserData() {
    try {
      // Get user's policies
      const policiesResult = await apiRequest(ENDPOINTS.POLICIES);
      
      // Get user's nominees
      const nomineesResult = await apiRequest(ENDPOINTS.NOMINEES);
      
      return {
        policies: policiesResult.data || [],
        nominees: nomineesResult.data || []
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Return empty arrays to prevent UI errors
      return { policies: [], nominees: [] };
    }
  }
};
