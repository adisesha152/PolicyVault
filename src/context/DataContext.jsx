import React, { createContext, useContext, useState, useEffect } from 'react';
import { PolicyService } from '../services/PolicyService';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { isAuthenticated, user, getToken } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add a flag to track if data has been loaded
  const [dataLoaded, setDataLoaded] = useState(false);

  // Add fallback data for development
  const provideFallbackData = () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using fallback mock data for policies and nominees');
      setPolicies([
        {
          id: 'fallback-pol-1',
          name: 'Fallback Policy',
          company: 'Demo Insurance',
          value: 100000,
          premium: 50,
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString(),
          status: 'Active'
        }
      ]);
      setNominees([]);
      setLoading(false);
      setError(null);
    }
  };

  // Load data when user is authenticated
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) {
        setPolicies([]);
        setNominees([]);
        setLoading(false);
        setDataLoaded(false);
        return;
      }

      const token = getToken();
      console.log('Loading data with token:', token ? 'Token exists' : 'No token');
      console.log('User context data:', user);

      setLoading(true);
      try {
        // Fetch policies and nominees directly from the API
        const fetchedPolicies = await PolicyService.getAllPolicies();
        const fetchedNominees = await PolicyService.getAllNominees();
        
        console.log('Fetched policies:', fetchedPolicies);
        console.log('Fetched nominees:', fetchedNominees);
        
        // Normalize all policies to have consistent id field
        const normalizedPolicies = fetchedPolicies.map(policy => ({
          ...policy,
          id: policy._id || policy.id
        }));
        
        // Normalize all nominees to have consistent id and policyId fields
        const normalizedNominees = fetchedNominees.map(nominee => ({
          ...nominee,
          id: nominee._id || nominee.id,
          // Ensure policyId is correctly referenced
          policyId: nominee.policyId // Keep the MongoDB ObjectId format
        }));
        
        setPolicies(normalizedPolicies);
        setNominees(normalizedNominees);
        setError(null);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again.');
        toast.error('Failed to load data');
        provideFallbackData();
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Force refresh data every 30 seconds if authenticated
    let interval;
    if (isAuthenticated) {
      interval = setInterval(() => {
        console.log('Refreshing data...');
        loadData();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, user?.id, getToken]);

  // Get ID to use with backend (handles both id and _id cases)
  const getIdForBackend = (item) => {
    return item._id || item.id;
  };

  // Policy methods
  const addPolicy = async (policy) => {
    try {
      const savedPolicy = await PolicyService.addPolicy(policy);
      console.log('Policy saved to backend:', savedPolicy);
      setPolicies(prev => [...prev, savedPolicy]);
      return savedPolicy;
    } catch (error) {
      console.error('Error adding policy:', error);
      throw error;
    }
  };

  const updatePolicy = async (policyId, updatedPolicy) => {
    try {
      const result = await PolicyService.updatePolicy(policyId, updatedPolicy);
      setPolicies(prev => 
        prev.map(policy => (policy.id === policyId || policy._id === policyId) ? result : policy)
      );
      return result;
    } catch (error) {
      console.error('Error updating policy:', error);
      throw error;
    }
  };

  const deletePolicy = async (policyId) => {
    try {
      await PolicyService.deletePolicy(policyId);
      setPolicies(prev => prev.filter(policy => policy.id !== policyId && policy._id !== policyId));
      // Also delete any nominees associated with this policy
      setNominees(prev => prev.filter(nominee => 
        nominee.policyId !== policyId && nominee.policyId !== policyId
      ));
      return true;
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw error;
    }
  };

  // Nominee methods
  const addNominee = async (nominee) => {
    try {
      const savedNominee = await PolicyService.addNominee(nominee);
      console.log('Nominee saved to backend:', savedNominee);
      setNominees(prev => [...prev, savedNominee]);
      return savedNominee;
    } catch (error) {
      console.error('Error adding nominee:', error);
      throw error;
    }
  };

  const updateNominee = async (nomineeId, updatedNominee) => {
    try {
      const result = await PolicyService.updateNominee(nomineeId, updatedNominee);
      setNominees(prev => 
        prev.map(nominee => nominee.id === nomineeId ? result : nominee)
      );
      return result;
    } catch (error) {
      console.error('Error updating nominee:', error);
      throw error;
    }
  };

  const deleteNominee = async (nomineeId) => {
    try {
      await PolicyService.deleteNominee(nomineeId);
      setNominees(prev => prev.filter(nominee => nominee.id !== nomineeId));
      return true;
    } catch (error) {
      console.error('Error deleting nominee:', error);
      throw error;
    }
  };

  // Verify a nominee
  const verifyNominee = async (nomineeId) => {
    try {
      const updatedNominee = await PolicyService.verifyNominee(nomineeId);
      setNominees(prev => 
        prev.map(nominee => nominee._id === nomineeId ? updatedNominee : nominee)
      );
      return updatedNominee;
    } catch (error) {
      console.error('Error verifying nominee:', error);
      throw error;
    }
  };

  // Get nominees for a specific policy - handle both id formats
  const getNomineesByPolicyId = (policyId) => {
    // Cast all to string for comparison since ObjectId will be in string format
    const policyIdStr = String(policyId);
    return nominees.filter(nominee => 
      String(nominee.policyId) === policyIdStr
    );
  };

  // Get policy by ID - handle both id formats
  const getPolicyById = (policyId) => {
    // Cast all to string for comparison since ObjectId will be in string format
    const policyIdStr = String(policyId);
    return policies.find(policy => 
      String(policy.id) === policyIdStr || String(policy._id) === policyIdStr
    );
  };

  return (
    <DataContext.Provider
      value={{
        policies,
        nominees,
        loading,
        error,
        addPolicy,
        updatePolicy,
        deletePolicy,
        addNominee,
        updateNominee,
        deleteNominee,
        verifyNominee,
        getNomineesByPolicyId,
        getPolicyById
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
