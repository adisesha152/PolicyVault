import { ENDPOINTS, apiRequest } from '../config/api';

export const PolicyService = {
  // Policy methods
  async getAllPolicies() {
    try {
      const token = localStorage.getItem('token');
      console.log('Getting all policies with token:', token ? 'Token exists' : 'No token');
      
      const result = await apiRequest(ENDPOINTS.POLICIES);
      
      if (!result.ok) {
        console.error('Error fetching policies:', result.error);
        throw new Error(result.error?.message || 'Failed to fetch policies');
      }
      
      // Normalize the data to use consistent id field
      const policies = Array.isArray(result.data) ? result.data.map(policy => ({
        ...policy,
        id: policy._id || policy.id // Ensure we always have an id field
      })) : [];
      
      console.log('Normalized policies:', policies);
      return policies;
    } catch (error) {
      console.error('Error fetching policies:', error);
      return [];
    }
  },
  
  async addPolicy(policy) {
    try {
      const result = await apiRequest(ENDPOINTS.POLICIES, {
        method: 'POST',
        body: JSON.stringify(policy)
      });
      
      if (!result.ok) {
        throw new Error(result.error?.message || 'Failed to add policy');
      }
      
      // Ensure the saved policy has a consistent id field
      const savedPolicy = result.data.policy;
      savedPolicy.id = savedPolicy._id || savedPolicy.id;
      
      return savedPolicy;
    } catch (error) {
      console.error('Error adding policy:', error);
      throw error;
    }
  },
  
  async updatePolicy(policyId, updatedPolicy) {
    try {
      // Use MongoDB's _id for the API request
      const mongoId = policyId.includes('_id') ? policyId : policyId;
      
      const result = await apiRequest(ENDPOINTS.POLICY_BY_ID(mongoId), {
        method: 'PUT',
        body: JSON.stringify(updatedPolicy)
      });
      
      if (!result.ok) {
        throw new Error(result.error?.message || 'Failed to update policy');
      }
      
      // Ensure the updated policy has a consistent id field
      const savedPolicy = result.data.policy;
      savedPolicy.id = savedPolicy._id || savedPolicy.id;
      
      return savedPolicy;
    } catch (error) {
      console.error('Error updating policy:', error);
      throw error;
    }
  },
  
  async deletePolicy(policyId) {
    try {
      // Use MongoDB's _id for the API request
      const mongoId = policyId.includes('_id') ? policyId : policyId;
      
      const result = await apiRequest(ENDPOINTS.POLICY_BY_ID(mongoId), {
        method: 'DELETE'
      });
      
      if (!result.ok) {
        throw new Error(result.error?.message || 'Failed to delete policy');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw error;
    }
  },
  
  // Nominee methods
  async getAllNominees() {
    try {
      const token = localStorage.getItem('token');
      console.log('Getting all nominees with token:', token ? 'Token exists' : 'No token');
      
      const result = await apiRequest(ENDPOINTS.NOMINEES);
      
      if (!result.ok) {
        console.error('Error fetching nominees:', result.error);
        throw new Error(result.error?.message || 'Failed to fetch nominees');
      }
      
      // Normalize the data to use consistent id field
      const nominees = Array.isArray(result.data) ? result.data.map(nominee => ({
        ...nominee,
        id: nominee._id || nominee.id // Ensure we always have an id field
      })) : [];
      
      console.log('Normalized nominees:', nominees);
      return nominees;
    } catch (error) {
      console.error('Error fetching nominees:', error);
      return [];
    }
  },
  
  async addNominee(nominee) {
    try {
      console.log("Sending nominee to backend:", nominee);
      
      const result = await apiRequest(ENDPOINTS.NOMINEES, {
        method: 'POST',
        body: JSON.stringify(nominee)
      });
      
      if (!result.ok) {
        const errorMsg = result.error?.message || 'Failed to add nominee';
        console.error('Error response from server:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Ensure the saved nominee has a consistent id field
      const savedNominee = result.data.nominee;
      
      // Make sure we have either id or _id
      if (savedNominee) {
        savedNominee.id = savedNominee._id || savedNominee.id;
      } else {
        console.error('Invalid response from server - no nominee data');
        throw new Error('Server returned invalid data');
      }
      
      return savedNominee;
    } catch (error) {
      console.error('Error adding nominee:', error);
      throw error;
    }
  },
  
  async updateNominee(nomineeId, updatedNominee) {
    try {
      const result = await apiRequest(ENDPOINTS.NOMINEE_BY_ID(nomineeId), {
        method: 'PUT',
        body: JSON.stringify(updatedNominee)
      });
      
      if (!result.ok) {
        throw new Error(result.error?.message || 'Failed to update nominee');
      }
      
      return result.data.nominee;
    } catch (error) {
      console.error('Error updating nominee:', error);
      throw error;
    }
  },
  
  async verifyNominee(nomineeId) {
    try {
      const result = await apiRequest(ENDPOINTS.VERIFY_NOMINEE(nomineeId), {
        method: 'PATCH'
      });
      
      if (!result.ok) {
        throw new Error(result.error?.message || 'Failed to verify nominee');
      }
      
      return result.data.nominee;
    } catch (error) {
      console.error('Error verifying nominee:', error);
      throw error;
    }
  },
  
  async deleteNominee(nomineeId) {
    try {
      const result = await apiRequest(ENDPOINTS.NOMINEE_BY_ID(nomineeId), {
        method: 'DELETE'
      });
      
      if (!result.ok) {
        throw new Error(result.error?.message || 'Failed to delete nominee');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting nominee:', error);
      throw error;
    }
  },
  
  // Get nominees by policy ID
  async getNomineesByPolicyId(policyId) {
    try {
      const result = await apiRequest(ENDPOINTS.NOMINEES_BY_POLICY(policyId));
      
      if (!result.ok) {
        console.error('Error fetching nominees for policy:', result.error);
        throw new Error(result.error?.message || 'Failed to fetch nominees for policy');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching nominees for policy:', error);
      return [];
    }
  }
};
