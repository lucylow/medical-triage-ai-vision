import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  Brain, 
  Shield, 
  Clock, 
  MapPin, 
  ArrowRight,
  Zap,
  Users,
  Lock,
  Building2,
  Bus
} from 'lucide-react';
import { sanFranciscoHealthcareStats } from '@/data/sanFranciscoHealthcareData';

const TriageAILanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-blue-600" />,
      title: "AI-Powered Assessment",
      description: "Advanced machine learning analyzes your symptoms and provides intelligent triage recommendations."
    },
    {
      icon: <Clock className="w-6 h-6 text-green-600" />,
      title: "24/7 Availability",
      description: "Get immediate medical guidance anytime, anywhere, without waiting for office hours."
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: "Privacy First",
      description: "Your health information is encrypted and secure. We never store personal medical data."
    },
    {
      icon: <MapPin className="w-6 h-6 text-orange-600" />,
      title: "Local Care Resources",
      description: "Find nearby healthcare facilities, urgent care centers, and emergency rooms."
    }
  ];

  const stats = [
    { number: "99.2%", label: "Accuracy Rate" },
    { number: "<2min", label: "Assessment Time" },
    { number: "24/7", label: "Availability" },
    { number: "100%", label: "Privacy Protected" }
  ];

  const handleStartTriage = () => {
    navigate('/triage-input');
  };

  const handleLearnMore = () => {
    // Scroll to features section or navigate to detailed info
    document.getElementById('triage-features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 px-4 rounded-2xl mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-4 rounded-full">
              <Stethoscope className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            TRIAGE A.I.
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Intelligent Symptom Assessment & Care Navigation
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartTriage}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Assessment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              onClick={handleLearnMore}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold rounded-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

             {/* Enhanced Stats Section with SF Data */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <Card className="text-center border-0 shadow-sm">
           <CardContent className="p-4">
             <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
               {sanFranciscoHealthcareStats.hospitals}
             </div>
             <div className="text-sm text-gray-600">Hospitals</div>
           </CardContent>
         </Card>
         <Card className="text-center border-0 shadow-sm">
           <CardContent className="p-4">
             <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">
               {sanFranciscoHealthcareStats.urgentCareCenters}
             </div>
             <div className="text-sm text-gray-600">Urgent Care Centers</div>
           </CardContent>
         </Card>
         <Card className="text-center border-0 shadow-sm">
           <CardContent className="p-4">
             <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">
               {sanFranciscoHealthcareStats.insuranceCoverage.insured}%
             </div>
             <div className="text-sm text-gray-600">Insured Population</div>
           </CardContent>
         </Card>
         <Card className="text-center border-0 shadow-sm">
           <CardContent className="p-4">
             <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">
               {sanFranciscoHealthcareStats.languages.length}
             </div>
             <div className="text-sm text-gray-600">Languages Supported</div>
           </CardContent>
         </Card>
       </div>

      {/* Features Section */}
      <div id="triage-features" className="mb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How TRIAGE A.I. Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI-powered system provides accurate, immediate medical guidance through a simple three-step process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Process Flow */}
      <div className="mb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple 3-Step Process
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Describe Symptoms
              </h3>
              <p className="text-gray-600">
                Tell us how you're feeling or upload a photo. Our AI analyzes your input.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Assessment
              </h3>
              <p className="text-gray-600">
                Get intelligent triage recommendations based on medical best practices.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Find Care
              </h3>
              <p className="text-gray-600">
                Locate nearby healthcare facilities and get directions instantly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

             {/* San Francisco Healthcare Context */}
       <Card className="bg-gradient-to-r from-green-50 to-emerald-100 border-0 shadow-sm mb-8">
         <CardContent className="p-8">
           <div className="text-center mb-6">
             <div className="flex justify-center mb-4">
               <div className="bg-green-600 p-3 rounded-full">
                 <Building2 className="w-8 h-8 text-white" />
               </div>
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">
               San Francisco Healthcare Network
             </h2>
             <p className="text-gray-600 max-w-3xl mx-auto">
               Access to {sanFranciscoHealthcareStats.totalPopulation.toLocaleString()} residents across diverse neighborhoods, 
               with {sanFranciscoHealthcareStats.healthcareWorkers.toLocaleString()} healthcare professionals 
               serving the Bay Area community.
             </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="text-center">
               <div className="text-3xl font-bold text-green-600 mb-2">
                 {sanFranciscoHealthcareStats.neighborhoods?.length || 6}
               </div>
               <div className="text-sm text-gray-600">Major Neighborhoods</div>
               <div className="text-xs text-gray-500 mt-1">
                 Mission, Financial District, Marina, Chinatown, Pacific Heights, Bayview
               </div>
             </div>
             <div className="text-center">
               <div className="text-3xl font-bold text-blue-600 mb-2">
                 {sanFranciscoHealthcareStats.transportation?.length || 4}
               </div>
               <div className="text-sm text-gray-600">Transportation Options</div>
               <div className="text-xs text-gray-500 mt-1">
                 Muni, BART, Cable Cars, Ferries
               </div>
             </div>
             <div className="text-center">
               <div className="text-3xl font-bold text-purple-600 mb-2">
                 {sanFranciscoHealthcareStats.languages.length}
               </div>
               <div className="text-sm text-gray-600">Languages Supported</div>
               <div className="text-xs text-gray-500 mt-1">
                 English, Spanish, Chinese, Vietnamese, Tagalog, Russian, Korean, Japanese
               </div>
             </div>
           </div>
         </CardContent>
       </Card>

       {/* CTA Section */}
       <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-0 shadow-sm">
         <CardContent className="p-8 text-center">
           <h2 className="text-2xl font-bold text-gray-900 mb-4">
             Ready to Get Started?
           </h2>
           <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
             Join thousands of users who trust TRIAGE A.I. for immediate medical guidance. 
             It's free, secure, and available 24/7.
           </p>
           
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button
               onClick={handleStartTriage}
               size="lg"
               className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
             >
               <Stethoscope className="w-5 h-5 mr-2" />
               Start Your Assessment
               <ArrowRight className="w-5 h-5 ml-2" />
             </Button>
           </div>

           <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
             <div className="flex items-center gap-2">
               <Lock className="w-4 h-4" />
               <span>100% Secure</span>
             </div>
             <div className="flex items-center gap-2">
               <Users className="w-4 h-4" />
               <span>No Registration</span>
             </div>
             <div className="flex items-center gap-2">
               <Shield className="w-4 h-4" />
               <span>HIPAA Compliant</span>
             </div>
           </div>
         </CardContent>
       </Card>
    </div>
  );
};

export default TriageAILanding;
