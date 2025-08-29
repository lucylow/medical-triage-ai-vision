import { MedicalKnowledgeBase } from './MedicalKnowledgeBase';
import { SymptomAnalyzer } from './SymptomAnalyzer';
import { CacheService } from './CacheService';

export interface TriageResult {
  triageLevel: 'emergency' | 'urgent' | 'routine' | 'self_care';
  confidence: number;
  conditions: string[];
  recommendedActions: string[];
  followUpQuestions: string[];
  warningSigns: string[];
  timeline: 'immediate' | 'hours' | 'days' | 'weeks';
  riskFactors: string[];
  differentialDiagnosis: string[];
  redFlags: string[];
  nextSteps: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export interface PatientContext {
  age?: number;
  gender?: string;
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  location?: { lat: number; lng: number };
  insuranceType?: string;
  preferredLanguage?: string;
}

export class AITriageService {
  private knowledgeBase: MedicalKnowledgeBase;
  private symptomAnalyzer: SymptomAnalyzer;
  private cache: CacheService;
  private sessionManager: Map<string, any>;

  constructor() {
    this.knowledgeBase = new MedicalKnowledgeBase();
    this.symptomAnalyzer = new SymptomAnalyzer();
    this.cache = CacheService.getInstance();
    this.sessionManager = new Map();
  }

  async analyzeSymptoms(
    symptoms: string,
    patientContext?: PatientContext,
    imageAnalysis?: string,
    sessionId?: string
  ): Promise<TriageResult> {
    // Check cache first for similar symptom patterns
    const cacheKey = this.generateCacheKey(symptoms, patientContext);
    const cachedResult = await this.cache.get<TriageResult>(cacheKey);
    
    if (cachedResult && this.isCacheValid(cachedResult)) {
      return this.personalizeResult(cachedResult, patientContext);
    }

    // Multi-stage analysis pipeline
    const [ruleBasedResult, aiEnhancedResult] = await Promise.allSettled([
      this.symptomAnalyzer.analyze(symptoms, patientContext),
      this.enhanceWithAI(symptoms, patientContext, imageAnalysis)
    ]);

    // Merge results using sophisticated decision logic
    let finalResult: TriageResult;
    
    if (aiEnhancedResult.status === 'fulfilled') {
      finalResult = this.mergeResults(ruleBasedResult, aiEnhancedResult.value);
    } else {
      finalResult = ruleBasedResult.status === 'fulfilled' 
        ? ruleBasedResult.value 
        : await this.createFallbackResult(symptoms);
    }

    // Enhance with medical knowledge base
    finalResult = await this.knowledgeBase.enhanceResult(finalResult, symptoms, patientContext);

    // Apply risk stratification
    finalResult = this.applyRiskStratification(finalResult, patientContext);

    // Generate personalized recommendations
    finalResult = this.personalizeResult(finalResult, patientContext);

    // Cache the result with appropriate TTL
    await this.cache.set(cacheKey, finalResult, this.calculateCacheTTL(finalResult.triageLevel));

    // Update session context
    if (sessionId) {
      this.updateSessionContext(sessionId, symptoms, finalResult);
    }

    return finalResult;
  }

  async continueConversation(
    sessionId: string,
    userResponse: string,
    context: any
  ): Promise<{
    message: string;
    requiresClarification: boolean;
    quickReplies?: string[];
    triageComplete: boolean;
    result?: TriageResult;
  }> {
    const session = this.sessionManager.get(sessionId);
    if (!session) {
      throw new Error('Invalid session');
    }

    // Update conversation context
    session.conversation.push({
      user: userResponse,
      timestamp: new Date(),
      context
    });

    // Analyze the response in context
    const analysis = await this.analyzeConversationContext(session);
    
    if (analysis.triageComplete) {
      const finalResult = await this.generateFinalTriage(session);
      return {
        message: this.generateCompletionMessage(finalResult),
        requiresClarification: false,
        triageComplete: true,
        result: finalResult
      };
    }

    // Generate next question or clarification
    const nextQuestion = await this.generateNextQuestion(session, analysis);
    
    return {
      message: nextQuestion.message,
      requiresClarification: true,
      quickReplies: nextQuestion.quickReplies,
      triageComplete: false
    };
  }

  async analyzeImage(
    imageData: string,
    symptoms: string,
    patientContext?: PatientContext
  ): Promise<{
    analysis: string;
    confidence: number;
    detectedConditions: string[];
    triageImpact: 'high' | 'medium' | 'low';
  }> {
    // This would integrate with actual computer vision APIs
    // For now, we'll simulate sophisticated image analysis
    
    const imageAnalysis = await this.simulateImageAnalysis(imageData, symptoms);
    
    // Combine image analysis with symptom analysis
    const enhancedSymptoms = `${symptoms} [Image Analysis: ${imageAnalysis.analysis}]`;
    
    // Re-analyze with enhanced information
    const triageResult = await this.analyzeSymptoms(enhancedSymptoms, patientContext, imageAnalysis.analysis);
    
    return {
      analysis: imageAnalysis.analysis,
      confidence: imageAnalysis.confidence,
      detectedConditions: imageAnalysis.detectedConditions,
      triageImpact: this.calculateTriageImpact(imageAnalysis, triageResult)
    };
  }

  private async enhanceWithAI(
    symptoms: string,
    patientContext?: PatientContext,
    imageAnalysis?: string
  ): Promise<TriageResult> {
    // Simulate AI enhancement - in production this would call actual AI services
    const enhancedResult = await this.simulateAIEnhancement(symptoms, patientContext, imageAnalysis);
    return enhancedResult;
  }

  private mergeResults(
    ruleBased: any,
    aiEnhanced: TriageResult
  ): TriageResult {
    // Sophisticated merging logic that considers confidence levels
    // and medical best practices
    
    if (ruleBased.triageLevel === 'emergency' && aiEnhanced.triageLevel !== 'emergency') {
      // Always prioritize emergency classification from rule-based analysis
      return {
        ...aiEnhanced,
        triageLevel: 'emergency',
        confidence: Math.max(ruleBased.confidence || 0, aiEnhanced.confidence),
        warningSigns: [...(ruleBased.warningSigns || []), ...aiEnhanced.warningSigns]
      };
    }

    // Merge conditions and actions intelligently
    const mergedConditions = [...new Set([...(ruleBased.conditions || []), ...aiEnhanced.conditions])];
    const mergedActions = this.mergeActions(ruleBased.recommendedActions || [], aiEnhanced.recommendedActions);

    return {
      ...aiEnhanced,
      conditions: mergedConditions,
      recommendedActions: mergedActions,
      confidence: (ruleBased.confidence + aiEnhanced.confidence) / 2
    };
  }

  private mergeActions(ruleActions: string[], aiActions: string[]): string[] {
    // Remove duplicates and prioritize by medical importance
    const allActions = [...ruleActions, ...aiActions];
    const uniqueActions = [...new Set(allActions)];
    
    // Sort by medical priority
    const priorityOrder = [
      'Call 911 immediately',
      'Go to emergency room',
      'Seek urgent care',
      'Contact healthcare provider',
      'Monitor symptoms',
      'Take over-the-counter medication'
    ];

    return uniqueActions.sort((a, b) => {
      const aPriority = priorityOrder.findIndex(action => a.includes(action));
      const bPriority = priorityOrder.findIndex(action => b.includes(action));
      return aPriority - bPriority;
    });
  }

  private applyRiskStratification(
    result: TriageResult,
    patientContext?: PatientContext
  ): TriageResult {
    let adjustedResult = { ...result };

    if (patientContext?.age && patientContext.age > 65) {
      // Elderly patients get more conservative triage
      if (result.triageLevel === 'routine') {
        adjustedResult.triageLevel = 'urgent';
        adjustedResult.confidence = Math.min(result.confidence + 0.1, 1.0);
      }
    }

    if (patientContext?.medicalHistory?.includes('heart disease')) {
      // Cardiac patients get more aggressive triage for certain symptoms
      if (result.conditions.some(condition => 
        condition.toLowerCase().includes('chest') || 
        condition.toLowerCase().includes('pain')
      )) {
        adjustedResult.triageLevel = 'emergency';
        adjustedResult.confidence = Math.min(result.confidence + 0.2, 1.0);
      }
    }

    return adjustedResult;
  }

  private personalizeResult(
    result: TriageResult,
    patientContext?: PatientContext
  ): TriageResult {
    if (!patientContext) return result;

    const personalizedResult = { ...result };

    // Adjust language based on patient preference
    if (patientContext.preferredLanguage && patientContext.preferredLanguage !== 'en') {
      personalizedResult.recommendedActions = result.recommendedActions.map(action =>
        this.translateAction(action, patientContext.preferredLanguage!)
      );
    }

    // Add insurance-specific recommendations
    if (patientContext.insuranceType) {
      personalizedResult.nextSteps = {
        ...result.nextSteps,
        immediate: [
          ...result.nextSteps.immediate,
          `Check ${patientContext.insuranceType} coverage for recommended care`
        ]
      };
    }

    return personalizedResult;
  }

  private generateCacheKey(symptoms: string, patientContext?: PatientContext): string {
    const contextHash = patientContext ? JSON.stringify(patientContext) : '';
    return `triage:${this.hashString(symptoms + contextHash)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  private calculateCacheTTL(triageLevel: string): number {
    // Emergency results cached for shorter time due to urgency
    const ttlMap = {
      emergency: 300,    // 5 minutes
      urgent: 900,       // 15 minutes
      routine: 3600,     // 1 hour
      self_care: 7200    // 2 hours
    };
    return ttlMap[triageLevel as keyof typeof ttlMap] || 3600;
  }

  private isCacheValid(result: TriageResult): boolean {
    // Additional validation logic for cached results
    return result.confidence > 0.7 && result.conditions.length > 0;
  }

  private updateSessionContext(sessionId: string, symptoms: string, result: TriageResult): void {
    const session = this.sessionManager.get(sessionId) || {
      id: sessionId,
      startTime: new Date(),
      conversation: [],
      symptoms: [],
      results: []
    };

    session.symptoms.push(symptoms);
    session.results.push(result);
    session.lastUpdate = new Date();

    this.sessionManager.set(sessionId, session);
  }

  private async simulateAIEnhancement(
    symptoms: string,
    patientContext?: PatientContext,
    imageAnalysis?: string
  ): Promise<TriageResult> {
    // Simulate sophisticated AI analysis
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time

    return {
      triageLevel: 'urgent',
      confidence: 0.85,
      conditions: ['Acute appendicitis', 'Gastroenteritis'],
      recommendedActions: [
        'Seek immediate medical attention',
        'Do not eat or drink anything',
        'Avoid pain medications that could mask symptoms'
      ],
      followUpQuestions: [
        'When did the pain start?',
        'Is the pain constant or intermittent?',
        'Have you had similar symptoms before?'
      ],
      warningSigns: [
        'Severe abdominal pain',
        'Nausea and vomiting',
        'Fever above 100.4°F'
      ],
      timeline: 'hours',
      riskFactors: ['Age under 50', 'No previous surgery'],
      differentialDiagnosis: ['Appendicitis', 'Diverticulitis', 'Ovarian cyst'],
      redFlags: ['Severe pain', 'Fever', 'Nausea'],
      nextSteps: {
        immediate: ['Go to emergency room'],
        shortTerm: ['Follow up with primary care'],
        longTerm: ['Consider preventive care']
      }
    };
  }

  private async simulateImageAnalysis(
    imageData: string,
    symptoms: string
  ): Promise<{
    analysis: string;
    confidence: number;
    detectedConditions: string[];
  }> {
    // Simulate computer vision analysis
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      analysis: 'Image shows localized inflammation and redness consistent with described symptoms',
      confidence: 0.78,
      detectedConditions: ['Localized inflammation', 'Erythema', 'Possible infection']
    };
  }

  private calculateTriageImpact(
    imageAnalysis: any,
    triageResult: TriageResult
  ): 'high' | 'medium' | 'low' {
    if (imageAnalysis.confidence > 0.8 && triageResult.triageLevel === 'emergency') {
      return 'high';
    }
    if (imageAnalysis.confidence > 0.6) {
      return 'medium';
    }
    return 'low';
  }

  private async createFallbackResult(symptoms: string): Promise<TriageResult> {
    return {
      triageLevel: 'routine',
      confidence: 0.5,
      conditions: ['General symptoms'],
      recommendedActions: ['Contact healthcare provider for evaluation'],
      followUpQuestions: ['Please describe your symptoms in more detail'],
      warningSigns: ['Worsening symptoms'],
      timeline: 'days',
      riskFactors: [],
      differentialDiagnosis: [],
      redFlags: [],
      nextSteps: {
        immediate: ['Monitor symptoms'],
        shortTerm: ['Contact healthcare provider'],
        longTerm: ['Follow up as recommended']
      }
    };
  }

  private translateAction(action: string, language: string): string {
    // Simple translation mapping - in production would use proper translation service
    const translations: Record<string, Record<string, string>> = {
      es: {
        'Call 911 immediately': 'Llame al 911 inmediatamente',
        'Go to emergency room': 'Vaya a la sala de emergencias',
        'Seek urgent care': 'Busque atención urgente'
      }
    };

    return translations[language]?.[action] || action;
  }

  private async analyzeConversationContext(session: any): Promise<{
    triageComplete: boolean;
    confidence: number;
    missingInfo: string[];
  }> {
    // Analyze conversation to determine if we have enough information
    const symptomCount = session.symptoms.length;
    const hasLocation = session.results.some((r: any) => r.triageLevel === 'emergency');
    
    return {
      triageComplete: symptomCount >= 3 || hasLocation,
      confidence: Math.min(0.5 + (symptomCount * 0.1), 0.95),
      missingInfo: symptomCount < 3 ? ['symptom duration', 'pain intensity', 'associated symptoms'] : []
    };
  }

  private async generateNextQuestion(
    session: any,
    analysis: any
  ): Promise<{
    message: string;
    quickReplies: string[];
  }> {
    const questions = [
      'How long have you been experiencing these symptoms?',
      'On a scale of 1-10, how severe is your pain?',
      'Are there any other symptoms you\'re experiencing?',
      'Have you had similar symptoms before?'
    ];

    const questionIndex = Math.min(session.conversation.length, questions.length - 1);
    const question = questions[questionIndex] || questions[questions.length - 1];

    const quickReplies = this.generateQuickReplies(question);

    return {
      message: question,
      quickReplies
    };
  }

  private generateQuickReplies(question: string): string[] {
    if (question.includes('scale of 1-10')) {
      return ['1-3 (Mild)', '4-6 (Moderate)', '7-10 (Severe)'];
    }
    if (question.includes('how long')) {
      return ['Less than 1 hour', '1-6 hours', '6-24 hours', 'More than 24 hours'];
    }
    if (question.includes('similar symptoms')) {
      return ['Yes, frequently', 'Yes, occasionally', 'No, never', 'Not sure'];
    }
    
    return ['Yes', 'No', 'Not sure', 'Need to think about it'];
  }

  private generateCompletionMessage(result: TriageResult): string {
    const levelMessages = {
      emergency: 'Based on your symptoms, this requires IMMEDIATE medical attention. Please call 911 or go to the nearest emergency room right away.',
      urgent: 'Your symptoms suggest you need urgent medical care within the next few hours. I recommend visiting an urgent care center or emergency room.',
      routine: 'Your symptoms can be addressed with routine medical care. I recommend scheduling an appointment with your healthcare provider.',
      self_care: 'Your symptoms may be managed with self-care measures. However, if symptoms worsen, please contact a healthcare provider.'
    };

    return levelMessages[result.triageLevel] || 'Please consult with a healthcare professional for proper evaluation.';
  }

  private async generateFinalTriage(session: any): Promise<TriageResult> {
    // Generate comprehensive final triage result based on conversation
    const allSymptoms = session.symptoms.join(' ');
    const lastResult = session.results[session.results.length - 1];
    
    // Enhance the last result with conversation context
    return {
      ...lastResult,
      confidence: Math.min(lastResult.confidence + 0.1, 1.0),
      followUpQuestions: [],
      nextSteps: {
        ...lastResult.nextSteps,
        immediate: [
          ...lastResult.nextSteps.immediate,
          'Follow up with healthcare provider as recommended'
        ]
      }
    };
  }
}
