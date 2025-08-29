export interface SymptomAnalysisResult {
  triageLevel: 'emergency' | 'urgent' | 'routine' | 'self_care';
  confidence: number;
  conditions: string[];
  recommendedActions: string[];
  followUpQuestions: string[];
  warningSigns: string[];
  timeline: 'immediate' | 'hours' | 'days' | 'weeks';
  riskScore: number;
  urgencyFactors: string[];
  differentialDiagnosis: string[];
}

export interface SymptomPattern {
  id: string;
  name: string;
  symptoms: string[];
  triageLevel: 'emergency' | 'urgent' | 'routine' | 'self_care';
  confidence: number;
  riskFactors: string[];
  redFlags: string[];
}

export class SymptomAnalyzer {
  private symptomPatterns: SymptomPattern[];
  private riskFactors: Map<string, number>;
  private urgencyKeywords: Map<string, number>;

  constructor() {
    this.symptomPatterns = [];
    this.riskFactors = new Map();
    this.urgencyKeywords = new Map();
    this.initializeAnalyzer();
  }

  async analyze(
    symptoms: string,
    patientContext?: any
  ): Promise<SymptomAnalysisResult> {
    // Parse and normalize symptoms
    const parsedSymptoms = this.parseSymptoms(symptoms);
    
    // Analyze symptom patterns
    const patternAnalysis = this.analyzeSymptomPatterns(parsedSymptoms);
    
    // Calculate risk score
    const riskScore = this.calculateRiskScore(parsedSymptoms, patientContext);
    
    // Determine triage level
    const triageLevel = this.determineTriageLevel(patternAnalysis, riskScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(triageLevel, parsedSymptoms);
    
    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(parsedSymptoms, patternAnalysis);
    
    // Identify warning signs
    const warningSigns = this.identifyWarningSigns(parsedSymptoms, triageLevel);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(patternAnalysis, riskScore, parsedSymptoms.length);

    return {
      triageLevel,
      confidence,
      conditions: patternAnalysis.conditions,
      recommendedActions: recommendations.actions,
      followUpQuestions,
      warningSigns,
      timeline: this.determineTimeline(triageLevel, riskScore),
      riskScore,
      urgencyFactors: recommendations.urgencyFactors,
      differentialDiagnosis: patternAnalysis.differentialDiagnosis
    };
  }

  private parseSymptoms(symptomsText: string): string[] {
    // Normalize and split symptoms
    const normalized = symptomsText.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const symptoms = normalized.split(/\s+/);
    
    // Remove common stop words
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return symptoms.filter(symptom => 
      symptom.length > 2 && !stopWords.includes(symptom)
    );
  }

  private analyzeSymptomPatterns(symptoms: string[]): {
    conditions: string[];
    confidence: number;
    differentialDiagnosis: string[];
    urgencyLevel: number;
  } {
    let bestMatch: SymptomPattern | null = null;
    let bestScore = 0;
    const allConditions = new Set<string>();
    const allDifferentialDiagnosis = new Set<string>();

    for (const pattern of this.symptomPatterns) {
      const score = this.calculatePatternMatch(symptoms, pattern.symptoms);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = pattern;
      }

      if (score > 0.3) { // Include patterns with reasonable match
        allConditions.add(pattern.name);
        pattern.riskFactors.forEach(factor => allDifferentialDiagnosis.add(factor));
      }
    }

    const urgencyLevel = bestMatch ? this.calculateUrgencyLevel(bestMatch) : 0;

    return {
      conditions: Array.from(allConditions),
      confidence: bestScore,
      differentialDiagnosis: Array.from(allDifferentialDiagnosis),
      urgencyLevel
    };
  }

  private calculatePatternMatch(symptoms: string[], patternSymptoms: string[]): number {
    const symptomSet = new Set(symptoms);
    const patternSet = new Set(patternSymptoms);
    
    const intersection = new Set([...symptomSet].filter(x => patternSet.has(x)));
    const union = new Set([...symptomSet, ...patternSet]);
    
    return intersection.size / union.size;
  }

  private calculateUrgencyLevel(pattern: SymptomPattern): number {
    const urgencyMap = {
      emergency: 1.0,
      urgent: 0.7,
      routine: 0.4,
      self_care: 0.1
    };
    
    return urgencyMap[pattern.triageLevel] || 0.5;
  }

  private calculateRiskScore(symptoms: string[], patientContext?: any): number {
    let riskScore = 0;

    // Base risk from symptoms
    for (const symptom of symptoms) {
      const symptomRisk = this.urgencyKeywords.get(symptom) || 0;
      riskScore += symptomRisk;
    }

    // Patient context risk factors
    if (patientContext) {
      if (patientContext.age && patientContext.age > 65) riskScore += 0.3;
      if (patientContext.age && patientContext.age < 18) riskScore += 0.2;
      if (patientContext.pregnancyStatus === 'pregnant') riskScore += 0.4;
      if (patientContext.medicalHistory?.includes('heart disease')) riskScore += 0.5;
      if (patientContext.medicalHistory?.includes('diabetes')) riskScore += 0.3;
    }

    // Normalize risk score to 0-1 range
    return Math.min(Math.max(riskScore / 10, 0), 1);
  }

  private determineTriageLevel(
    patternAnalysis: any,
    riskScore: number
  ): 'emergency' | 'urgent' | 'routine' | 'self_care' {
    const { confidence, urgencyLevel } = patternAnalysis;
    
    // High confidence patterns override risk score
    if (confidence > 0.8) {
      if (urgencyLevel > 0.8) return 'emergency';
      if (urgencyLevel > 0.6) return 'urgent';
      if (urgencyLevel > 0.4) return 'routine';
      return 'self_care';
    }

    // Risk-based triage when pattern confidence is low
    if (riskScore > 0.8) return 'emergency';
    if (riskScore > 0.6) return 'urgent';
    if (riskScore > 0.4) return 'routine';
    return 'self_care';
  }

  private determineTimeline(
    triageLevel: string,
    riskScore: number
  ): 'immediate' | 'hours' | 'days' | 'weeks' {
    switch (triageLevel) {
      case 'emergency':
        return 'immediate';
      case 'urgent':
        return riskScore > 0.7 ? 'immediate' : 'hours';
      case 'routine':
        return riskScore > 0.5 ? 'hours' : 'days';
      case 'self_care':
        return 'days';
      default:
        return 'days';
    }
  }

  private generateRecommendations(
    triageLevel: string,
    symptoms: string[]
  ): {
    actions: string[];
    urgencyFactors: string[];
  } {
    const actions: string[] = [];
    const urgencyFactors: string[] = [];

    // Base recommendations by triage level
    switch (triageLevel) {
      case 'emergency':
        actions.push('Call 911 immediately');
        actions.push('Do not attempt to drive yourself');
        urgencyFactors.push('Life-threatening symptoms detected');
        break;
      case 'urgent':
        actions.push('Seek medical care within 2-4 hours');
        actions.push('Bring list of current medications');
        urgencyFactors.push('Time-sensitive symptoms requiring prompt attention');
        break;
      case 'routine':
        actions.push('Schedule appointment within 24-48 hours');
        actions.push('Monitor symptoms for changes');
        urgencyFactors.push('Symptoms manageable with routine care');
        break;
      case 'self_care':
        actions.push('Monitor symptoms for 24-48 hours');
        actions.push('Contact provider if symptoms worsen');
        urgencyFactors.push('Symptoms suitable for self-management');
        break;
    }

    // Symptom-specific recommendations
    if (symptoms.includes('pain')) {
      actions.push('Avoid activities that worsen pain');
      if (triageLevel !== 'emergency') {
        actions.push('Consider over-the-counter pain relief');
      }
    }

    if (symptoms.includes('fever')) {
      actions.push('Monitor temperature regularly');
      actions.push('Stay hydrated');
    }

    if (symptoms.includes('nausea')) {
      actions.push('Avoid heavy meals');
      actions.push('Stay hydrated with small sips');
    }

    return { actions, urgencyFactors };
  }

  private generateFollowUpQuestions(
    symptoms: string[],
    patternAnalysis: any
  ): string[] {
    const questions: string[] = [];

    // General symptom questions
    if (symptoms.length < 3) {
      questions.push('How long have you been experiencing these symptoms?');
      questions.push('Are there any other symptoms you\'re experiencing?');
    }

    // Pain-specific questions
    if (symptoms.includes('pain')) {
      questions.push('On a scale of 1-10, how severe is your pain?');
      questions.push('Is the pain constant or intermittent?');
      questions.push('What makes the pain better or worse?');
    }

    // Fever questions
    if (symptoms.includes('fever')) {
      questions.push('What is your current temperature?');
      questions.push('Do you have any other symptoms with the fever?');
    }

    // Pattern-specific questions
    if (patternAnalysis.confidence < 0.6) {
      questions.push('Have you had similar symptoms before?');
      questions.push('Are you currently taking any medications?');
      questions.push('Do you have any known medical conditions?');
    }

    return questions.slice(0, 5); // Limit to 5 questions
  }

  private identifyWarningSigns(
    symptoms: string[],
    triageLevel: string
  ): string[] {
    const warningSigns: string[] = [];

    // High-urgency warning signs
    if (triageLevel === 'emergency' || triageLevel === 'urgent') {
      warningSigns.push('Seek immediate medical attention');
      warningSigns.push('Do not delay care');
    }

    // Symptom-specific warnings
    if (symptoms.includes('chest') && symptoms.includes('pain')) {
      warningSigns.push('Chest pain can indicate serious heart conditions');
    }

    if (symptoms.includes('severe') && symptoms.includes('pain')) {
      warningSigns.push('Severe pain may indicate serious underlying condition');
    }

    if (symptoms.includes('fever') && symptoms.includes('high')) {
      warningSigns.push('High fever can be dangerous, especially in children');
    }

    if (symptoms.includes('bleeding')) {
      warningSigns.push('Uncontrolled bleeding requires immediate attention');
    }

    return warningSigns;
  }

  private calculateConfidence(
    patternAnalysis: any,
    riskScore: number,
    symptomCount: number
  ): number {
    let confidence = 0.5; // Base confidence

    // Pattern confidence
    confidence += patternAnalysis.confidence * 0.3;

    // Risk score confidence
    confidence += riskScore * 0.2;

    // Symptom count confidence
    if (symptomCount >= 3) confidence += 0.1;
    if (symptomCount >= 5) confidence += 0.1;

    // Urgency level confidence
    confidence += patternAnalysis.urgencyLevel * 0.1;

    return Math.min(Math.max(confidence, 0.1), 1.0);
  }

  private initializeAnalyzer(): void {
    // Initialize symptom patterns
    this.symptomPatterns = [
      {
        id: 'cardiac_emergency',
        name: 'Cardiac Emergency',
        symptoms: ['chest', 'pain', 'shortness', 'breath', 'sweating', 'nausea'],
        triageLevel: 'emergency',
        confidence: 0.95,
        riskFactors: ['heart attack', 'angina', 'pulmonary embolism'],
        redFlags: ['severe chest pain', 'pain radiating to arm', 'shortness of breath']
      },
      {
        id: 'abdominal_emergency',
        name: 'Abdominal Emergency',
        symptoms: ['abdominal', 'pain', 'nausea', 'vomiting', 'fever'],
        triageLevel: 'urgent',
        confidence: 0.85,
        riskFactors: ['appendicitis', 'bowel obstruction', 'peritonitis'],
        redFlags: ['severe pain', 'fever', 'nausea and vomiting']
      },
      {
        id: 'neurological_emergency',
        name: 'Neurological Emergency',
        symptoms: ['headache', 'confusion', 'weakness', 'numbness', 'speech'],
        triageLevel: 'emergency',
        confidence: 0.9,
        riskFactors: ['stroke', 'migraine', 'meningitis'],
        redFlags: ['worst headache of life', 'confusion', 'weakness on one side']
      },
      {
        id: 'respiratory_distress',
        name: 'Respiratory Distress',
        symptoms: ['shortness', 'breath', 'wheezing', 'coughing', 'chest'],
        triageLevel: 'urgent',
        confidence: 0.8,
        riskFactors: ['asthma attack', 'pneumonia', 'pulmonary embolism'],
        redFlags: ['severe shortness of breath', 'blue lips', 'chest pain']
      },
      {
        id: 'migraine',
        name: 'Migraine Headache',
        symptoms: ['headache', 'nausea', 'sensitivity', 'light', 'sound'],
        triageLevel: 'routine',
        confidence: 0.75,
        riskFactors: ['migraine', 'tension headache', 'cluster headache'],
        redFlags: ['worst headache of life', 'headache with fever']
      }
    ];

    // Initialize urgency keywords
    this.urgencyKeywords.set('severe', 0.8);
    this.urgencyKeywords.set('extreme', 0.9);
    this.urgencyKeywords.set('intense', 0.7);
    this.urgencyKeywords.set('sharp', 0.6);
    this.urgencyKeywords.set('sudden', 0.7);
    this.urgencyKeywords.set('worsening', 0.6);
    this.urgencyKeywords.set('unbearable', 0.9);
    this.urgencyKeywords.set('debilitating', 0.8);
    this.urgencyKeywords.set('chest', 0.8);
    this.urgencyKeywords.set('heart', 0.8);
    this.urgencyKeywords.set('stroke', 1.0);
    this.urgencyKeywords.set('bleeding', 0.9);
    this.urgencyKeywords.set('unconscious', 1.0);
    this.urgencyKeywords.set('breathing', 0.8);
    this.urgencyKeywords.set('fever', 0.5);
    this.urgencyKeywords.set('pain', 0.4);
    this.urgencyKeywords.set('nausea', 0.3);
    this.urgencyKeywords.set('dizziness', 0.4);
    this.urgencyKeywords.set('weakness', 0.5);
    this.urgencyKeywords.set('numbness', 0.6);

    // Initialize risk factors
    this.riskFactors.set('age_over_65', 0.3);
    this.riskFactors.set('age_under_18', 0.2);
    this.riskFactors.set('pregnancy', 0.4);
    this.riskFactors.set('heart_disease', 0.5);
    this.riskFactors.set('diabetes', 0.3);
    this.riskFactors.set('hypertension', 0.3);
    this.riskFactors.set('smoking', 0.3);
    this.riskFactors.set('obesity', 0.2);
    this.riskFactors.set('immunocompromised', 0.4);
    this.riskFactors.set('recent_surgery', 0.4);
  }
}
