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

# Build in temp directory (zero downtime)
echo "Building frontend in temp directory..."
TEMP_BUILD="/tmp/laravel-admin-build-$(date +%s)"
mkdir -p "$TEMP_BUILD"
cp -r public/build/* "$TEMP_BUILD/" 2>/dev/null || true

# Build to temp location
npm install
npm run build -- --outDir "$TEMP_BUILD"

# Swap builds (atomic operation)
echo "Swapping builds..."
rm -rf public/build.old
mv public/build public/build.old || true
mv "$TEMP_BUILD" public/build

# Cleanup old backups
find /tmp -name "laravel-admin-build-*" -mtime +1 -exec rm -rf {} \; 2>/dev/null || true

# Clear & Cache
php artisan route:clear
php artisan cache:clear
php artisan route:cache

echo "Deployment completed!"
