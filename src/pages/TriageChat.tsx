import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, ArrowLeft, User, Bot, AlertCircle, Brain, Stethoscope, Zap, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StatusIndicator } from '@/components/TriageVisualFeedback';
import { AdvancedTriageChat } from '@/components/AdvancedTriageChat';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  image?: string;
}

interface TriageData {
  initialText?: string;
  initialImage?: File;
  imagePreview?: string;
}

const TriageChat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [useAdvancedChat, setUseAdvancedChat] = useState(true);

  const triageData: TriageData = location.state || {};

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with user's initial input
  useEffect(() => {
    const initialMessages: Message[] = [];
    
    if (triageData.initialText) {
      initialMessages.push({
        id: '1',
        text: triageData.initialText,
        sender: 'user',
        timestamp: new Date(),
      });
    }

    if (triageData.imagePreview) {
      initialMessages.push({
        id: '2',
        text: 'Attached an image of symptoms.',
        sender: 'user',
        timestamp: new Date(),
        image: triageData.imagePreview,
      });
    }

    if (initialMessages.length > 0) {
      setMessages(initialMessages);
      // Simulate AI response
      setTimeout(() => {
        handleAIResponse("Thank you for providing your symptoms. I'm analyzing your information to provide the best care recommendations. Could you tell me more about when these symptoms started and how severe they are?");
      }, 1000);
    }
  }, [triageData]);

  const handleAIResponse = (text: string) => {
    const aiMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMessage]);
  };

  const simulateAIResponse = async (userMessage: string) => {
    setIsWaitingForAI(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    // Generate contextual AI response based on user input
    let aiResponse = "";
    
    if (userMessage.toLowerCase().includes('pain')) {
      if (userMessage.toLowerCase().includes('chest')) {
        aiResponse = "Chest pain can be serious. I need to ask a few more questions to assess the urgency. Is the pain sharp or dull? Does it radiate to your arm, jaw, or back?";
      } else if (userMessage.toLowerCase().includes('head')) {
        aiResponse = "Head pain can have many causes. How long have you had this headache? Is it accompanied by nausea, sensitivity to light, or any other symptoms?";
      } else {
        aiResponse = "I understand you're experiencing pain. To better assess your situation, could you rate the pain on a scale of 1-10 and describe what makes it better or worse?";
      }
    } else if (userMessage.toLowerCase().includes('fever')) {
      aiResponse = "Fever can indicate infection. What's your temperature? Are you experiencing any other symptoms like chills, body aches, or fatigue?";
    } else if (userMessage.toLowerCase().includes('nausea') || userMessage.toLowerCase().includes('vomiting')) {
      aiResponse = "Nausea and vomiting can have various causes. How long have you been feeling this way? Have you been able to keep fluids down?";
    } else {
      aiResponse = "Thank you for that information. I'm gathering a complete picture of your symptoms. Could you tell me more about your medical history or any medications you're currently taking?";
    }
    
    handleAIResponse(aiResponse);
    setIsWaitingForAI(false);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isWaitingForAI) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    await simulateAIResponse(userMessage.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const completeTriage = () => {
    // Simulate triage completion
    const finalMessage: Message = {
      id: Date.now().toString(),
      text: "Based on our conversation, I've completed your symptom assessment. Let me show you the results and care recommendations.",
      sender: 'ai',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, finalMessage]);
    
    // Navigate to results after a brief delay
    setTimeout(() => {
      navigate('/triage-results', {
        state: {
          triageLevel: 'urgent_care',
          summary: 'Based on your symptoms, you should visit an urgent care center within the next 24 hours.',
          sessionId: sessionId || 'demo-session-123'
        }
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/triage-input')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">TRIAGE A.I. Assessment</h1>
                <p className="text-sm text-gray-500">AI-powered symptom analysis in progress</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={useAdvancedChat ? "default" : "outline"}
                size="sm"
                onClick={() => setUseAdvancedChat(true)}
                className="text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                Advanced
              </Button>
              <Button
                variant={!useAdvancedChat ? "default" : "outline"}
                size="sm"
                onClick={() => setUseAdvancedChat(false)}
                className="text-xs"
              >
                <Shield className="w-3 h-3 mr-1" />
                Basic
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={completeTriage}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Complete Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="shadow-lg border-0 h-[600px] flex flex-col">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-full">
                <Brain className="w-5 h-5" />
              </div>
              <span>TRIAGE A.I. Assistant</span>
            </CardTitle>
            <p className="text-blue-100 text-sm mt-1">Powered by advanced medical AI</p>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 flex flex-col">
            {useAdvancedChat ? (
              <AdvancedTriageChat />
            ) : (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender === 'ai' && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.image && (
                          <img
                            src={message.image}
                            alt="Symptom image"
                            className="w-32 h-32 object-cover rounded-lg mb-2 border border-gray-300"
                          />
                        )}
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      {message.sender === 'user' && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-100 text-gray-600">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isWaitingForAI && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <Brain className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <div>
                            <span className="text-sm font-medium text-blue-800">AI is analyzing...</span>
                            <div className="w-32 bg-blue-200 rounded-full h-1.5 mt-2">
                              <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '75%' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </>
            )}

            {/* Input Area - Only for Basic Chat */}
            {!useAdvancedChat && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your symptoms or answer questions..."
                    className="flex-1"
                    disabled={isWaitingForAI}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isWaitingForAI}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Privacy Notice */}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <AlertCircle className="w-3 h-3" />
                  <span>Your conversation is private and secure</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TriageChat;
