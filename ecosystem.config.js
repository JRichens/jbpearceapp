module.exports = {
  apps: [
    {
      name: "jbpearceapp",
      script: "npm",
      args: "start",
      watch: true,
      env: {
        NODE_ENV: "production", // Set your node environment
        PORT: 3000, // You can specify the port here if your app uses a different one
        // Add any other environment variables if needed
      },
    },
  ],
}
