const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['fs-extra', 'pdf-parse'],
  outputFileTracingRoot: path.join(__dirname, '../'),
};

module.exports = nextConfig;
