# Admin Portal Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)
1. Build the project:
   ```bash
   npm run build
   ```
2. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Deploy:
   ```bash
   vercel --prod
   ```

### Option 2: Netlify
1. Build the project:
   ```bash
   npm run build
   ```
2. Drag & drop the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)

### Option 3: GitHub + Vercel
1. Push admin-portal to GitHub
2. Connect repository to Vercel
3. Auto-deploy on push

## After Deployment
You'll get a live URL like:
- `https://fresh-katale-admin.vercel.app`
- `https://amazing-name-123.netlify.app`

## Environment Variables
Set in deployment platform:
```
VITE_API_BASE_URL=https://cse-341-project1-h1kw.onrender.com
```