# Fresh Katale - Complete Deployment Guide

## 🔧 Environment Variables Setup

### Backend (.env) - Required Variables
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/freshkatale

# JWT Secrets
SECRET_KEY_ACCESS_TOKEN=your_super_secret_access_token_key_here
SECRET_KEY_REFRESH_TOKEN=your_super_secret_refresh_token_key_here

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
ADMIN_EMAIL=admin@freshkatale.com

# Flutterwave Payment
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-public-key
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-secret-key
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Server Configuration
NODE_ENV=production
PORT=5000
```

### Frontend (.env) - Required Variables
```env
# API Configuration
VITE_API_BASE_URL=https://your-backend-url.com

# Google Services
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# App Configuration
VITE_APP_NAME=Fresh Katale
VITE_APP_VERSION=1.0.0
```

## 📱 Google Play Store Deployment

### Prerequisites & Requirements

#### 1. Google Play Console Account
- **Website**: https://play.google.com/console
- **Cost**: $25 one-time registration fee
- **Requirements**: Google account, valid payment method

#### 2. Development Tools
- **Android Studio**: https://developer.android.com/studio
- **Java Development Kit (JDK)**: Version 11 or higher
- **Node.js**: Version 16 or higher

#### 3. Required Assets
- **App Icon**: 512x512px PNG (adaptive icon recommended)
- **Feature Graphic**: 1024x500px
- **Screenshots**: 2-8 phone screenshots, 1-8 tablet screenshots
- **Privacy Policy**: Publicly accessible URL
- **Terms of Service**: Publicly accessible URL

### Step-by-Step Mobile App Deployment

#### Step 1: Install Dependencies
```bash
cd groceries
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/splash-screen @capacitor/status-bar
npm install @capacitor/push-notifications @capacitor/geolocation
```

#### Step 2: Build React App
```bash
npm run build
```

#### Step 3: Initialize Capacitor
```bash
npx cap init "Fresh Katale" "com.freshkatale.app"
```

#### Step 4: Add Android Platform
```bash
npx cap add android
npx cap copy
npx cap sync
```

#### Step 5: Configure Android App
Edit `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

#### Step 6: Build APK/AAB
```bash
npx cap open android
```
In Android Studio:
1. Build → Generate Signed Bundle/APK
2. Choose Android App Bundle (AAB) - recommended
3. Create/use existing keystore
4. Build release version

#### Step 7: Google Play Console Setup
1. **Create App**:
   - App name: "Fresh Katale"
   - Default language: English
   - App type: App
   - Free or paid: Free

2. **Store Listing**:
   - Short description: "Fresh groceries delivered to your door in Uganda"
   - Full description: Detailed app features and benefits
   - App icon: 512x512px
   - Feature graphic: 1024x500px
   - Screenshots: Phone and tablet screenshots

3. **Content Rating**:
   - Complete questionnaire (likely "Everyone" rating)

4. **App Content**:
   - Privacy Policy: https://your-domain.com/privacy-policy
   - Terms of Service: https://your-domain.com/terms-of-service

5. **Release**:
   - Upload AAB file
   - Release notes
   - Submit for review

### Required Services & Accounts

#### Google Services
- **Google Play Console**: https://play.google.com/console ($25)
- **Google Maps Platform**: https://cloud.google.com/maps-platform (Free tier available)
- **reCAPTCHA**: https://www.google.com/recaptcha (Free)

#### Payment Processing
- **Flutterwave**: https://flutterwave.com
  - Business verification required
  - Integration documentation: https://developer.flutterwave.com

#### Cloud Services
- **MongoDB Atlas**: https://www.mongodb.com/atlas (Free tier available)
- **Cloudinary**: https://cloudinary.com (Free tier available)

## 🌐 Website Deployment

### Current Setup (Already Deployed)
- **Frontend**: Vercel (https://e-comm-rho-five.vercel.app)
- **Backend**: Render (https://cse-341-project1-h1kw.onrender.com)

### Alternative Hosting Options

#### Option 1: Vercel + Render (Current - Recommended)
**Frontend (Vercel)**:
- **Website**: https://vercel.com
- **Cost**: Free tier available
- **Setup**: Connect GitHub repository, auto-deploy on push

**Backend (Render)**:
- **Website**: https://render.com
- **Cost**: Free tier available (with limitations)
- **Setup**: Connect GitHub repository, set environment variables

#### Option 2: Netlify + Railway
**Frontend (Netlify)**:
- **Website**: https://netlify.com
- **Cost**: Free tier available
- **Setup**: Drag & drop or Git integration

**Backend (Railway)**:
- **Website**: https://railway.app
- **Cost**: $5/month after free tier
- **Setup**: GitHub integration, automatic deployments

#### Option 3: AWS (Advanced)
**Frontend (S3 + CloudFront)**:
- **Website**: https://aws.amazon.com
- **Cost**: Pay-as-you-go (typically $1-5/month for small apps)
- **Setup**: S3 bucket + CloudFront distribution

**Backend (EC2 + RDS)**:
- **Cost**: $10-50/month depending on usage
- **Setup**: EC2 instance + RDS database

### Domain & SSL Setup

#### Custom Domain
1. **Purchase Domain**:
   - **Namecheap**: https://namecheap.com
   - **GoDaddy**: https://godaddy.com
   - **Google Domains**: https://domains.google

2. **DNS Configuration**:
   - Point A record to hosting provider IP
   - Or CNAME to hosting provider URL

3. **SSL Certificate**:
   - Automatic with Vercel/Netlify
   - Let's Encrypt for custom setups

### Required Environment Variables by Service

#### MongoDB Atlas
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```
**Setup**: https://www.mongodb.com/atlas
1. Create cluster
2. Create database user
3. Whitelist IP addresses
4. Get connection string

#### Cloudinary
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
**Setup**: https://cloudinary.com
1. Create account
2. Get credentials from dashboard

#### Flutterwave
```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-key
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-key
```
**Setup**: https://flutterwave.com
1. Create business account
2. Complete KYC verification
3. Get API keys from settings

#### Google Maps
```env
VITE_GOOGLE_MAPS_API_KEY=your-api-key
```
**Setup**: https://console.cloud.google.com
1. Create project
2. Enable Maps JavaScript API
3. Enable Geocoding API
4. Create API key
5. Restrict API key to your domain

#### Email Service (Gmail)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```
**Setup**:
1. Enable 2-factor authentication
2. Generate app-specific password
3. Use app password in EMAIL_PASS

### Security Checklist

#### Production Environment Variables
- [ ] Strong JWT secrets (64+ characters)
- [ ] Secure database credentials
- [ ] API keys restricted to domains
- [ ] HTTPS enabled
- [ ] CORS configured properly

#### App Store Requirements
- [ ] Privacy Policy page accessible
- [ ] Terms of Service page accessible
- [ ] App icons in all required sizes
- [ ] Screenshots for all device types
- [ ] Content rating completed
- [ ] App signed with release keystore

### Cost Breakdown

#### Free Tier (Recommended for Starting)
- **Vercel**: Free (hobby plan)
- **Render**: Free (with sleep mode)
- **MongoDB Atlas**: Free (512MB)
- **Cloudinary**: Free (25GB storage)
- **Google Maps**: $200 free credit monthly
- **Total**: $0/month

#### Paid Tier (For Production)
- **Vercel Pro**: $20/month
- **Render**: $7/month (no sleep)
- **MongoDB Atlas**: $9/month (shared cluster)
- **Cloudinary**: $89/month (advanced plan)
- **Domain**: $10-15/year
- **Google Play**: $25 one-time
- **Total**: ~$125/month + $25 one-time

### Monitoring & Analytics

#### Essential Tools
- **Google Analytics**: https://analytics.google.com
- **Google Search Console**: https://search.google.com/search-console
- **Sentry** (Error tracking): https://sentry.io
- **Uptime monitoring**: https://uptimerobot.com

### Backup & Security

#### Database Backup
- MongoDB Atlas: Automatic backups included
- Manual exports recommended weekly

#### Security Monitoring
- Regular dependency updates
- Security headers configured
- Rate limiting enabled
- Input validation implemented

### Support & Maintenance

#### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor error logs weekly
- [ ] Backup database weekly
- [ ] Review analytics monthly
- [ ] Update content as needed

#### Emergency Contacts
- **Hosting Support**: Vercel/Render support
- **Payment Issues**: Flutterwave support
- **Domain Issues**: Domain registrar support

This guide covers everything needed to deploy Fresh Katale as both a mobile app and website with all required services and configurations.