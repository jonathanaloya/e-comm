# Deploy Admin Portal - Live Access Options

## Option 1: Vercel (Recommended - 2 minutes)

### Method A: Drag & Drop
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login
3. Click "Add New" → "Project"
4. Drag the `dist` folder to Vercel
5. Get instant URL like: `https://fresh-katale-admin-xyz.vercel.app`

### Method B: CLI
```bash
npm i -g vercel
cd admin-portal
vercel --prod
```

## Option 2: Netlify (Drag & Drop - 1 minute)
1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `dist` folder
3. Get URL like: `https://amazing-name-123.netlify.app`

## Option 3: GitHub Pages
1. Push admin-portal to GitHub
2. Go to Settings → Pages
3. Select source: GitHub Actions
4. Get URL like: `https://username.github.io/admin-portal`

## Option 4: Surge.sh (CLI - 30 seconds)
```bash
npm install -g surge
cd admin-portal/dist
surge
```

## After Deployment:
1. Update backend CORS to include your new URL
2. Test login with real credentials
3. Share the live admin portal URL

## Current Build Ready:
✅ `dist` folder is ready for deployment
✅ All assets optimized and compressed
✅ Production environment configured