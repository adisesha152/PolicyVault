import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { PolicyService } from '../services/PolicyService';
import { useAuth } from '../context/AuthContext'; // Fix the import path
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  relationship: z.string().min(2, "Relationship must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  policyId: z.string().min(1, "Please select a policy"),
});

const NomineeForm = ({ onClose, onAddNominee, policies }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth(); // Get the current user
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      relationship: "",
      email: "",
      phone: "",
      policyId: policies.length > 0 ? policies[0].id : "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      console.log('Selected policy ID:', data.policyId);
      
      // Create new nominee object with the policy ObjectId
      const newNominee = {
        name: data.name,
        relationship: data.relationship,
        email: data.email,
        phone: data.phone,
        policyId: data.policyId, // MongoDB ObjectId reference
        status: 'Active',
        verified: false,
      };
      
      console.log('Submitting nominee to backend:', newNominee);
      
      // Add nominee via API
      const savedNominee = await PolicyService.addNominee(newNominee);
      
      // Add nominee via callback for state update
      onAddNominee(savedNominee);
      toast.success(`Nominee ${data.name} added successfully`);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to add nominee. Please try again.');
      console.error('Nominee add error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto border-0 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-insurance-50">
            <UserPlus className="h-6 w-6 text-insurance-600" />
          </div>
          <h2 className="text-xl font-bold">Add New Nominee</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominee Name</FormLabel>
                  <FormControl>
                    <Input className="border-input focus:ring-0" placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input className="border-input focus:ring-0" placeholder="Spouse, Child, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input className="border-input focus:ring-0" type="email" placeholder="nominee@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input className="border-input focus:ring-0" placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="policyId"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Select Policy</FormLabel>
                  <FormControl>
                    <select 
                      className="flex h-10 w-full rounded-md border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      {policies.length > 0 ? (
                        policies.map(policy => {
                          // Use MongoDB's _id if available, otherwise use id
                          const policyId = policy._id || policy.id;
                          // Create a display version of the ID for clarity
                          const displayId = typeof policyId === 'string' && policyId.length > 8 
                            ? policyId.substring(0, 8) + '...' 
                            : policyId;
                            
                          return (
                            <option key={policyId} value={policyId}>
                              {policy.name} - {displayId}
                            </option>
                          );
                        })
                      ) : (
                        <option value="" disabled>No policies available</option>
                      )}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-insurance-600 hover:bg-insurance-700 text-white"
              disabled={isSubmitting || policies.length === 0}
            >
              {isSubmitting ? 'Adding...' : 'Add Nominee'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default NomineeForm;