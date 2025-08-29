import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Camera, ArrowRight, AlertCircle, Stethoscope, Brain, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import TriageVisualFeedback from '@/components/TriageVisualFeedback';

const TriageSymptomInput = () => {
  const [symptomText, setSymptomText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        toast({
          title: "Image Added",
          description: "You can now describe your symptoms.",
        });
      } else {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleTakePhoto = () => {
    // For web, we'll simulate camera access
    // In a real mobile app, this would use expo-camera
    toast({
      title: "Camera Feature",
      description: "Camera functionality would be available in the mobile app.",
    });
  };

  const startTriage = () => {
    if (!symptomText.trim() && !selectedImage) {
      toast({
        title: "Missing Information",
        description: "Please describe your symptoms or add an image.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to the chat screen with the initial data
    navigate('/triage-chat', {
      state: {
        initialText: symptomText,
        initialImage: selectedImage,
        imagePreview: imagePreview,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Enhanced Header with Icons */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-full shadow-lg">
              <Stethoscope className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            How are you feeling?
          </h1>
          <p className="text-gray-600 text-lg">
            Describe your symptoms and we'll help you find the right care
          </p>
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Brain className="w-4 h-4 text-blue-500" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-500" />
              <span>100% Private</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-xl">Symptom Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your symptoms in detail
              </label>
              <Textarea
                placeholder="e.g., 'Sharp pain in my lower right side since this morning, and I feel nauseous. The pain gets worse when I move.'"
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                className="min-h-[120px] resize-none border-2 border-gray-200 focus:border-blue-500"
              />
            </div>

            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Add a photo (optional)
              </label>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="flex-1 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTakePhoto}
                  className="flex-1 border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">Image Attached</span>
                </div>
                <img
                  src={imagePreview}
                  alt="Symptom preview"
                  className="w-32 h-32 object-cover rounded-lg border border-green-300"
                />
              </div>
            )}

                    {/* Enhanced Privacy Notice */}
        <TriageVisualFeedback
          type="info"
          title="Privacy & Security"
          message="Your information is encrypted and secure. We do not store personal health data."
          showIcon={true}
          showBadge={true}
          badgeText="HIPAA Compliant"
        />

            {/* Start Button */}
            <Button
              onClick={startTriage}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!symptomText.trim() && !selectedImage}
            >
              Start AI Analysis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TriageSymptomInput;
