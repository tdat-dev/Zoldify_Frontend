module.exports = {
  apps: [{
    name: 'zoldify-chat',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'development',
      SOCKET_PORT: 3001,
      CORS_ORIGIN: 'http://localhost:8000',
      DB_HOST: 'localhost',
      DB_USER: 'root',
      DB_PASS: '',
      DB_NAME: 'Zoldify'
    },
    env_production: {
      NODE_ENV: 'production',
      SOCKET_PORT: 3001,
      CORS_ORIGIN: 'https://zoldify.com,http://zoldify.com',
      DB_HOST: 'localhost',
      DB_USER: 'zoldify_user',  // Thay bằng DB user thật
      DB_PASS: 'your_password', // Thay bằng password thật
      DB_NAME: 'zoldify'        // Thay bằng DB name thật
    }
  }]
};
