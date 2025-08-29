# Medical Triage AI Vision - Lovable Deployment Guide

This guide will help you deploy your Medical Triage AI Vision application to the Lovable platform.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Lovable CLI** - Install globally:
   ```bash
   npm install -g @lovable/cli
   ```

### 1. Setup Lovable Account

1. Visit [lovable.dev](https://lovable.dev)
2. Sign up for an account
3. Create a new project
4. Get your API key from the dashboard

### 2. Configure Environment

1. Copy your Lovable API key
2. Update the `vite.config.ts` file with your API key:
   ```typescript
   componentTagger({
     projectId: "your-project-id",
     apiKey: "your-api-key-here",
     enableTagging: true,
     enableAnalytics: true,
   }),
   ```

### 3. Deploy to Lovable

#### Option A: Using the deployment script (Recommended)

**Windows:**
```bash
deploy-lovable.bat
```

**Linux/Mac:**
```bash
chmod +x deploy-lovable.sh
./deploy-lovable.sh
```

#### Option B: Manual deployment

```bash
# Build the application
npm run build:lovable

# Deploy to Lovable
lovable deploy
```

#### Option C: Using npm scripts

```bash
npm run deploy:lovable
```

## 📁 Project Structure

```
demo-app-VISION-TRACK/
├── src/                    # Source code
├── public/                 # Static assets
├── dist/                   # Build output
├── vite.config.ts          # Vite configuration with Lovable
├── lovable.config.js       # Lovable configuration
├── deploy-lovable.sh       # Linux/Mac deployment script
├── deploy-lovable.bat      # Windows deployment script
└── package.json            # Project dependencies and scripts
```

## ⚙️ Configuration Files

### vite.config.ts
The main Vite configuration file with Lovable integration:
- Component tagging enabled
- Analytics tracking enabled
- Production build optimization
- Source maps for debugging

### lovable.config.js
Lovable-specific configuration:
- Project metadata
- Build settings
- Deployment options
- Component tagging rules

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:lovable` - Build optimized for Lovable
- `npm run deploy:lovable` - Build and deploy to Lovable
- `npm run start:lovable` - Start Lovable development server
- `npm run tag:components` - Tag components for Lovable

## 🌐 Deployment URL

After successful deployment, your app will be available at:
```
https://medical-triage-ai-vision.lovable.dev
```

## 📊 Monitoring and Analytics

1. **Dashboard**: Visit [lovable.dev/dashboard](https://lovable.dev/dashboard)
2. **Analytics**: View user interactions, page views, and performance metrics
3. **Component Tracking**: Monitor component usage and performance
4. **Error Tracking**: Get real-time error reports and stack traces

## 🚨 Troubleshooting

### Common Issues

1. **Build fails**
   - Check Node.js version (requires v18+)
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript errors: `npm run lint`

2. **Deployment fails**
   - Verify Lovable CLI is installed: `lovable --version`
   - Check API key configuration
   - Ensure you're in the project root directory

3. **Components not tagging**
   - Verify componentTagger is enabled in vite.config.ts
   - Check lovable.config.js component inclusion rules
   - Ensure components are in the correct directories

### Getting Help

- **Documentation**: [lovable.dev/docs](https://lovable.dev/docs)
- **Community**: [lovable.dev/community](https://lovable.dev/community)
- **Support**: [lovable.dev/support](https://lovable.dev/support)

## 🔄 Continuous Deployment

To enable automatic deployments:

1. Connect your GitHub repository to Lovable
2. Configure branch-based deployments
3. Set up webhooks for automatic deployment on push

## 📈 Performance Optimization

The build configuration includes:
- Code splitting for better loading performance
- Vendor chunk optimization
- Source maps for debugging
- Production-ready optimizations

## 🔒 Security

- Environment variables are not committed to version control
- API keys should be stored securely
- Production builds exclude development dependencies

## 🎯 Next Steps

After deployment:
1. Test all functionality on the live site
2. Monitor performance metrics
3. Set up error tracking alerts
4. Configure custom domain (optional)
5. Set up monitoring and analytics dashboards

---

**Need help?** Check the [Lovable documentation](https://lovable.dev/docs) or reach out to the community!
