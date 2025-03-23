import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');

    try {
      const success = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (success) {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex md:flex-1 bg-insurance-600">
        <div className="flex flex-col justify-center items-center p-8 w-full">
          <Shield className="h-16 w-16 text-white mb-6" />
          <h1 className="text-3xl font-bold text-white mb-6">PolicyVault</h1>
          <p className="text-insurance-100 text-center max-w-md mb-8">
            Securely store and manage all your insurance policies in one place. Add nominees, track renewals, and access your policy details anytime, anywhere.
          </p>
          <div className="bg-insurance-700/30 p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Why register with PolicyVault?</h2>
            <ul className="space-y-2 text-insurance-100">
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                <span>Easy policy management in one dashboard</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                <span>Add and verify nominees for your policies</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                <span>Automatic renewal notifications</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                <span>Secure storage of policy documents</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center p-8 md:p-14 flex-1 md:max-w-md">
        <div className="mb-6 md:hidden flex items-center justify-center">
          <Shield className="h-10 w-10 text-insurance-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">PolicyVault</h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h2>
          <p className="text-gray-600">
            Already have an account? <Link to="/login" className="text-insurance-600 hover:text-insurance-700 font-medium">Sign in</Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" autoComplete="name" {...field} />
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
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-insurance-600 hover:bg-insurance-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        <p className="mt-6 text-xs text-gray-500 text-center">
          By registering, you agree to our <a href="#" className="text-insurance-600 hover:text-insurance-700">Terms of Service</a> and <a href="#" className="text-insurance-600 hover:text-insurance-700">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Register;
