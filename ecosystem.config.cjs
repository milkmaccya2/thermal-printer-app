module.exports = {
  apps: [{
    name: "thermal-printer-app",
    script: "./dist/server/entry.mjs",
    interpreter: "node",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
      PORT: 4321,
      HOST: "0.0.0.0"
    }
  }]
};
