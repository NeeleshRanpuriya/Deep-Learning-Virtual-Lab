module.exports = {
  apps: [
    {
      name: 'deeplab-frontend',
      script: 'npx',
      args: 'serve dist -p 3000 -s --no-clipboard',
      cwd: '/home/user/webapp',
      env: { NODE_ENV: 'production', PORT: 3000 },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'deeplab-backend',
      script: 'python3',
      args: 'backend/main.py',
      cwd: '/home/user/webapp',
      env: { PYTHONUNBUFFERED: '1' },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    }
  ]
}
