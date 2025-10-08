module.exports = {
  apps: [{
    name: 'ecommerce-backend',
    script: 'server.js',
    cwd: '/var/www/e-comm',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/ecommerce-error.log',
    out_file: '/var/log/pm2/ecommerce-out.log',
    log_file: '/var/log/pm2/ecommerce-combined.log'
  }]
}