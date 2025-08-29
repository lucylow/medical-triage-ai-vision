import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Stethoscope, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Phone,
  Mic,
  MicOff,
  Upload,
  X,
  Heart,
  Activity,
  Thermometer,
  Pill
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TriageResult {
  level: 'emergency' | 'urgent' | 'routine' | 'self_care';
  confidence: number;
  summary: string;
  recommendations: string[];
  nextSteps: string[];
}

interface HealthcareResource {
  id: string;
  name: string;
  type: 'hospital' | 'urgent_care' | 'clinic' | 'pharmacy';
  address: string;
  distance: number;
  phone: string;
  hours: string;
  acceptsInsurance: boolean;
  financialAid: boolean;
  rating: number;
  coordinates: { lat: number; lng: number };
}

const TriageAI: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [resources, setResources] = useState<HealthcareResource[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const triageLevels = {
    emergency: { label: 'Emergency', color: 'bg-red-500', icon: AlertTriangle, description: 'Immediate medical attention required' },
    urgent: { label: 'Urgent', color: 'bg-orange-500', icon: Clock, description: 'Seek care within 24 hours' },
    routine: { label: 'Routine', color: 'bg-blue-500', icon: Stethoscope, description: 'Schedule appointment soon' },
    self_care: { label: 'Self-Care', color: 'bg-green-500', icon: Pill, description: 'Monitor and self-treat' }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Convert audio to text (would integrate with speech-to-text service)
        const transcribedText = "Voice input transcribed"; // Placeholder
        setSymptoms(prev => prev + (prev ? ' ' : '') + transcribedText);
        toast({
          title: "Voice input captured",
          description: "Your voice input has been transcribed and added to symptoms.",
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processTriage = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Symptoms required",
        description: "Please describe your symptoms to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(2);

    try {
      // Simulate API call to triage service
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock triage result - would come from AI service
      const mockResult: TriageResult = {
        level: 'urgent',
        confidence: 0.85,
        summary: 'Based on your symptoms of sharp abdominal pain and nausea, this requires urgent medical evaluation. The combination of symptoms suggests a potential acute condition that should be assessed by a healthcare provider within the next few hours.',
        recommendations: [
          'Seek medical attention within 4-6 hours',
          'Avoid eating or drinking until evaluated',
          'Do not take pain medication without medical advice',
          'Have someone accompany you to medical facility'
        ],
        nextSteps: [
          'Contact urgent care or emergency department',
          'Bring list of current medications',
          'Prepare insurance information',
          'Document symptom timeline'
        ]
      };

      setTriageResult(mockResult);
      setCurrentStep(3);

      // Simulate resource search
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResources: HealthcareResource[] = [
        {
          id: '1',
          name: 'City General Hospital',
          type: 'hospital',
          address: '123 Medical Center Dr, San Francisco, CA',
          distance: 2.1,
          phone: '(555) 123-4567',
          hours: '24/7',
          acceptsInsurance: true,
          financialAid: true,
          rating: 4.8,
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        {
          id: '2',
          name: 'Urgent Care Express',
          type: 'urgent_care',
          address: '456 Health Plaza, San Francisco, CA',
          distance: 1.3,
          phone: '(555) 987-6543',
          hours: '8AM-10PM',
          acceptsInsurance: true,
          financialAid: false,
          rating: 4.5,
          coordinates: { lat: 37.7849, lng: -122.4094 }
        }
      ];

      setResources(mockResources);
      setCurrentStep(4);

    } catch (error) {
      toast({
        title: "Triage failed",
        description: "Unable to process your symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTriageLevelInfo = (level: keyof typeof triageLevels) => {
    return triageLevels[level];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  TRIAGE A.I.
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Intelligent Medical Triage & Resource Finder
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>AI-Powered Assessment</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>Local Resource Mapping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span>Real-time Processing</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Indicator */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">Step {currentStep} of 4</span>
            </div>
            <Progress value={(currentStep / 4) * 100} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Input</span>
              <span>Processing</span>
              <span>Results</span>
              <span>Resources</span>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={currentStep.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="1" disabled={currentStep < 1}>Symptoms Input</TabsTrigger>
            <TabsTrigger value="2" disabled={currentStep < 2}>AI Processing</TabsTrigger>
            <TabsTrigger value="3" disabled={currentStep < 3}>Triage Results</TabsTrigger>
            <TabsTrigger value="4" disabled={currentStep < 4}>Healthcare Resources</TabsTrigger>
          </TabsList>

          {/* Step 1: Symptoms Input */}
          <TabsContent value="1" className="mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  <span>Describe Your Symptoms</span>
                </CardTitle>
                <CardDescription>
                  Provide detailed information about your symptoms, pain level, and any relevant medical history.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text Input */}
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms Description</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Describe your symptoms in detail (e.g., 'Sharp pain in lower right abdomen, started 2 hours ago, feeling nauseous, no fever')"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>

                {/* Voice Input */}
                <div className="space-y-2">
                  <Label>Voice Input</Label>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "outline"}
                      className="flex items-center space-x-2"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          <span>Stop Recording</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          <span>Start Recording</span>
                        </>
                      )}
                    </Button>
                    {isRecording && (
                      <div className="flex items-center space-x-2 text-red-500">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">Recording...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Upload Image (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Symptom image"
                          className="max-w-full h-auto max-h-64 mx-auto rounded-lg"
                        />
                        <Button
                          onClick={removeImage}
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-700 font-medium">
                              Click to upload
                            </span>
                            <span className="text-gray-500"> or drag and drop</span>
                          </Label>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <Button
                  onClick={processTriage}
                  disabled={!symptoms.trim() || isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="h-5 w-5" />
                      <span>Analyze Symptoms</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: AI Processing */}
          <TabsContent value="2" className="mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span>AI Analysis in Progress</span>
                </CardTitle>
                <CardDescription>
                  Our AI is analyzing your symptoms and medical information...
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Processing Your Information
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Our AI triage system is analyzing your symptoms, reviewing medical guidelines, 
                  and preparing personalized recommendations.
                </p>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Analyzing symptoms...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Checking medical guidelines...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>Generating recommendations...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Triage Results */}
          <TabsContent value="3" className="mt-6">
            {triageResult && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>Triage Assessment Results</span>
                  </CardTitle>
                  <CardDescription>
                    AI-powered medical triage analysis completed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Triage Level */}
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      {React.createElement(getTriageLevelInfo(triageResult.level).icon, {
                        className: `h-8 w-8 ${getTriageLevelInfo(triageResult.level).color.replace('bg-', 'text-')}`
                      })}
                      <Badge className={`${getTriageLevelInfo(triageResult.level).color} text-white text-lg px-4 py-2`}>
                        {getTriageLevelInfo(triageResult.level).label}
                      </Badge>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {getTriageLevelInfo(triageResult.level).description}
                    </p>
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">Confidence: </span>
                      <span className="font-semibold text-blue-600">
                        {Math.round(triageResult.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Assessment Summary</Label>
                    <p className="text-gray-700 leading-relaxed">{triageResult.summary}</p>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Immediate Recommendations</Label>
                    <ul className="space-y-2">
                      {triageResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next Steps */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Next Steps</Label>
                    <ul className="space-y-2">
                      {triageResult.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> This AI assessment is for informational purposes only and 
                      should not replace professional medical advice. Always consult with a healthcare provider 
                      for proper diagnosis and treatment.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Step 4: Healthcare Resources */}
          <TabsContent value="4" className="mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <span>Nearby Healthcare Resources</span>
                </CardTitle>
                <CardDescription>
                  Based on your location and triage level, here are recommended facilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resources.map((resource) => (
                  <Card key={resource.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">{resource.name}</h3>
                            <Badge variant="outline" className="capitalize">
                              {resource.type.replace('_', ' ')}
                            </Badge>
                            {resource.financialAid && (
                              <Badge className="bg-green-100 text-green-800">
                                Financial Aid
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span>{resource.address}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{resource.hours}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{resource.phone}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-400">Rating:</span>
                                <span className="font-medium">{resource.rating}/5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold text-blue-600">
                            {resource.distance} mi
                          </div>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TriageAI;
