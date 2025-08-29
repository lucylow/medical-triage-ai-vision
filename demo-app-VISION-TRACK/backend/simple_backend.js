/**
 * Simple TRIAGE A.I. Backend Service
 * Node.js implementation for demonstration purposes
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory storage for sessions and data
const sessions = new Map();
const healthcareResources = [
    {
        id: "1",
        name: "City General Hospital",
        type: "hospital",
        address: "123 Medical Center Dr, City, State",
        distance: 2.1,
        phone: "(555) 123-4567",
        hours: "24/7",
        accepts_insurance: true,
        financial_aid: true,
        rating: 4.5,
        coordinates: { lat: 37.7749, lng: -122.4194 },
        specialties: ["Emergency Medicine", "Cardiology", "Trauma"],
        wait_time: "15-30 minutes"
    },
    {
        id: "2",
        name: "Urgent Care Express",
        type: "urgent_care",
        address: "456 Health Plaza, City, State",
        distance: 1.8,
        phone: "(555) 987-6543",
        hours: "8:00 AM - 10:00 PM",
        accepts_insurance: true,
        financial_aid: false,
        rating: 4.2,
        coordinates: { lat: 37.7849, lng: -122.4094 },
        specialties: ["Urgent Care", "Minor Injuries", "Illness"],
        wait_time: "20-45 minutes"
    },
    {
        id: "3",
        name: "Community Health Clinic",
        type: "clinic",
        address: "789 Wellness Ave, City, State",
        distance: 3.2,
        phone: "(555) 456-7890",
        hours: "9:00 AM - 5:00 PM",
        accepts_insurance: true,
        financial_aid: true,
        rating: 4.0,
        coordinates: { lat: 37.7649, lng: -122.4294 },
        specialties: ["Primary Care", "Preventive Medicine", "Chronic Disease"],
        wait_time: "1-2 days"
    }
];

// Medical knowledge base
const medicalKnowledge = {
    emergency: {
        keywords: ["chest pain", "difficulty breathing", "severe bleeding", "stroke", "unconscious", "heart attack"],
        response: "This appears to be a medical emergency. Please seek immediate care at the nearest emergency room or call 911."
    },
    urgent: {
        keywords: ["fever with rash", "broken bone", "deep cut", "high fever", "severe pain", "abdominal pain"],
        response: "Your symptoms suggest you should visit an urgent care center within the next 24 hours."
    },
    routine: {
        keywords: ["cold symptoms", "mild fever", "rash", "headache", "back pain", "cough"],
        response: "Based on your symptoms, you should schedule an appointment with your primary care provider."
    }
};

// Helper functions
function determineTriageLevel(symptoms) {
    const symptomsLower = symptoms.toLowerCase();
    
    // Check for emergency keywords
    if (medicalKnowledge.emergency.keywords.some(keyword => symptomsLower.includes(keyword))) {
        return { level: "emergency", confidence: 0.9 };
    }
    
    // Check for urgent keywords
    if (medicalKnowledge.urgent.keywords.some(keyword => symptomsLower.includes(keyword))) {
        return { level: "urgent", confidence: 0.8 };
    }
    
    // Default to routine
    return { level: "routine", confidence: 0.7 };
}

function generateMedicalResponse(symptoms, triageLevel) {
    const baseResponse = medicalKnowledge[triageLevel].response;
    
    // Add specific guidance based on symptoms
    let specificGuidance = "";
    if (symptoms.toLowerCase().includes("chest pain")) {
        specificGuidance = " Chest pain can be serious, especially if it radiates to your arm, neck, or jaw.";
    } else if (symptoms.toLowerCase().includes("abdominal pain")) {
        specificGuidance = " Abdominal pain can indicate various conditions. Severe, sudden pain requires immediate attention.";
    }
    
    // Add follow-up questions
    const followUp = " Can you tell me more about your symptoms? How long have you been experiencing them?";
    
    return baseResponse + specificGuidance + followUp;
}

// Routes
app.get('/', (req, res) => {
    res.json({
        message: "TRIAGE A.I. Backend Service",
        version: "1.0.0",
        status: "running",
        endpoints: [
            "/api/triage - Symptom assessment",
            "/api/resources - Healthcare resources",
            "/api/health - Health check"
        ]
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.post('/api/triage', (req, res) => {
    try {
        const { textInput, imageData, sessionId, userId } = req.body;
        
        if (!textInput) {
            return res.status(400).json({ error: "Text input is required" });
        }
        
        // Determine triage level
        const triageAssessment = determineTriageLevel(textInput);
        
        // Generate medical response
        const medicalResponse = generateMedicalResponse(textInput, triageAssessment.level);
        
        // Store session data
        if (sessionId) {
            if (!sessions.has(sessionId)) {
                sessions.set(sessionId, []);
            }
            sessions.get(sessionId).push({
                role: "user",
                content: textInput,
                timestamp: new Date().toISOString()
            });
            sessions.get(sessionId).push({
                role: "assistant",
                content: medicalResponse,
                timestamp: new Date().toISOString()
            });
        }
        
        // Prepare response
        const response = {
            triage_level: triageAssessment.level,
            confidence: triageAssessment.confidence,
            message: medicalResponse,
            follow_up_questions: [
                "Can you rate your pain on a scale of 1-10?",
                "When did the symptoms start?",
                "Are you experiencing any other symptoms?"
            ],
            context: {
                session_id: sessionId,
                user_id: userId,
                conversation_turns: sessions.get(sessionId)?.length || 0
            }
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Error in triage endpoint:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/api/resources', (req, res) => {
    try {
        const { lat, lng, level, type } = req.query;
        
        let filteredResources = [...healthcareResources];
        
        // Filter by triage level if specified
        if (level) {
            if (level === "emergency") {
                filteredResources = filteredResources.filter(r => r.type === "hospital");
            } else if (level === "urgent") {
                filteredResources = filteredResources.filter(r => ["hospital", "urgent_care"].includes(r.type));
            }
        }
        
        // Filter by type if specified
        if (type) {
            filteredResources = filteredResources.filter(r => r.type === type);
        }
        
        // Sort by distance if coordinates provided
        if (lat && lng) {
            filteredResources.sort((a, b) => a.distance - b.distance);
        }
        
        res.json({
            resources: filteredResources,
            total: filteredResources.length,
            filters: { level, type, coordinates: lat && lng ? { lat, lng } : null }
        });
        
    } catch (error) {
        console.error('Error in resources endpoint:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/api/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const sessionData = sessions.get(sessionId) || [];
    
    res.json({
        session_id: sessionId,
        messages: sessionData,
        total_messages: sessionData.length
    });
});

app.delete('/api/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    sessions.delete(sessionId);
    
    res.json({ message: "Session cleared successfully" });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚑 TRIAGE A.I. Backend Service running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📱 Triage endpoint: http://localhost:${PORT}/api/triage`);
    console.log(`🏥 Resources endpoint: http://localhost:${PORT}/api/resources`);
});

module.exports = app;
