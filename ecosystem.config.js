module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'npm',
      args: 'run build',
      env: {
        NODE_ENV: 'production',
      },
      watch: false,
      ignore_watch: ['node_modules', 'dist'],
    },
    {
      name: 'laravel-app',
      script: './artisan',
      args: 'serve --host=0.0.0.0 --port=8000',
      env: {
        APP_ENV: 'production',
      },
      watch: false,
      ignore_watch: ['node_modules', 'storage'],
    },
  ],
};
