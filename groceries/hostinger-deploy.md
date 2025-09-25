# Hostinger Deployment Guide

## Prerequisites
- Hostinger hosting account with Node.js support
- Domain configured

## Deployment Steps

### 1. Build the Project
```bash
npm run build
```

### 2. Upload Files
Upload the entire `dist` folder contents to your Hostinger `public_html` directory:
- All files from `dist/` folder
- Include the `.htaccess` file

### 3. Backend Deployment
Your Node.js backend needs to be deployed separately:
- Use Hostinger's Node.js hosting
- Upload backend files to a separate directory
- Update environment variables
- Update API base URL in frontend

### 4. Environment Variables
Update your frontend API base URL:
```javascript
// In SummaryApi.js
export const baseURL = "https://your-backend-domain.com"
```

### 5. Database
- Use Hostinger's MySQL/MongoDB
- Update connection strings in backend
- Import your database

## File Structure on Hostinger
```
public_html/
├── index.html
├── assets/
├── .htaccess
├── manifest.json
├── logo.jpg
└── sw.js
```

## Important Notes
- ✅ Frontend: Works perfectly on Hostinger
- ⚠️ Backend: Requires Node.js hosting plan
- ✅ Database: MySQL/MongoDB supported
- ✅ SSL: Available with Hostinger
- ✅ Custom domain: Supported

## Alternative: Static + External API
If you don't have Node.js hosting:
- Deploy frontend to Hostinger
- Keep backend on Render/Railway/Heroku
- Update CORS settings for cross-origin requests