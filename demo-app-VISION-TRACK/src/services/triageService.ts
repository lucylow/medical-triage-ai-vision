/**
 * TRIAGE A.I. Frontend Service
 * Handles communication with the backend API and manages triage workflow
 */

export interface TriageRequest {
  userId?: string;
  sessionId?: string;
  textInput: string;
  imageData?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface TriageResult {
  level: 'emergency' | 'urgent' | 'routine' | 'self_care';
  confidence: number;
  summary: string;
  recommendations: string[];
  nextSteps: string[];
  imageAnalysis?: string;
  riskFactors?: string[];
  processingTime: number;
}

export interface HealthcareResource {
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
  coordinates: {
    lat: number;
    lng: number;
  };
  specialties?: string[];
  waitTime?: string;
}

export interface TriageResponse {
  status: string;
  triageResult: TriageResult;
  healthcareResources: HealthcareResource[];
  sessionId: string;
  timestamp: string;
}

export interface ResourcesResponse {
  status: string;
  resources: HealthcareResource[];
  count: number;
  location: {
    lat: number;
    lng: number;
  };
  triageLevel: string;
}

export interface SessionInfo {
  userId: string;
  createdAt: string;
  lastActivity: string;
}

export interface SessionResponse {
  status: string;
  session: SessionInfo;
}

export interface AnalyticsResponse {
  status: string;
  analytics: {
    totalSessions: number;
    activeSessions: number;
    uptime: string;
    timestamp: string;
  };
}

class TriageService {
  private baseUrl: string;
  private sessionId: string | null = null;
  private userId: string | null = null;

  constructor() {
    // Use environment variable or default to local development
    this.baseUrl = import.meta.env.VITE_TRIAGE_API_URL || 'http://localhost:8081';
    
    // Initialize session and user IDs
    this.sessionId = this.getStoredSessionId();
    this.userId = this.getStoredUserId();
  }

  /**
   * Get stored session ID from localStorage
   */
  private getStoredSessionId(): string | null {
    return localStorage.getItem('triage_session_id');
  }

  /**
   * Get stored user ID from localStorage
   */
  private getStoredUserId(): string | null {
    return localStorage.getItem('triage_user_id');
  }

  /**
   * Store session ID in localStorage
   */
  private storeSessionId(sessionId: string): void {
    localStorage.setItem('triage_session_id', sessionId);
    this.sessionId = sessionId;
  }

  /**
   * Store user ID in localStorage
   */
  private storeUserId(userId: string): void {
    localStorage.setItem('triage_user_id', userId);
    this.userId = userId;
  }

  /**
   * Generate a new session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a new user ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Make HTTP request with error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; service: string; version: string; timestamp: string }> {
    return this.makeRequest('/');
  }

  /**
   * Process triage request
   */
  async processTriage(request: TriageRequest): Promise<TriageResponse> {
    try {
      // Ensure we have session and user IDs
      if (!this.sessionId) {
        this.sessionId = this.generateSessionId();
        this.storeSessionId(this.sessionId);
      }

      if (!this.userId) {
        this.userId = this.generateUserId();
        this.storeUserId(this.userId);
      }

      const requestData: TriageRequest = {
        ...request,
        sessionId: this.sessionId,
        userId: this.userId,
      };

      const response = await this.makeRequest<TriageResponse>('/api/triage', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      // Update stored session ID if a new one was generated
      if (response.sessionId && response.sessionId !== this.sessionId) {
        this.storeSessionId(response.sessionId);
      }

      return response;
    } catch (error) {
      console.error('Triage processing failed:', error);
      throw error;
    }
  }

  /**
   * Get healthcare resources based on location and triage level
   */
  async getHealthcareResources(
    location: { lat: number; lng: number },
    triageLevel: string = 'routine',
    maxDistance: number = 50.0
  ): Promise<ResourcesResponse> {
    const params = new URLSearchParams({
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      level: triageLevel,
      distance: maxDistance.toString(),
    });

    return this.makeRequest<ResourcesResponse>(`/api/resources?${params}`);
  }

  /**
   * Get session information
   */
  async getSession(sessionId: string): Promise<SessionResponse> {
    return this.makeRequest<SessionResponse>(`/api/sessions/${sessionId}`);
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<{ status: string; message: string }> {
    return this.makeRequest<{ status: string; message: string }>(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get system analytics
   */
  async getAnalytics(): Promise<AnalyticsResponse> {
    return this.makeRequest<AnalyticsResponse>('/api/analytics');
  }

  /**
   * Update healthcare data (admin function)
   */
  async updateHealthcareData(resources: any[]): Promise<{ status: string; message: string; timestamp: string }> {
    return this.makeRequest<{ status: string; message: string; timestamp: string }>('/api/healthcare-data', {
      method: 'POST',
      body: JSON.stringify({ resources }),
    });
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.userId;
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    this.sessionId = null;
    this.userId = null;
    localStorage.removeItem('triage_session_id');
    localStorage.removeItem('triage_user_id');
  }

  /**
   * Convert image file to base64 string
   */
  async imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  /**
   * Simulate triage processing for development/demo purposes
   */
  async simulateTriageProcessing(request: TriageRequest): Promise<TriageResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock triage result
    const mockTriageResult: TriageResult = {
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
      ],
      processingTime: 3.2
    };

    // Mock healthcare resources
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
        coordinates: { lat: 37.7749, lng: -122.4194 },
        specialties: ['emergency', 'trauma'],
        waitTime: '2-4 hours'
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
        coordinates: { lat: 37.7849, lng: -122.4094 },
        specialties: ['urgent_care'],
        waitTime: '30-60 minutes'
      }
    ];

    return {
      status: 'success',
      triageResult: mockTriageResult,
      healthcareResources: mockResources,
      sessionId: this.sessionId || this.generateSessionId(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if the service is available
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.warn('Triage service is not available:', error);
      return false;
    }
  }
}

// Export singleton instance
export const triageService = new TriageService();

// Export the class for testing purposes
export { TriageService };
