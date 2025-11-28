# 🚀 Deploy Secure You to Vercel

Complete guide to deploy your Secure You app to Vercel with backend, frontend, and mobile app support.

---

## 📋 Prerequisites

1. **GitHub Account** - To connect repository
2. **Vercel Account** - Sign up at vercel.com (free)
3. **MongoDB Atlas** - For production database
4. **Code Ready** - All changes committed to Git

---

## 🎯 Quick Deploy (3 Steps)

### Step 1: Push to GitHub

```bash
# Navigate to project root
cd Secure-You-main

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit changes
git commit -m "feat: Complete Secure You app with mobile support

- Enhanced login/register with biometric auth
- Added forgot password flow
- Created complete profile screen
- Implemented splash screen
- Added toast notifications
- Configured for Vercel deployment
- Mobile app with APK build ready"

# Create GitHub repository (via GitHub.com or CLI)
# Then add remote and push
git remote add origin https://github.com/YOUR_USERNAME/secure-you.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy Backend to Vercel

#### A. Via Vercel Dashboard (Easiest):

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Repository**
   - Select your GitHub repository
   - Choose "secure-you" repository
   - Click "Import"

3. **Configure Backend Project**
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

4. **Set Environment Variables**
   Click "Environment Variables" and add:

   | Name | Value |
   |------|-------|
   | `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/secureyou` |
   | `JWT_SECRET` | `your-super-secret-key-min-32-characters-long` |
   | `NODE_ENV` | `production` |

5. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Copy your backend URL: `https://secure-you-backend.vercel.app`

---

#### B. Via Vercel CLI (Alternative):

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy backend
cd backend
vercel --prod

# Set environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NODE_ENV

# Redeploy with environment variables
vercel --prod
```

---

### Step 3: Deploy Frontend to Vercel

#### A. Via Vercel Dashboard:

1. **Add Another Project**
   - Click "Add New" → "Project"
   - Select same repository

2. **Configure Frontend Project**
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

3. **Set Environment Variables**
   | Name | Value |
   |------|-------|
   | `REACT_APP_API_URL` | `https://secure-you-backend.vercel.app` |

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your frontend URL: `https://secure-you.vercel.app`

---

#### B. Via Vercel CLI:

```bash
# Deploy frontend
cd ../frontend
vercel --prod

# Set environment variable
vercel env add REACT_APP_API_URL
# Enter: https://secure-you-backend.vercel.app

# Redeploy
vercel --prod
```

---

## 🔧 Configuration Details

### Backend Configuration

**File**: `backend/vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

**What it does**:
- Tells Vercel to use Node.js
- Routes all requests to `server.js`
- Enables serverless functions

---

### Frontend Configuration

**File**: `frontend/.env.production`

```bash
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

**What it does**:
- Sets API endpoint for production
- Used by React app to make API calls

---

### Mobile App Configuration

**File**: `mobile-new/config/api.ts`

```typescript
const ENV = {
  prod: {
    apiUrl: 'https://secure-you-backend.vercel.app/api',
  },
};
```

**What it does**:
- Mobile app connects to production API
- No localhost in production builds

---

## 📱 Update Mobile App for Production

### Step 1: Update API URL in Mobile App

```bash
cd mobile-new

# Create .env file
echo "EXPO_PUBLIC_API_URL=https://secure-you-backend.vercel.app/api" > .env
```

### Step 2: Rebuild Mobile App

```bash
# Rebuild with production API
eas build --platform android --profile production
```

---

## 🗄️ Setup MongoDB Atlas

### Step 1: Create MongoDB Atlas Account

1. Visit: https://www.mongodb.com/cloud/atlas
2. Sign up for free tier
3. Create a cluster (takes 3-5 minutes)

### Step 2: Configure Database

1. **Create Database User**
   - Database Access → Add New Database User
   - Username: `secureyou-admin`
   - Password: Generate strong password
   - User Privileges: Read and write to any database

2. **Whitelist IP Addresses**
   - Network Access → Add IP Address
   - Select "Allow Access from Anywhere"
   - IP: `0.0.0.0/0` (for Vercel)
   - Click "Confirm"

3. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string:
   ```
   mongodb+srv://secureyou-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

4. **Update Connection String**
   - Replace `<password>` with your password
   - Replace database name with `secureyou`
   - Final: `mongodb+srv://secureyou-admin:PASSWORD@cluster0.xxxxx.mongodb.net/secureyou?retryWrites=true&w=majority`

---

## 🔐 Environment Variables Setup

### Backend (.env):

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/secureyou
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
PORT=5000
NODE_ENV=production
```

### Frontend (.env.production):

```bash
REACT_APP_API_URL=https://secure-you-backend.vercel.app
```

### Mobile (.env):

```bash
EXPO_PUBLIC_API_URL=https://secure-you-backend.vercel.app/api
```

---

## ✅ Deployment Checklist

### Before Deployment:

- ✅ MongoDB Atlas cluster created
- ✅ Database user created with password
- ✅ IP whitelist configured (0.0.0.0/0)
- ✅ Connection string copied
- ✅ JWT secret generated (32+ characters)
- ✅ Code committed to GitHub
- ✅ All environment variables ready

### Backend Deployment:

- ✅ Backend deployed to Vercel
- ✅ Environment variables set (MONGODB_URI, JWT_SECRET, NODE_ENV)
- ✅ Deployment successful (green checkmark)
- ✅ Backend URL copied
- ✅ Test API: Visit `https://your-backend.vercel.app/api/health`

### Frontend Deployment:

- ✅ Frontend deployed to Vercel
- ✅ Environment variable set (REACT_APP_API_URL)
- ✅ Deployment successful
- ✅ Frontend URL copied
- ✅ Test frontend: Visit `https://your-frontend.vercel.app`

### Mobile App:

- ✅ API URL updated in config/api.ts
- ✅ .env file created with production URL
- ✅ App rebuilt with production settings
- ✅ APK tested on device

---

## 🧪 Testing Deployment

### 1. Test Backend:

```bash
# Health check
curl https://your-backend.vercel.app/api/health

# Should return:
{
  "status": "ok",
  "message": "Secure You API is running"
}
```

### 2. Test Frontend:

1. Visit: `https://your-frontend.vercel.app`
2. Try to register a new user
3. Try to login
4. Check if contacts page loads

### 3. Test Mobile App:

1. Open app on device
2. Should connect to production API
3. Register new user
4. Login with credentials
5. Add emergency contacts

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push:

Once set up, Vercel automatically deploys:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update: feature or bugfix"
   git push origin main
   ```

2. **Vercel Auto-Deploys**:
   - Backend rebuilds automatically
   - Frontend rebuilds automatically
   - Takes 1-2 minutes
   - No manual intervention needed

3. **Get Notifications**:
   - Email on successful deployment
   - Slack integration available
   - Discord webhooks available

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain:

1. **Go to Project Settings**
   - Vercel Dashboard → Select Project
   - Settings → Domains

2. **Add Domain**:
   - Enter your domain: `secureyou.com`
   - Click "Add"

3. **Configure DNS**:
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation (5-30 minutes)

4. **SSL Certificate**:
   - Vercel automatically provisions SSL
   - HTTPS enabled automatically

---

## 📊 Monitor Deployment

### Vercel Analytics:

1. **Enable Analytics**
   - Project Settings → Analytics
   - Free tier includes basic metrics

2. **View Metrics**:
   - Page views
   - API calls
   - Error rates
   - Performance metrics

### Logs:

```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow
```

---

## 🐛 Troubleshooting

### Common Issues:

#### 1. Backend Not Connecting to MongoDB:

**Error**: `MongoServerError: Authentication failed`

**Solution**:
```bash
# Check environment variables in Vercel dashboard
# Ensure MONGODB_URI is correct
# Verify IP whitelist includes 0.0.0.0/0
# Check database user credentials
```

#### 2. Frontend Can't Connect to Backend:

**Error**: `Network request failed` or `CORS error`

**Solution**:
```bash
# Verify REACT_APP_API_URL is set correctly
# Check backend CORS settings
# Ensure backend is deployed and running
# Test backend URL manually
```

#### 3. Environment Variables Not Working:

**Solution**:
```bash
# Environment variables need redeploy to take effect
vercel --prod

# Or trigger redeploy in dashboard
# Settings → Redeploy
```

#### 4. Build Fails:

**Solution**:
```bash
# Check build logs in Vercel dashboard
# Ensure all dependencies in package.json
# Test build locally first:
npm run build
```

---

## 🚀 Deployment URLs

After successful deployment, you'll have:

### Production URLs:
- **Backend API**: `https://secure-you-backend.vercel.app`
- **Frontend Web**: `https://secure-you.vercel.app`
- **Mobile API**: Same as backend + `/api`

### Test URLs:
```bash
# Backend health
https://secure-you-backend.vercel.app/api/health

# Frontend login
https://secure-you.vercel.app/login

# API endpoints
https://secure-you-backend.vercel.app/api/users/register
https://secure-you-backend.vercel.app/api/users/login
https://secure-you-backend.vercel.app/api/contacts
```

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Expo Docs**: https://docs.expo.dev/
- **React Docs**: https://react.dev/

---

## ✨ Summary

### What You've Deployed:

1. ✅ **Backend API** - Node.js + Express + MongoDB on Vercel
2. ✅ **Frontend Web** - React app on Vercel
3. ✅ **Mobile App** - Configured to use production API

### What Happens Now:

1. ✅ **Auto-Deploy** - Every git push triggers new deployment
2. ✅ **SSL/HTTPS** - Automatic secure connections
3. ✅ **CDN** - Global content delivery
4. ✅ **Serverless** - Scales automatically
5. ✅ **Monitoring** - Built-in analytics and logs

---

**🎉 Your Secure You app is now live on Vercel!**

Share your URLs:
- **Web App**: https://secure-you.vercel.app
- **API**: https://secure-you-backend.vercel.app

---

**Created by**: GitHub Copilot  
**Last Updated**: November 2025  
**Status**: ✅ Ready for Production
