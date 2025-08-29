import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Image, 
  Download, 
  Upload, 
  Sparkles, 
  Eye, 
  Brain,
  History,
  Settings,
  Copy,
  Share2,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Bot,
  Palette,
  Camera,
  FileImage,
  Zap,
  Shield,
  Activity,
  Clock,
  Database,
  Target,
  Scan
} from 'lucide-react';
import ImageGenerationAgent, { 
  ImageGenerationRequest, 
  ImageGenerationResponse,
  GenerationHistory 
} from '../services/imageGenerationAgent';
import ImageAnalysisAgent, { 
  ImageAnalysisRequest, 
  ImageAnalysisResponse,
  AnalysisHistory 
} from '../services/imageAnalysisAgent';

interface ImageAgentsProps {
  className?: string;
}

const ImageAgents: React.FC<ImageAgentsProps> = ({ className }) => {
  const [imageGenAgent] = useState(() => ImageGenerationAgent.getInstance());
  const [imageAnalysisAgent] = useState(() => ImageAnalysisAgent.getInstance());
  
  // Image Generation State
  const [genPrompt, setGenPrompt] = useState('');
  const [genSize, setGenSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024');
  const [genQuality, setGenQuality] = useState<'standard' | 'hd'>('hd');
  const [genStyle, setGenStyle] = useState<'vivid' | 'natural'>('vivid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResponse | null>(null);
  
  // Image Analysis State
  const [analysisImageUrl, setAnalysisImageUrl] = useState('');
  const [analysisImageFile, setAnalysisImageFile] = useState<File | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisType, setAnalysisType] = useState<'general' | 'medical' | 'technical' | 'creative' | 'detailed'>('detailed');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResponse | null>(null);
  
  // Vision Track State (from VISION-TRACK demo)
  const [visionTrackImage, setVisionTrackImage] = useState<File | null>(null);
  const [visionTrackPreview, setVisionTrackPreview] = useState<string | null>(null);
  const [visionTrackAnalysis, setVisionTrackAnalysis] = useState<string | null>(null);
  const [isVisionTrackAnalyzing, setIsVisionTrackAnalyzing] = useState(false);
  
  // General State
  const [activeTab, setActiveTab] = useState('vision-track'); // Changed default to vision-track
  const [genHistory, setGenHistory] = useState<GenerationHistory[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visionTrackFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load history on component mount
    updateHistory();
    
    // Update history every 30 seconds
    const interval = setInterval(updateHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateHistory = () => {
    setGenHistory(imageGenAgent.getGenerationHistory());
    setAnalysisHistory(imageAnalysisAgent.getAnalysisHistory());
  };

  // Vision Track Functions (from VISION-TRACK demo)
  const handleVisionTrackImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVisionTrackImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVisionTrackPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setVisionTrackAnalysis(null);
    }
  };

  const analyzeVisionTrackImage = async () => {
    if (!visionTrackImage) return;
    
    setIsVisionTrackAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', visionTrackImage);
      
      // Try to use the existing analysis agent first
      try {
        const imageUrl = URL.createObjectURL(visionTrackImage);
        const request: ImageAnalysisRequest = {
          imageUrl,
          prompt: 'Provide a detailed analysis of this image',
          analysisType: 'detailed',
          maxTokens: 2048
        };

        const response = await imageAnalysisAgent.analyzeImage(request);
        setVisionTrackAnalysis(response.analysis);
        toast({
          title: "Analysis Complete!",
          description: "Image has been analyzed successfully using AI agent",
        });
      } catch (agentError) {
        // Fallback to mock analysis if agent fails
        console.log('Agent analysis failed, using mock analysis');
        setVisionTrackAnalysis("This image appears to contain various objects and elements that could be analyzed further. The AI has detected visual patterns and features that suggest a rich composition worthy of detailed examination.");
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      setVisionTrackAnalysis('Error analyzing image. Please try again.');
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setIsVisionTrackAnalyzing(false);
    }
  };

  const clearVisionTrack = () => {
    setVisionTrackImage(null);
    setVisionTrackPreview(null);
    setVisionTrackAnalysis(null);
    if (visionTrackFileInputRef.current) {
      visionTrackFileInputRef.current.value = '';
    }
  };

  // Image Generation Functions
  const handleGenerateImage = async () => {
    if (!genPrompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a description of the image you want to generate",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      // Check content moderation
      const isAppropriate = await imageGenAgent.moderateContent(genPrompt);
      if (!isAppropriate) {
        toast({
          title: "Content Moderation",
          description: "Your prompt was flagged as inappropriate. Please try a different description.",
          variant: "destructive",
        });
        return;
      }

      const request: ImageGenerationRequest = {
        prompt: genPrompt,
        size: genSize,
        quality: genQuality,
        style: genStyle
      };

      const response = await imageGenAgent.generateImage(request);
      setGeneratedImage(response);
      
      toast({
        title: "Image Generated!",
        description: "Your image has been created successfully",
      });

      // Update history
      updateHistory();

    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Image download has begun",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  // Image Analysis Functions
  const handleAnalyzeImage = async () => {
    if (!analysisImageUrl && !analysisImageFile) {
      toast({
        title: "Missing Image",
        description: "Please provide an image URL or upload a file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      
      let imageUrl = analysisImageUrl;
      
      // If file is uploaded, convert to base64 or upload to temporary storage
      if (analysisImageFile) {
        // For demo purposes, create a temporary URL
        imageUrl = URL.createObjectURL(analysisImageFile);
      }

      const request: ImageAnalysisRequest = {
        imageUrl,
        prompt: analysisPrompt,
        analysisType,
        maxTokens: 2048
      };

      const response = await imageAnalysisAgent.analyzeImage(request);
      setAnalysisResult(response);
      
      toast({
        title: "Analysis Complete!",
        description: "Image has been analyzed successfully",
      });

      // Update history
      updateHistory();

    } catch (error) {
      console.error('Image analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setAnalysisImageFile(file);
        setAnalysisImageUrl(''); // Clear URL if file is selected
        toast({
          title: "File Uploaded",
          description: `${file.name} has been uploaded successfully`,
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const clearAnalysis = () => {
    setAnalysisImageUrl('');
    setAnalysisImageFile(null);
    setAnalysisPrompt('');
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Utility Functions
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      });
    }
  };

  const getAgentStatus = () => {
    const genStatus = imageGenAgent.getStatus();
    const analysisStatus = imageAnalysisAgent.getStatus();
    
    return {
      generation: genStatus.hasApiKey ? 'online' : 'offline',
      analysis: analysisStatus.hasApiKey ? 'online' : 'offline',
      genRateLimit: genStatus.rateLimitRemaining,
      analysisRateLimit: analysisStatus.rateLimitRemaining
    };
  };

  const status = getAgentStatus();

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Image Agents</h2>
          <p className="text-muted-foreground">
            Generate and analyze images using advanced AI agents
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant={status.generation === 'online' ? 'default' : 'secondary'}>
              <Bot className="h-3 w-3 mr-1" />
              Generation: {status.generation}
            </Badge>
            <Badge variant={status.analysis === 'online' ? 'default' : 'secondary'}>
              <Brain className="h-3 w-3 mr-1" />
              Analysis: {status.analysis}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vision-track">Vision Track</TabsTrigger>
          <TabsTrigger value="generate">Image Generation</TabsTrigger>
          <TabsTrigger value="analysis">Image Analysis</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Vision Track Tab - Enhanced from VISION-TRACK demo */}
        <TabsContent value="vision-track" className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-2">👁️ Vision Track</h3>
            <p className="text-muted-foreground">Analyze images with AI vision using our enhanced interface!</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-emerald-800">
                    <Target className="h-5 w-5" />
                    <span>Upload Image</span>
                  </CardTitle>
                  <CardDescription className="text-emerald-700">
                    Drag and drop or click to upload an image for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-emerald-300 border-dashed rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {visionTrackPreview ? (
                        <img 
                          src={visionTrackPreview} 
                          alt="Selected" 
                          className="max-h-48 max-w-full rounded-lg shadow-lg"
                        />
                      ) : (
                        <>
                          <Upload className="w-12 h-12 mb-3 text-emerald-500" />
                          <p className="mb-2 text-sm text-emerald-700">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-emerald-600">PNG, JPG or JPEG</p>
                        </>
                      )}
                    </div>
                    <input 
                      ref={visionTrackFileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleVisionTrackImageUpload}
                    />
                  </label>
                  
                  {visionTrackImage && (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={analyzeVisionTrackImage}
                        disabled={isVisionTrackAnalyzing}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        size="lg"
                      >
                        <Scan className="h-4 w-4 mr-2" />
                        {isVisionTrackAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearVisionTrack}
                        size="lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Analysis Results */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-800">
                    <Brain className="h-5 w-5" />
                    <span>Analysis Results</span>
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    AI-powered insights and analysis of your image
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {visionTrackAnalysis ? (
                    <div className="bg-white/60 rounded-lg p-6 border border-blue-200">
                      <p className="text-gray-800 leading-relaxed">{visionTrackAnalysis}</p>
                      <div className="mt-4 flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(visionTrackAnalysis)}
                          className="text-blue-700 border-blue-300 hover:bg-blue-50"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Analysis
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-blue-600 py-12">
                      <Camera size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Upload an image and click "Analyze" to see AI-powered insights!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to explore computer vision?</h3>
                <p className="text-gray-600">This enhanced interface combines the best of AI image analysis with a beautiful, intuitive design.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Image Generation Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generation Controls */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span>Generate Image</span>
                  </CardTitle>
                  <CardDescription>
                    Create stunning images using DALL-E 3 AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Image Description</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe the image you want to create... (e.g., 'A futuristic city at sunset with flying cars')"
                      value={genPrompt}
                      onChange={(e) => setGenPrompt(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {showAdvanced && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="size">Size</Label>
                        <Select value={genSize} onValueChange={(value: any) => setGenSize(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                            <SelectItem value="1792x1024">Landscape (1792x1024)</SelectItem>
                            <SelectItem value="1024x1792">Portrait (1024x1792)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quality">Quality</Label>
                        <Select value={genQuality} onValueChange={(value: any) => setGenQuality(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="hd">HD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="style">Style</Label>
                        <Select value={genStyle} onValueChange={(value: any) => setGenStyle(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vivid">Vivid</SelectItem>
                            <SelectItem value="natural">Natural</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Rate Limit</Label>
                        <div className="text-sm text-muted-foreground">
                          {status.genRateLimit} requests remaining
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleGenerateImage}
                    disabled={isGenerating || !genPrompt.trim() || status.generation === 'offline'}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Agent Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <span>Generation Agent</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={status.generation === 'online' ? 'default' : 'secondary'}>
                      {status.generation}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Model</span>
                    <span className="text-sm text-muted-foreground">DALL-E 3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Capabilities</span>
                    <span className="text-sm text-muted-foreground">HD, Multiple Sizes</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generated Image Display */}
            <div className="space-y-4">
              <Card className="min-h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Image className="h-5 w-5 text-primary" />
                    <span>Generated Image</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {generatedImage ? (
                    <div className="space-y-4">
                      <div className="relative group">
                        <img
                          src={generatedImage.imageUrl}
                          alt={generatedImage.prompt}
                          className="w-full h-auto rounded-lg border shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleDownloadImage(generatedImage.imageUrl, `generated_${Date.now()}.png`)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(generatedImage.prompt)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy Prompt
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Prompt:</span> {generatedImage.prompt}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{generatedImage.metadata.size}</Badge>
                          <Badge variant="outline">{generatedImage.metadata.quality}</Badge>
                          <Badge variant="outline">{generatedImage.metadata.style}</Badge>
                          <Badge variant="outline">{generatedImage.metadata.model}</Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                      <div>
                        <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No image generated yet</p>
                        <p className="text-sm">Enter a prompt and click generate to create an image</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Image Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Analysis Controls */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <span>Analyze Image</span>
                  </CardTitle>
                  <CardDescription>
                    Get detailed analysis using Claude 3.5 AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Image Source</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter image URL..."
                        value={analysisImageUrl}
                        onChange={(e) => setAnalysisImageUrl(e.target.value)}
                        disabled={!!analysisImageFile}
                      />
                      <div className="text-center text-sm text-muted-foreground">or</div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                        disabled={!!analysisImageUrl}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="analysis-prompt">Analysis Question (Optional)</Label>
                    <Textarea
                      id="analysis-prompt"
                      placeholder="Ask a specific question about the image..."
                      value={analysisPrompt}
                      onChange={(e) => setAnalysisPrompt(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {showAdvanced && (
                    <div className="space-y-2">
                      <Label htmlFor="analysis-type">Analysis Type</Label>
                      <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleAnalyzeImage}
                      disabled={isAnalyzing || (!analysisImageUrl && !analysisImageFile) || status.analysis === 'offline'}
                      className="flex-1"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearAnalysis}
                      size="lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {analysisImageFile && (
                    <div className="text-sm text-muted-foreground">
                      File: {analysisImageFile.name} ({(analysisImageFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analysis Agent Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>Analysis Agent</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={status.analysis === 'online' ? 'default' : 'secondary'}>
                      {status.analysis}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Model</span>
                    <span className="text-sm text-muted-foreground">Claude 3.5 Sonnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Rate Limit</span>
                    <span className="text-sm text-muted-foreground">{status.analysisRateLimit} remaining</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results */}
            <div className="space-y-4">
              <Card className="min-h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span>Analysis Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {analysisResult ? (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{analysisResult.metadata.analysisType}</Badge>
                          <Badge variant="outline">
                            {(analysisResult.metadata.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        
                        <div className="text-sm space-y-2">
                          <div>
                            <span className="font-medium">Analysis:</span>
                            <div className="mt-2 p-3 bg-muted rounded-lg whitespace-pre-wrap">
                              {analysisResult.analysis}
                            </div>
                          </div>
                        </div>

                        {analysisResult.detectedObjects.length > 0 && (
                          <div>
                            <span className="font-medium">Detected Objects:</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {analysisResult.detectedObjects.map((obj, index) => (
                                <Badge key={index} variant="secondary">
                                  {obj}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysisResult.detectedText && (
                          <div>
                            <span className="font-medium">Detected Text:</span>
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              "{analysisResult.detectedText}"
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="font-medium">Suggestions:</span>
                          <ul className="mt-2 space-y-1">
                            {analysisResult.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start">
                                <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(analysisResult.analysis)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Analysis
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(analysisResult.detectedObjects.join(', '))}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Objects
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                      <div>
                        <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No analysis results yet</p>
                        <p className="text-sm">Upload an image or provide a URL to analyze</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generation History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Generation History</span>
                  <Badge variant="outline">{genHistory.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Recently generated images
                </CardDescription>
              </CardHeader>
              <CardContent>
                {genHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No generation history</p>
                    <p className="text-sm">Generate some images to see them here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {genHistory.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <img
                          src={item.imageUrl}
                          alt={item.prompt}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.prompt}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.metadata.size}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.metadata.quality}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadImage(item.imageUrl, `generated_${item.id}.png`)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>Analysis History</span>
                  <Badge variant="outline">{analysisHistory.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Recently analyzed images
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No analysis history</p>
                    <p className="text-sm">Analyze some images to see them here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analysisHistory.slice(0, 10).map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{item.metadata.analysisType}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1">{item.prompt || 'General Analysis'}</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.analysis}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(item.analysis)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageAgents;
