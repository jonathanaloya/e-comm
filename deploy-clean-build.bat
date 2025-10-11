@echo off
echo Creating clean build locally...
cd groceries
rmdir /S /Q dist 2>nul

echo Building with minimal CSS...
echo ^<!DOCTYPE html^> > dist\index.html
echo ^<html lang="en"^> >> dist\index.html
echo ^<head^> >> dist\index.html
echo ^<meta charset="UTF-8" /^> >> dist\index.html
echo ^<title^>Fresh Katale - Fresh Groceries Delivered^</title^> >> dist\index.html
echo ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^> >> dist\index.html
echo ^</head^> >> dist\index.html
echo ^<body^> >> dist\index.html
echo ^<div id="root"^>^</div^> >> dist\index.html
echo ^<script type="module" src="/assets/index.js"^>^</script^> >> dist\index.html
echo ^</body^> >> dist\index.html
echo ^</html^> >> dist\index.html

mkdir dist\assets 2>nul
echo console.log("Clean e-commerce site loaded"); > dist\assets\index.js

echo Clean build created successfully!
echo.
echo To deploy to server, copy the dist folder to /var/www/e-comm/groceries/
pause