import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Calendar, DollarSign, Users, X, Link, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PolicyDetail = ({ policy, nominees, onClose }) => {
  // Format dates for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Calculate time remaining
  const calculateTimeRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    
    if (diffTime <= 0) return 'Expired';
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    } else {
      return `${months} month${months !== 1 ? 's' : ''} ${diffDays % 30} day${diffDays % 30 !== 1 ? 's' : ''}`;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <div className="relative">
        <div className={`h-2 w-full ${policy.status === 'Active' ? 'bg-green-500' : policy.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
        
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-insurance-50">
                <Shield className="h-8 w-8 text-insurance-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{policy.name}</h2>
                <p className="text-gray-600">{policy.company}</p>
              </div>
            </div>
            <Badge variant="outline" className={`
              px-3 py-1 text-sm
              ${policy.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                policy.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                'bg-red-50 text-red-700 border-red-200'}
            `}>
              {policy.status}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Policy ID */}
          <div className="mb-6 text-sm text-gray-500">
            <span>Policy ID: </span>
            <span className="font-medium text-gray-700">{policy._id || policy.id}</span>
          </div>
          
          {/* Summary */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-insurance-600" />
                <h3 className="text-lg font-semibold text-gray-900">Coverage Details</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sum Assured:</span>
                  <span className="font-semibold">${policy.value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Premium:</span>
                  <span className="font-semibold">${policy.premium.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Premium:</span>
                  <span className="font-semibold">${(policy.premium * 12).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-insurance-600" />
                <h3 className="text-lg font-semibold text-gray-900">Policy Timeline</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-semibold">{formatDate(policy.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-semibold">{formatDate(policy.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Remaining:</span>
                  <span className="font-semibold">{calculateTimeRemaining(policy.endDate)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Nominees */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-insurance-600" />
                <h3 className="text-lg font-semibold text-gray-900">Nominees</h3>
              </div>
              <Badge variant="outline" className="px-2 py-1">
                {nominees.length} Nominee{nominees.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            {nominees.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {nominees.map((nominee) => (
                  <div key={nominee._id || nominee.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{nominee.name}</p>
                      <p className="text-sm text-gray-500">{nominee.relationship} • {nominee.email}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`px-2 py-1 ${nominee.verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                    >
                      {nominee.verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-md">
                No nominees added to this policy yet.
              </p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              variant="default"
              className="bg-insurance-600 hover:bg-insurance-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PolicyDetail;
