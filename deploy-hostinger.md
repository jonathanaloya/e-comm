# Hostinger VPS Deployment Guide

## Prerequisites
- Hostinger VPS with Ubuntu/CentOS
- Domain name pointed to your VPS IP
- SSH access to your VPS

## Step 1: Connect to VPS
```bash
ssh root@your-vps-ip
```

## Step 2: Install Required Software
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install Git
apt install git -y
```

## Step 3: Clone Your Repository
```bash
cd /var/www
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

## Step 4: Setup Backend
```bash
# Install backend dependencies
npm install

# Create production environment file
cp .env.example .env
nano .env
```

Update .env with production values:
```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-domain.com
PORT=3001
NODE_ENV=production
```

## Step 5: Setup Frontend (Main App)
```bash
cd groceries
npm install
npm run build
cd ..
```

## Step 6: Setup Admin Portal
```bash
cd admin-portal

# Update .env for production
echo "VITE_API_BASE_URL=https://your-domain.com" > .env

# Install dependencies and build
npm install
npm run build
cd ..
```

## Step 7: Configure PM2 (Process Manager)
Create ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'ecommerce-backend',
    script: 'server.js',
    cwd: '/var/www/your-repo',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
```

Start backend:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 8: Configure Nginx

Create Nginx configuration:
```bash
nano /etc/nginx/sites-available/your-domain
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Main frontend app
    location / {
        root /var/www/your-repo/groceries/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Admin portal
    location /admin {
        alias /var/www/your-repo/admin-portal/dist;
        try_files $uri $uri/ /admin/index.html;
        index index.html;
    }

    # API routes
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/your-domain /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Step 9: Setup SSL (Optional but Recommended)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Step 10: Setup Auto-Deployment (Optional)
Create deployment script:
```bash
nano /var/www/deploy.sh
```

```bash
#!/bin/bash
cd /var/www/your-repo

# Pull latest changes
git pull origin main

# Update backend
npm install

# Update frontend
cd groceries
npm install
npm run build
cd ..

# Update admin portal
cd admin-portal
npm install
npm run build
cd ..

# Restart backend
pm2 restart ecommerce-backend

echo "Deployment completed!"
```

Make executable:
```bash
chmod +x /var/www/deploy.sh
```

## Access Your Applications
- Main App: https://your-domain.com
- Admin Portal: https://your-domain.com/admin
- API: https://your-domain.com/api

## Troubleshooting Commands
```bash
# Check PM2 status
pm2 status
pm2 logs

# Check Nginx status
systemctl status nginx
nginx -t

# Check application logs
tail -f /var/log/nginx/error.log
```

## Important Notes
1. Replace `your-domain.com` with your actual domain
2. Update MongoDB connection string in .env
3. Make sure your domain DNS points to VPS IP
4. Admin portal will be accessible at /admin path
5. Use PM2 to keep backend running