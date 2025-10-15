#!/bin/bash

# Deploy clean build to Hostinger server
echo "Deploying clean e-commerce build to server..."

# Server details
SERVER="root@srv1045306"
REMOTE_PATH="/var/www/e-comm/groceries"
LOCAL_BUILD="./groceries/dist"

# Backup current build
ssh $SERVER "cd $REMOTE_PATH && cp -r dist dist_backup_$(date +%Y%m%d_%H%M%S)"

# Upload clean build
scp -r $LOCAL_BUILD/* $SERVER:$REMOTE_PATH/dist/

# Restart nginx
ssh $SERVER "systemctl reload nginx"

echo "Clean build deployed successfully!"
echo "Main site should now show e-commerce interface instead of admin portal"