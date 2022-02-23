module.exports = {
  // pm2 设置lifecycle management和自动重启。
  apps : [{
    name: "releases",
    script: './build/server/index.js',
    watch: true,
    env: {
      NODE_ENV: "development",
      NODE_TLS_REJECT_UNAUTHORIZED: '0'
    },
    env_production: {
      NODE_ENV: "production",
      NODE_TLS_REJECT_UNAUTHORIZED: '0'
    },
    // log_date_format: "YYYY-MM-DD HH:mm Z",
    // out_file: "./logs/output.log",
    // error_file: "./logs/error.log",
    max_memory_restart: "200M",
    interpreter: "./node_modules/.bin/ts-node"
  }]
  // deploy : {
  //   production : {
  //     user : 'SSH_USERNAME',
  //     host : 'SSH_HOSTMACHINE',
  //     ref  : 'origin/master',
  //     repo : 'GIT_REPOSITORY',
  //     path : 'DESTINATION_PATH',
  //     'pre-deploy-local': '',
  //     'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
  //     'pre-setup': ''
  //   }
  // }
};
