#!/bin/bash

set -e

# Navigate to project directory
cd /var/www/html/laravel-admin/

echo "Starting deployment in /var/www/html/laravel-admin/..."

# Allow composer to run as root
export COMPOSER_ALLOW_SUPERUSER=1

# Git
git fetch origin
git checkout main
git pull origin main

# Dependencies
composer install --no-interaction

# Set permissions for bootstrap and storage
echo "Setting permissions..."
chmod -R 775 bootstrap/cache
chmod -R 775 storage
chown -R www-data:www-data bootstrap/cache
chown -R www-data:www-data storage

# Build
echo "Building frontend..."
rm -rf public/build
npm install
npm run build

# Clear & Cache
php artisan route:clear
php artisan cache:clear
php artisan route:cache

# Done
echo "Deployment completed!"
