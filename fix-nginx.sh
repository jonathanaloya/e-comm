#!/bin/bash

# Fix nginx configuration issues
echo "Checking nginx configuration..."

# Test nginx config
nginx -t

# If config test fails, check common issues
if [ $? -ne 0 ]; then
    echo "Nginx config has errors. Checking common issues..."
    
    # Check for syntax errors in site configs
    nginx -T | grep -i error
    
    # Check if config files exist
    ls -la /etc/nginx/sites-available/
    ls -la /etc/nginx/sites-enabled/
    
    # Check for duplicate server blocks
    grep -r "server_name freshkatale.com" /etc/nginx/sites-available/
fi

# Restart nginx service completely
systemctl stop nginx
sleep 2
systemctl start nginx
systemctl status nginx