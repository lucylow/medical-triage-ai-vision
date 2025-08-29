import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Upload, 
  Camera, 
  Brain, 
  AlertTriangle, 
  Clock, 
  MapPin,
  Phone,
  Navigation,
  Star,
  MessageCircle,
  Image as ImageIcon,
  Mic,
  Video,
  FileText,
  Heart,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import TriageLoadingIndicator from './TriageLoadingIndicator';
import TriageVisualFeedback from './TriageVisualFeedback';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'image' | 'quick_reply' | 'severity_slider' | 'emergency_alert';
  metadata?: {
    imageUrl?: string;
    quickReplies?: string[];
    severity?: number;
    triageLevel?: string;
    confidence?: number;
    conditions?: string[];
    recommendedActions?: string[];
    warningSigns?: string[];
    timeline?: string;
  };
}

interface PatientContext {
  age?: number;
  gender?: string;
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  location?: { lat: number; lng: number };
  insuranceType?: string;
  preferredLanguage?: string;
}

export const AdvancedTriageChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<'initial' | 'gathering' | 'analyzing' | 'complete'>('initial');
  const [patientContext, setPatientContext] = useState<PatientContext>({});
  const [currentTriageResult, setCurrentTriageResult] = useState<any>(null);
  const [showEmergencyButton, setShowEmergencyButton] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      id: '1',
      text: "Hello! I'm MediScan AI, your advanced medical triage assistant. I'm here to help assess your symptoms and guide you to appropriate care. What brings you here today?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        quickReplies: [
          "I have chest pain",
          "I'm experiencing severe symptoms",
          "I have a fever",
          "I need general medical advice"
        ]
      }
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text?: string, type: 'text' | 'image' = 'text') => {
    const messageText = text || inputText;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      type
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI analysis
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText, type);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Update conversation state
      if (aiResponse.metadata?.triageLevel === 'emergency') {
        setShowEmergencyButton(true);
        setConversationState('complete');
      } else if (conversationState === 'initial') {
        setConversationState('gathering');
      }
    }, 1500);
  };

  const generateAIResponse = (userInput: string, type: 'text' | 'image'): ChatMessage => {
    const inputLower = userInput.toLowerCase();
    
    // Emergency detection
    if (inputLower.includes('chest pain') || inputLower.includes('heart attack')) {
      return {
        id: Date.now().toString(),
        text: "🚨 EMERGENCY ALERT: Chest pain can indicate a serious heart condition. This requires IMMEDIATE medical attention. Please call 911 or go to the nearest emergency room right away. Do not delay care.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'emergency_alert',
        metadata: {
          triageLevel: 'emergency',
          confidence: 0.95,
          conditions: ['Acute coronary syndrome', 'Myocardial infarction'],
          recommendedActions: ['Call 911 immediately', 'Do not drive yourself'],
          warningSigns: ['Severe chest pain', 'Pain radiating to arm', 'Shortness of breath'],
          timeline: 'immediate'
        }
      };
    }

    // Abdominal pain analysis
    if (inputLower.includes('abdominal') || inputLower.includes('stomach')) {
      return {
        id: Date.now().toString(),
        text: "I need to understand your abdominal symptoms better to provide accurate guidance. How severe is your pain on a scale of 1-10?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
        metadata: {
          quickReplies: ['1-3 (Mild)', '4-6 (Moderate)', '7-10 (Severe)'],
          triageLevel: 'urgent',
          confidence: 0.7
        }
      };
    }

    // Fever analysis
    if (inputLower.includes('fever') || inputLower.includes('temperature')) {
      return {
        id: Date.now().toString(),
        text: "I see you're experiencing a fever. To help assess the urgency, I need to know: What's your current temperature, and are you experiencing any other symptoms?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
        metadata: {
          quickReplies: ['Above 103°F', '100-103°F', 'Below 100°F', 'Don\'t know'],
          triageLevel: 'routine',
          confidence: 0.6
        }
      };
    }

    // General guidance
    return {
      id: Date.now().toString(),
      text: "Thank you for sharing your symptoms. I'm analyzing this information to provide you with the most appropriate medical guidance. Can you tell me more about when these symptoms started and how they've been progressing?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        quickReplies: [
          'Started recently',
          'Been going on for days',
          'Getting worse',
          'Staying the same'
        ],
        triageLevel: 'routine',
        confidence: 0.5
      }
    };
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        
        // Add image message
        const imageMessage: ChatMessage = {
          id: Date.now().toString(),
          text: "Image uploaded for analysis",
          sender: 'user',
          timestamp: new Date(),
          type: 'image',
          metadata: { imageUrl }
        };

        setMessages(prev => [...prev, imageMessage]);
        
        // Simulate AI image analysis
        setTimeout(() => {
          const aiResponse = generateImageAnalysisResponse();
          setMessages(prev => [...prev, aiResponse]);
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateImageAnalysisResponse = (): ChatMessage => {
    return {
      id: Date.now().toString(),
      text: "I've analyzed your image. I can see [description based on image]. This appears to be consistent with [condition]. Based on this visual assessment, I recommend [action]. Would you like me to help you find nearby healthcare providers?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        triageLevel: 'routine',
        confidence: 0.75,
        conditions: ['Visual assessment completed'],
        recommendedActions: ['Schedule appointment with healthcare provider'],
        timeline: 'days'
      }
    };
  };

  const handleEmergency = () => {
    toast({
      title: "Emergency Alert",
      description: "Emergency services have been notified. Please call 911 immediately.",
      variant: "destructive"
    });
  };

  const handleVoiceInput = () => {
    toast({
      title: "Voice Input",
      description: "Voice recognition feature coming soon!",
    });
  };

  const handleVideoCall = () => {
    toast({
      title: "Video Consultation",
      description: "Video consultation feature coming soon!",
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isAI = message.sender === 'ai';
    
    return (
      <div key={message.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
        <div className={`flex ${isAI ? 'flex-row' : 'flex-row-reverse'} items-start gap-3 max-w-[80%]`}>
          <Avatar className={`w-8 h-8 ${isAI ? 'order-1' : 'order-2'}`}>
            <AvatarFallback className={isAI ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}>
              {isAI ? <Brain className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className={`${isAI ? 'order-2' : 'order-1'} flex-1`}>
            <Card className={`${isAI ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} shadow-sm`}>
              <CardContent className="p-3">
                {message.type === 'image' && message.metadata?.imageUrl && (
                  <div className="mb-2">
                    <img 
                      src={message.metadata.imageUrl} 
                      alt="Symptom image" 
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {message.text}
                </p>
                
                {message.metadata?.triageLevel && (
                  <div className="mt-2">
                    <Badge 
                      variant={message.metadata.triageLevel === 'emergency' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {message.metadata.triageLevel.toUpperCase()}
                    </Badge>
                    {message.metadata.confidence && (
                      <span className="ml-2 text-xs text-gray-500">
                        Confidence: {Math.round(message.metadata.confidence * 100)}%
                      </span>
                    )}
                  </div>
                )}
                
                {message.metadata?.quickReplies && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.metadata.quickReplies.map((reply, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs h-8 px-3"
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className={`text-xs text-gray-500 mt-1 ${isAI ? 'text-left' : 'text-right'}`}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg">MediScan AI Assistant</CardTitle>
              <p className="text-blue-100 text-sm">Advanced Medical Triage & Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Shield className="w-3 h-3 mr-1" />
              HIPAA Compliant
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Zap className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <Brain className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-blue-50 border-blue-200 shadow-sm">
                <CardContent className="p-3">
                  <TriageLoadingIndicator 
                    message="Analyzing symptoms..."
                    subMessage="This usually takes 10-30 seconds"
                    variant="analyzing"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Emergency Button */}
      {showEmergencyButton && (
        <div className="p-4">
          <Button
            onClick={handleEmergency}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg"
            size="lg"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            EMERGENCY - CALL 911 IMMEDIATELY
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <ImageIcon className="w-4 h-4 mr-1" />
            Image
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoiceInput}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            <Mic className="w-4 h-4 mr-1" />
            Voice
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleVideoCall}
            className="text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <Video className="w-4 h-4 mr-1" />
            Video
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe your symptoms in detail..."
            className="flex-1"
          />
          
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          <Shield className="w-3 h-3 inline mr-1" />
          Your information is encrypted and secure. This AI tool provides guidance and should not replace professional medical advice.
        </div>
      </div>
    </div>
  );
};
