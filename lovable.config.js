module.exports = {
  // Project configuration
  project: {
    name: "Medical Triage AI Vision",
    description: "AI-powered medical triage system with computer vision capabilities",
    version: "1.0.0",
    type: "web-app",
  },

  // Build configuration
  build: {
    framework: "react",
    bundler: "vite",
    outputDir: "dist",
    publicDir: "public",
  },

  // Deployment configuration
  deploy: {
    platform: "lovable",
    domain: "medical-triage-ai-vision.lovable.dev",
    autoDeploy: true,
    branch: "main",
  },

  // Component tagging configuration
  tagging: {
    enabled: true,
    autoTag: true,
    includeComponents: [
      "src/components/**/*.tsx",
      "src/pages/**/*.tsx",
    ],
    excludeComponents: [
      "src/components/ui/**/*.tsx", // Exclude UI library components
    ],
  },

  // Analytics configuration
  analytics: {
    enabled: true,
    trackEvents: true,
    trackPageViews: true,
    trackUserInteractions: true,
  },

  // Environment variables
  env: {
    NODE_ENV: "production",
    VITE_APP_TITLE: "Medical Triage AI Vision",
    VITE_APP_VERSION: "1.0.0",
  },
};
