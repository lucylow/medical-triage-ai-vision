import React from 'react';

const SimpleTriage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            🚑 TRIAGE A.I.
          </h1>
          <p className="text-xl text-blue-700">
            AI-Powered Medical Triage System
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Symptom Assessment
          </h2>
          
          {/* Simple Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your symptoms:
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Example: I have chest pain that radiates to my left arm..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pain level (1-10):
              </label>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 - Mild</span>
                <span>10 - Severe</span>
              </div>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors">
              Get AI Assessment
            </button>
          </div>
          
          {/* Sample Results */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Sample Assessment Result:
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Triage Level:</strong> Urgent Care</p>
              <p><strong>Confidence:</strong> 85%</p>
              <p><strong>Recommendation:</strong> Visit urgent care within 24 hours</p>
              <p><strong>Next Steps:</strong> Monitor symptoms, avoid delay</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            ⚠️ This is a demonstration system. Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleTriage;
