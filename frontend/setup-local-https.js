import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const certsDir = path.join(process.cwd(), 'certs');

console.log('🔧 Setting up HTTPS for local development...\n');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

// Check if mkcert is available
function checkMkcert() {
  try {
    execSync('mkcert -version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Method 1: Try mkcert (best option - trusted certificates)
if (checkMkcert()) {
  try {
    console.log('✅ Using mkcert to generate trusted certificates...');
    
    // Generate certificates for localhost
    execSync(`mkcert -key-file ${path.join(certsDir, 'key.pem')} -cert-file ${path.join(certsDir, 'cert.pem')} localhost 127.0.0.1 ::1`, 
      { stdio: 'inherit', cwd: certsDir });
    
    // Update vite config to use the certificates
    updateViteConfig(true);
    
    console.log('\n🎉 Success! Trusted HTTPS certificates generated.');
    console.log('📁 Certificates saved in:', certsDir);
    console.log('🚀 Run "npm run dev:https" to start with HTTPS');
    
  } catch (error) {
    console.error('❌ Error with mkcert:', error.message);
    fallbackToOpenSSL();
  }
} else {
  console.log('ℹ️  mkcert not found. Install it for trusted certificates:');
  console.log('   Windows: choco install mkcert (or download from GitHub)');
  console.log('   macOS: brew install mkcert');
  console.log('   Linux: apt install mkcert / yum install mkcert\n');
  
  fallbackToOpenSSL();
}

function fallbackToOpenSSL() {
  console.log('🔄 Falling back to OpenSSL...');
  
  try {
    // Generate self-signed certificate with OpenSSL
    const keyPath = path.join(certsDir, 'key.pem');
    const certPath = path.join(certsDir, 'cert.pem');
    
    execSync(`openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=US/ST=Dev/L=Local/O=DevCert/CN=localhost"`, 
      { stdio: 'inherit' });
    
    updateViteConfig(true);
    
    console.log('\n⚠️  Self-signed certificates generated.');
    console.log('📁 Certificates saved in:', certsDir);
    console.log('🔒 You\'ll need to accept the security warning in your browser');
    console.log('🚀 Run "npm run dev:https" to start with HTTPS');
    
  } catch (error) {
    console.error('❌ Error with OpenSSL:', error.message);
    console.log('\n💡 Alternative: Run without HTTPS for local development');
    console.log('   Use "npm run dev" for HTTP (recommended for local development)');
    updateViteConfig(false);
  }
}

function updateViteConfig(enableHttps) {
  const viteConfigPath = path.join(process.cwd(), 'vite.config.js');
  
  let config;
  if (enableHttps) {
    config = `// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    https: process.env.DEV_HTTPS === 'true' ? {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/cert.pem')),
    } : false,
    host: true
  }
});
`;
  } else {
    config = `// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    https: false, // Use HTTP for local development
    host: true
  }
});
`;
  }
  
  fs.writeFileSync(viteConfigPath, config);
}
