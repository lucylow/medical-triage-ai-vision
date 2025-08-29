# 🚨 Lovable Deployment Troubleshooting Guide

## ❌ **GitHub Updates Not Showing on Lovable?**

This guide will help you fix the most common deployment issues.

## 🔍 **Step-by-Step Diagnosis**

### **1. Check GitHub Actions Status**

1. Go to your repository: `https://github.com/YOUR_USERNAME/REPO_NAME`
2. Click the **Actions** tab
3. Look for the **Deploy to Lovable** workflow
4. Check if it's:
   - ✅ **Green** (Success)
   - ❌ **Red** (Failed)
   - 🟡 **Yellow** (Running)
   - ⚪ **Gray** (Not triggered)

### **2. If Workflow is Not Running**

**Problem**: No workflow runs when you push to GitHub

**Solutions**:
- Check if you're on the correct branch (`main`, `develop`, or `master`)
- Verify the workflow file is in `.github/workflows/lovable-deploy.yml`
- Make sure the file is committed and pushed

**Check your branch:**
```bash
git branch
git status
```

### **3. If Workflow is Failing**

**Problem**: Workflow runs but fails with errors

**Common Error 1**: `LOVABLE_API_KEY` not found
```
Error: Required secret 'LOVABLE_API_KEY' not found
```

**Fix**:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `LOVABLE_API_KEY`
4. Value: Your Lovable API key from [lovable.dev/dashboard](https://lovable.dev/dashboard)

**Common Error 2**: Build fails
```
Error: npm run build:lovable failed
```

**Fix**:
1. Test locally first: `npm run build:lovable`
2. Check for TypeScript errors: `npm run lint`
3. Verify all dependencies are installed: `npm install`

### **4. If Workflow Succeeds But No Update on Lovable**

**Problem**: GitHub Actions shows success, but Lovable site is unchanged

**Solutions**:

#### **A. Check Lovable Dashboard**
1. Visit [lovable.dev/dashboard](https://lovable.dev/dashboard)
2. Look for your project: `medical-triage-ai-vision`
3. Check deployment history and status

#### **B. Verify Project Configuration**
1. Ensure your `lovable.config.js` has the correct project ID
2. Check that the domain matches: `medical-triage-ai-vision.lovable.dev`

#### **C. Manual Deployment Test**
```bash
# Test locally first
npm run build:lovable

# Then deploy manually
lovable deploy --api-key YOUR_API_KEY
```

## 🚀 **Quick Fix Commands**

### **Force a New Deployment**
```bash
# Make a small change and push
echo "# Updated at $(date)" >> README.md
git add README.md
git commit -m "Trigger deployment test"
git push origin main
```

### **Manual Workflow Trigger**
1. Go to **Actions** tab
2. Click **Deploy to Lovable**
3. Click **Run workflow**
4. Select branch and click **Run workflow**

### **Check Workflow Logs**
1. Go to the failed workflow run
2. Click on the failed job
3. Expand each step to see detailed logs
4. Look for specific error messages

## 🔧 **Environment Setup Verification**

### **Local Testing**
```bash
# 1. Test build
npm run build:lovable

# 2. Check if dist folder exists
ls -la dist/

# 3. Test Lovable CLI
lovable --version

# 4. Test deployment (if you have API key)
lovable deploy --api-key YOUR_API_KEY
```

### **Environment Variables Check**
```bash
# Check if .env.local exists
cat .env.local

# Should contain:
# LOVABLE_API_KEY=your_actual_api_key
# LOVABLE_PROJECT_ID=medical-triage-ai-vision
```

## 📋 **Checklist for Deployment Issues**

- [ ] GitHub Actions workflow exists in `.github/workflows/`
- [ ] `LOVABLE_API_KEY` secret is set in GitHub
- [ ] You're pushing to `main`, `develop`, or `master` branch
- [ ] Local build works: `npm run build:lovable`
- [ ] Lovable CLI is working: `lovable --version`
- [ ] Project ID matches in `lovable.config.js`
- [ ] Workflow is actually running (check Actions tab)
- [ ] No build errors in workflow logs

## 🆘 **Still Having Issues?**

### **1. Check Lovable Status**
- Visit [lovable.dev/status](https://lovable.dev/status)
- Check if there are any platform issues

### **2. Verify API Key**
- Go to [lovable.dev/dashboard](https://lovable.dev/dashboard)
- Check if your API key is still valid
- Generate a new API key if needed

### **3. Check Project Settings**
- Ensure your project is active in Lovable
- Verify the project domain is correct
- Check if there are any deployment restrictions

### **4. Get Help**
- **Documentation**: [lovable.dev/docs](https://lovable.dev/docs)
- **Community**: [lovable.dev/community](https://lovable.dev/community)
- **Support**: [lovable.dev/support](https://lovable.dev/support)

## 🎯 **Most Common Fix**

**90% of deployment issues are solved by:**
1. Setting the `LOVABLE_API_KEY` secret in GitHub
2. Ensuring you're on the correct branch
3. Making sure the workflow file is committed

**Try this first:**
```bash
# 1. Check your branch
git branch

# 2. Switch to main if needed
git checkout main

# 3. Make a small change
echo "# Test deployment $(date)" >> README.md

# 4. Commit and push
git add README.md
git commit -m "Test deployment"
git push origin main

# 5. Check Actions tab for workflow run
```

---

**Need immediate help?** Check the workflow logs in the Actions tab for specific error messages!
