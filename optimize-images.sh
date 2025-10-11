#!/bin/bash

# Optimize large images in the dist folder
cd /var/www/e-comm/groceries/dist/assets/

echo "Original image sizes:"
ls -lah banner-7f28527d.jpg mob-f7a86e59.jpg

# Create backups
cp banner-7f28527d.jpg banner-7f28527d.jpg.backup
cp mob-f7a86e59.jpg mob-f7a86e59.jpg.backup

# Compress images (requires imagemagick)
convert banner-7f28527d.jpg -quality 75 -resize 1920x1080\> banner-7f28527d.jpg
convert mob-f7a86e59.jpg -quality 75 -resize 800x600\> mob-f7a86e59.jpg

echo "Optimized image sizes:"
ls -lah banner-7f28527d.jpg mob-f7a86e59.jpg

echo "Image optimization complete!"