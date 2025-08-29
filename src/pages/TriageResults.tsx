import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Phone, 
  ArrowRight, 
  CheckCircle, 
  Info,
  Shield,
  FileText,
  Stethoscope,
  Brain
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import TriageVisualFeedback from '@/components/TriageVisualFeedback';

interface TriageResult {
  triageLevel: string;
  summary: string;
  sessionId: string;
}

const TriageResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const triageResult: TriageResult = location.state || {
    triageLevel: 'urgent_care',
    summary: 'Based on your symptoms, you should visit an urgent care center within the next 24 hours.',
    sessionId: 'demo-session-123'
  };

  const getTriageContent = (level: string) => {
    const levels: Record<string, {
      title: string;
      color: string;
      bgColor: string;
      icon: React.ReactNode;
      description: string;
      urgency: string;
      recommendations: string[];
    }> = {
      emergency: {
        title: 'Seek Emergency Care Immediately',
        color: '#DC2626',
        bgColor: '#FEF2F2',
        icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
        description: 'Your symptoms require immediate medical attention. Please go to the nearest emergency room or call 911.',
        urgency: 'Immediate - Call 911 or go to ER',
        recommendations: [
          'Call 911 immediately',
          'Go to nearest emergency room',
          'Do not drive yourself if possible',
          'Bring any relevant medical information'
        ]
      },
      urgent_care: {
        title: 'Visit Urgent Care Soon',
        color: '#EA580C',
        bgColor: '#FFF7ED',
        icon: <Clock className="w-8 h-8 text-orange-600" />,
        description: 'You should visit an urgent care center within the next 24 hours for evaluation.',
        urgency: 'Within 24 hours',
        recommendations: [
          'Visit urgent care center',
          'Bring photo ID and insurance card',
          'List current medications',
          'Monitor symptoms for worsening'
        ]
      },
      primary_care: {
        title: 'Schedule with Primary Care',
        color: '#2563EB',
        bgColor: '#EFF6FF',
        icon: <CheckCircle className="w-8 h-8 text-blue-600" />,
        description: 'Schedule an appointment with your primary care physician for evaluation.',
        urgency: 'Within 3-5 days',
        recommendations: [
          'Call your primary care doctor',
          'Keep symptom diary',
          'Monitor for new symptoms',
          'Follow up if symptoms worsen'
        ]
      },
      self_care: {
        title: 'Self-Care Recommended',
        color: '#059669',
        bgColor: '#F0FDF4',
        icon: <CheckCircle className="w-8 h-8 text-green-600" />,
        description: 'Your symptoms can typically be managed with self-care measures.',
        urgency: 'Monitor and self-treat',
        recommendations: [
          'Rest and stay hydrated',
          'Take over-the-counter medications as needed',
          'Monitor symptoms',
          'Seek care if symptoms worsen or persist'
        ]
      }
    };
    
    return levels[level] || levels.primary_care;
  };

  const content = getTriageContent(triageResult.triageLevel);

  const handleFindCare = () => {
    navigate('/triage-resources', {
      state: { triageLevel: triageResult.triageLevel }
    });
  };

  const handleCall911 = () => {
    if (window.confirm('Are you sure you want to call 911? This is for emergency situations only.')) {
      window.open('tel:911');
    }
  };

  const handleDownloadReport = () => {
    // Create a simple text report
    const report = `
TRIAGE A.I. Assessment Report
Session ID: ${triageResult.sessionId}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Assessment Result: ${content.title}
Urgency Level: ${content.urgency}

Summary: ${triageResult.summary}

Recommendations:
${content.recommendations.map(rec => `• ${rec}`).join('\n')}

Important: This is an AI assessment tool and should not replace professional medical advice.
Always consult with healthcare professionals for medical decisions.
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `triage-report-${triageResult.sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Your triage report has been saved.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Assessment Complete
          </h1>
          <p className="text-gray-600 text-lg">
            Here are your TRIAGE A.I. results and care recommendations
          </p>
        </div>

        {/* Main Result Card */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader 
            className="text-center"
            style={{ backgroundColor: content.bgColor }}
          >
            <div className="flex justify-center mb-4">
              {content.icon}
            </div>
            <CardTitle 
              className="text-2xl font-bold"
              style={{ color: content.color }}
            >
              {content.title}
            </CardTitle>
            <Badge 
              variant="secondary"
              className="mt-2"
              style={{ 
                backgroundColor: content.color, 
                color: 'white',
                border: 'none'
              }}
            >
              {content.urgency}
            </Badge>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {content.description}
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Assessment Summary
              </h3>
              <p className="text-gray-700">{triageResult.summary}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Recommended Actions
              </h3>
              <ul className="space-y-2">
                {content.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={handleFindCare}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Find Care Near Me
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {triageResult.triageLevel === 'emergency' && (
            <Button
              onClick={handleCall911}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call 911 Now
            </Button>
          )}
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button
            variant="outline"
            onClick={handleDownloadReport}
            className="w-full border-2 border-gray-300 hover:border-gray-400 py-3"
          >
            <FileText className="w-4 h-4 mr-2" />
            Download Report
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/triage-input')}
            className="w-full border-2 border-gray-300 hover:border-gray-400 py-3"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            New Assessment
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full border-2 border-gray-300 hover:border-gray-400 py-3"
          >
            ← Back to Home
          </Button>
        </div>

        {/* Enhanced Privacy & Disclaimer */}
        <TriageVisualFeedback
          type="info"
          title="Privacy & Medical Disclaimer"
          message="Your assessment data is encrypted and secure. This AI tool provides general guidance and should not replace professional medical advice. Always consult healthcare professionals for medical decisions."
          showIcon={true}
          showBadge={true}
          badgeText="Medical Info"
        />
      </div>
    </div>
  );
};

export default TriageResults;
