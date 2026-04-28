#!/bin/bash

set -e

# Navigate to project directory
cd /var/www/html/

echo "Starting deployment in /var/www/html/..."

# Git
git fetch origin
git checkout main
git pull origin main

# Dependencies
composer install
npm install

# Build
npm run build

# Clear & Cache
php artisan route:clear
php artisan cache:clear
php artisan route:cache

# Done
echo "Deployment completed!"
