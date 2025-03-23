import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarPublic from '../components/NavbarPublic';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, AlertTriangle, Heart, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };
  
  return (
    <div id="home" className="min-h-screen flex flex-col page-transition mt-20">
      <NavbarPublic />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 mb-10 lg:mb-0 animate-fade-up">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Secure your family's financial future
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-xl">
                  Keep all your insurance policies in one place, manage nominees, and ensure your loved ones are protected.
                </p>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button 
                    onClick={handleGetStarted}
                    className="bg-insurance-600 hover:bg-insurance-700 text-white rounded-full px-8 py-6 h-auto text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-insurance-200 hover:bg-insurance-50 rounded-full px-8 py-6 h-auto text-lg"
                    onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                  >
                    How It Works
                  </Button>
                </div>
              </div>
              <div className="lg:w-1/2 animate-fade-in">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-insurance-100 rounded-full"></div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-insurance-100 rounded-full"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80" 
                    alt="Insurance management" 
                    className="relative rounded-lg shadow-xl w-full max-w-lg mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 animate-fade-up">
              <div className="inline-flex items-center space-x-2 bg-white rounded-full py-1 px-3 border border-insurance-100 mb-4">
                <span className="text-insurance-700 text-sm font-medium">Key Features</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to manage your policies</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                PolicyVault helps you organize all your insurance information in one secure place, making it accessible when you need it most.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 animate-fade-up">
                <div className="w-14 h-14 rounded-full bg-insurance-50 flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-insurance-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Policy Management</h3>
                <p className="text-gray-600">
                  Store all your insurance policies in one place with important details like coverage, premium, and renewal dates.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 animate-fade-up" style={{ animationDelay: '100ms' }}>
                <div className="w-14 h-14 rounded-full bg-insurance-50 flex items-center justify-center mb-6">
                  <User className="h-7 w-7 text-insurance-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Nominee Management</h3>
                <p className="text-gray-600">
                  Add and verify nominees for each policy, ensuring they know about their benefits and can easily claim them.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="w-14 h-14 rounded-full bg-insurance-50 flex items-center justify-center mb-6">
                  <Bell className="h-7 w-7 text-insurance-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Renewal Alerts</h3>
                <p className="text-gray-600">
                  Never miss a policy renewal with timely reminders and notifications for upcoming due dates.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-insurance-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 animate-fade-up">
              <div className="inline-flex items-center space-x-2 bg-white rounded-full py-1 px-3 border border-insurance-100 mb-4">
                <span className="text-insurance-700 text-sm font-medium">How It Works</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple Process, Powerful Protection</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform ensures your nominees are informed and protected through a simple, secure process.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative animate-fade-up">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-insurance-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  1
                </div>
                <div className="mb-6">
                  <Shield className="h-12 w-12 text-insurance-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Register Your Policies</h3>
                <p className="text-gray-600">
                  Securely add your insurance policies and upload relevant documents to your account.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative animate-fade-up" style={{ animationDelay: '100ms' }}>
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-insurance-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  2
                </div>
                <div className="mb-6">
                  <AlertTriangle className="h-12 w-12 text-insurance-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Add Nominee Information</h3>
                <p className="text-gray-600">
                  Designate nominees for each policy and provide their contact information for future notifications.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-insurance-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  3
                </div>
                <div className="mb-6">
                  <Heart className="h-12 w-12 text-insurance-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Rest Assured</h3>
                <p className="text-gray-600">
                  Our system automatically notifies your nominees when needed, ensuring they receive the benefits they deserve.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Button 
                className="bg-insurance-600 hover:bg-insurance-700 text-white rounded-full px-8 py-6 h-auto text-lg shadow-lg hover:shadow-xl transition-all animate-fade-up"
                style={{ animationDelay: '300ms' }}
                onClick={handleGetStarted}
              >
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* About section */}
        <section id="about" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 animate-fade-up">
              <div className="inline-flex items-center space-x-2 bg-insurance-50 rounded-full py-1 px-3 border border-insurance-100 mb-4">
                <span className="text-insurance-700 text-sm font-medium">About Us</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why We Created LifeInsure</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Born from a personal experience of unclaimed policies, we built a platform to ensure no family misses out on the financial protection they deserve.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 animate-fade-up">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 mb-4">
                  We founded LifeInsure after witnessing families struggle to identify and claim insurance policies after losing loved ones. Too often, policies go unclaimed because nominees are unaware they exist.
                </p>
                <p className="text-gray-600 mb-4">
                  Our mission is simple: to ensure that every insurance policy fulfills its purpose by connecting nominees with the financial protection they're entitled to during difficult times.
                </p>
                <p className="text-gray-600 mb-8">
                  Through secure technology and compassionate service, we help policyholders create a safety net that works exactly as intended—providing support precisely when it's needed most.
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-insurance-600">5K+</div>
                    <div className="text-sm text-gray-500">Policies Protected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-insurance-600">98%</div>
                    <div className="text-sm text-gray-500">Successful Claims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-insurance-600">24/7</div>
                    <div className="text-sm text-gray-500">Support</div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 animate-fade-up">
                <div className="relative rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-insurance-100 rounded-2xl relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                      alt="Family financial security" 
                      className="object-cover w-full h-full rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-insurance-900/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <p className="font-semibold text-xl">Protecting families' financial futures</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section id="pricing" className="py-16 bg-insurance-600">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="lg:max-w-2xl text-white animate-fade-up">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to secure your family's financial future?</h2>
                <p className="text-insurance-100 text-lg">
                  Join thousands of policyholders who trust PolicyVault to ensure their insurance protection reaches their loved ones.
                </p>
              </div>
              
              <Button 
                onClick={handleGetStarted}
                className="bg-white text-insurance-600 hover:bg-insurance-50 rounded-full px-8 py-6 h-auto text-lg shadow-lg hover:shadow-xl transition-all animate-fade-up"
              >
                Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Landing;
