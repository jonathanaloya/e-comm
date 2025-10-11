#!/bin/bash

# Emergency fix for missing assets
echo "Checking file permissions and locations..."

# Check if files exist
ls -la /var/www/e-comm/groceries/dist/assets/

# Fix permissions
chown -R www-data:www-data /var/www/e-comm/groceries/dist/
chmod -R 755 /var/www/e-comm/groceries/dist/

# Create simple nginx config
cat > /etc/nginx/sites-available/freshkatale.com << 'EOF'
server {
    listen 80;
    server_name freshkatale.com www.freshkatale.com;
    root /var/www/e-comm/groceries/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        alias /var/www/e-comm/groceries/dist/assets/;
        expires 1d;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Test and reload nginx
nginx -t && systemctl reload nginx

echo "Fix applied. Testing..."
curl -I http://freshkatale.com/assets/index-1e971076.js