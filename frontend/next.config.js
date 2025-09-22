/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use a different build dir to avoid OneDrive locks on .next
  distDir: '.next-dev',
  // Disable file tracing that creates the trace file
  outputFileTracing: false,
  experimental: {
    
  },
};

module.exports = nextConfig;
