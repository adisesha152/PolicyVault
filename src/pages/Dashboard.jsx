import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import NavbarDashboard from '../components/NavbarDashboard';
import Footer from '../components/Footer';
import PolicyCard from '../components/PolicyCard';
import NomineeCard from '../components/NomineeCard';
import PolicyForm from '../components/PolicyForm';
import NomineeForm from '../components/NomineeForm';
import { PolicyBarChart, PolicyPieChart } from '../components/AnalyticsChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Shield, Users, Bell, AlertTriangle, Plus, 
  Search, Filter, UserPlus, FileText
} from 'lucide-react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PolicyDetail from '../components/PolicyDetail';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Add default values for destructuring to prevent errors
  const { 
    policies = [], 
    nominees = [], 
    loading: isLoading = true,
    error = null,
    addPolicy = () => {},
    addNominee = () => {},
    verifyNominee = () => {}
  } = useData() || {};
  
  const navigate = useNavigate();
  const [isPolicyFormOpen, setIsPolicyFormOpen] = useState(false);
  const [isNomineeFormOpen, setIsNomineeFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('policies');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Analytics data generation
  const generateAnalyticsData = () => {
    // Group policies by name for bar chart (value)
    const policyValueMap = {};
    policies.forEach(policy => {
      if (!policyValueMap[policy.name]) {
        policyValueMap[policy.name] = 0;
      }
      policyValueMap[policy.name] += policy.value;
    });
    
    // Group policies by name for pie chart (count)
    const policyCountMap = {};
    policies.forEach(policy => {
      if (!policyCountMap[policy.name]) {
        policyCountMap[policy.name] = 0;
      }
      policyCountMap[policy.name] += 1;
    });
    
    const barData = Object.entries(policyValueMap).map(([name, value]) => ({ name, value }));
    const pieData = Object.entries(policyCountMap).map(([name, value]) => ({ name, value }));
    
    return { barData, pieData };
  };

  const { barData, pieData } = generateAnalyticsData();

  // Summary calculations
  const totalPolicies = policies.length;
  const activePolicies = policies.filter(p => p.status === 'Active').length;
  const totalNominees = nominees.length;
  const totalCoverage = policies.reduce((sum, policy) => sum + policy.value, 0);
  
  // Check for pending actions
  const pendingActions = nominees.filter(n => !n.verified).length;

  const handleAddPolicy = () => {
    setIsPolicyFormOpen(true);
  };

  const handleAddNewPolicy = (newPolicy) => {
    addPolicy(newPolicy);
    setIsPolicyFormOpen(false);
  };

  const handleAddNominee = () => {
    if (policies.length === 0) {
      toast.error("Please add at least one policy before adding nominees");
      return;
    }
    setIsNomineeFormOpen(true);
  };

  const handleAddNewNominee = (newNominee) => {
    addNominee(newNominee);
    setIsNomineeFormOpen(false);
  };

  const handleVerifyNominee = (nomineeId) => {
    verifyNominee(nomineeId);
  };

  const handleViewDetails = (policyId) => {
    const policy = policies.find(p => p.id === policyId || p._id === policyId);
    if (policy) {
      setSelectedPolicy(policy);
    }
  };

  const handleCloseDetail = () => {
    setSelectedPolicy(null);
  };

  const getNomineesByPolicy = (policyId) => {
    return nominees.filter(n => 
      String(n.policyId) === String(policyId) || 
      String(n.policyId) === String(policyId)
    );
  };

  const getPolicyName = (policyId) => {
    const policy = policies.find(p => 
      String(p.id) === String(policyId) || 
      String(p._id) === String(policyId)
    );
    return policy ? policy.name : 'Unknown Policy';
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = 
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (policy.id && policy.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (policy._id && policy._id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter ? policy.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const filteredNominees = nominees.filter(nominee => {
    const matchesSearch = 
      nominee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nominee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (nominee.id && nominee.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (nominee._id && nominee._id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter ? 
      (statusFilter === 'Verified' && nominee.verified) ||
      (statusFilter === 'Pending' && !nominee.verified) 
      : true;
    
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return null; // Redirect happens in useEffect
  }

  // Display error message if data fetching failed
  if (error) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <NavbarDashboard />
        <main className="flex-grow bg-gray-50 pt-24 pb-16 px-4 flex items-center justify-center">
          <Card className="max-w-md p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-insurance-600 hover:bg-insurance-700 text-white"
            >
              Retry
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <NavbarDashboard />
      
      <main className="flex-grow bg-gray-50 pt-24 pb-16 px-4">
        <div className="container mx-auto">
          {/* Welcome Header */}
          <div className="mb-8 animate-fade-up">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to PolicyVault, {user ? user.name : 'User'}</h1>
            <p className="text-gray-600">A seamless way to manage and access your insurance policies</p>
          </div>
          
          {/* Quick Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 animate-fade-up">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Policies</p>
                  <p className="text-3xl font-bold text-gray-900">{totalPolicies}</p>
                </div>
                <div className="p-3 rounded-full bg-insurance-50">
                  <Shield className="h-6 w-6 text-insurance-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <span className="text-green-500 font-medium">{activePolicies} active</span> policies
              </div>
            </Card>
            
            <Card className="p-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Nominees</p>
                  <p className="text-3xl font-bold text-gray-900">{totalNominees}</p>
                </div>
                <div className="p-3 rounded-full bg-insurance-50">
                  <Users className="h-6 w-6 text-insurance-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <Button variant="link" className="text-xs p-0 h-auto text-blue-500 font-medium" onClick={handleAddNominee}>
                  Add more nominees
                </Button>
              </div>
            </Card>
            
            <Card className="p-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Coverage</p>
                  <p className="text-3xl font-bold text-gray-900">${totalCoverage.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-full bg-insurance-50">
                  <Shield className="h-6 w-6 text-insurance-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <span className="text-green-500 font-medium">Fully</span> protected
              </div>
            </Card>
            
            <Card className="p-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Notifications</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingActions}</p>
                </div>
                <div className="p-3 rounded-full bg-insurance-50">
                  <Bell className="h-6 w-6 text-insurance-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <span className="text-amber-500 font-medium">{pendingActions} pending</span> actions
              </div>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 hover:shadow-md transition-all cursor-pointer animate-fade-up" onClick={handleAddPolicy}>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-insurance-50">
                    <FileText className="h-5 w-5 text-insurance-600" />
                  </div>
                  <span className="font-medium">Add New Policy</span>
                </div>
              </Card>
              
              <Card 
                className="p-6 hover:shadow-md transition-all cursor-pointer animate-fade-up" 
                onClick={handleAddNominee}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-insurance-50">
                    <UserPlus className="h-5 w-5 text-insurance-600" />
                  </div>
                  <span className="font-medium">Add Nominee</span>
                </div>
              </Card>
              
              <Card 
                className="p-6 hover:shadow-md transition-all cursor-pointer animate-fade-up" 
                onClick={() => {
                  const unverifiedNominees = nominees.filter(n => !n.verified);
                  if (unverifiedNominees.length === 0) {
                    toast.info("All nominees are already verified");
                    return;
                  }
                  unverifiedNominees.forEach(nominee => {
                    handleVerifyNominee(nominee.id || nominee._id);
                  });
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-insurance-50">
                    <Users className="h-5 w-5 text-insurance-600" />
                  </div>
                  <span className="font-medium">Verify Nominees</span>
                </div>
              </Card>
            </div>
          </section>
          
          {/* Analytics Section */}
          {policies.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Policy Analytics</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 animate-fade-up">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Values</h3>
                  <PolicyBarChart data={barData} />
                </Card>
                
                <Card className="p-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Distribution</h3>
                  <PolicyPieChart data={pieData} />
                </Card>
              </div>
            </section>
          )}
          
          {/* Policies & Nominees Tabs */}
          <section>
            <div className="mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'policies'
                      ? 'border-b-2 border-insurance-600 text-insurance-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('policies')}
                >
                  Policies
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'nominees'
                      ? 'border-b-2 border-insurance-600 text-insurance-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('nominees')}
                >
                  Nominees
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'policies' ? 'Your Policies' : 'Your Nominees'}
              </h2>
              <Button 
                className="bg-insurance-600 hover:bg-insurance-700 text-white" 
                onClick={activeTab === 'policies' ? handleAddPolicy : handleAddNominee}
              >
                <Plus size={16} className="mr-2" /> 
                {activeTab === 'policies' ? 'Add New Policy' : 'Add New Nominee'}
              </Button>
            </div>
            
            {/* Search and Filters */}
            <Card className="p-4 mb-6 animate-fade-up">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="search"
                    placeholder={`Search ${activeTab}...`}
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button variant="outline" className="flex items-center">
                    <Filter size={16} className="mr-2" /> Filter
                  </Button>
                  
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All {activeTab === 'policies' ? 'Policies' : 'Nominees'}</option>
                    {activeTab === 'policies' ? (
                      <>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Renewal Due">Renewal Due</option>
                      </>
                    ) : (
                      <>
                        <option value="Verified">Verified</option>
                        <option value="Pending">Pending Verification</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </Card>
            
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading {activeTab}...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'policies' ? (
                  filteredPolicies.length > 0 ? (
                    filteredPolicies.map((policy) => (
                      <PolicyCard 
                        key={policy._id || policy.id} 
                        policy={policy} 
                        onViewDetails={handleViewDetails}
                      />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12 bg-white rounded-lg border border-gray-200 animate-fade-up">
                      <div className="mx-auto w-16 h-16 bg-insurance-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-insurance-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Policies Found</h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm || statusFilter 
                          ? "No policies match your search criteria. Try adjusting your filters."
                          : "You haven't added any insurance policies yet. Start by adding your first policy."}
                      </p>
                      <Button 
                        className="bg-insurance-600 hover:bg-insurance-700 text-white" 
                        onClick={handleAddPolicy}
                      >
                        <Plus size={16} className="mr-2" /> Add Your First Policy
                      </Button>
                    </div>
                  )
                ) : (
                  filteredNominees.length > 0 ? (
                    filteredNominees.map((nominee) => (
                      <NomineeCard 
                        key={nominee._id || nominee.id} 
                        nominee={nominee} 
                        onVerify={handleVerifyNominee}
                        getPolicyName={getPolicyName}
                      />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12 bg-white rounded-lg border border-gray-200 animate-fade-up">
                      <div className="mx-auto w-16 h-16 bg-insurance-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-insurance-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Nominees Found</h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm || statusFilter 
                          ? "No nominees match your search criteria. Try adjusting your filters."
                          : "You haven't added any nominees yet. Start by adding your first nominee."}
                      </p>
                      <Button 
                        className="bg-insurance-600 hover:bg-insurance-700 text-white" 
                        onClick={handleAddNominee}
                        disabled={policies.length === 0}
                      >
                        <Plus size={16} className="mr-2" /> Add Your First Nominee
                      </Button>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      
      {/* Modals */}
      <Dialog open={isPolicyFormOpen} onOpenChange={setIsPolicyFormOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">Add New Policy</DialogTitle>
          <DialogDescription className="sr-only">
            Form to add a new insurance policy to your account
          </DialogDescription>
          <PolicyForm 
            onClose={() => setIsPolicyFormOpen(false)} 
            onAddPolicy={handleAddNewPolicy}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isNomineeFormOpen} onOpenChange={setIsNomineeFormOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">Add New Nominee</DialogTitle>
          <DialogDescription className="sr-only">
            Form to add a new nominee to your insurance policy
          </DialogDescription>
          <NomineeForm 
            onClose={() => setIsNomineeFormOpen(false)} 
            onAddNominee={handleAddNewNominee}
            policies={policies}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!selectedPolicy} onOpenChange={handleCloseDetail}>
        <DialogContent className="sm:max-w-[700px] p-0 bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">Policy Details</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed information about your insurance policy
          </DialogDescription>
          {selectedPolicy && (
            <PolicyDetail 
              policy={selectedPolicy} 
              nominees={getNomineesByPolicy(selectedPolicy.id || selectedPolicy._id)}
              onClose={handleCloseDetail} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
