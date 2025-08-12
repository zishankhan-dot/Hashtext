import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const certsDir = path.join(process.cwd(), 'certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

try {
  // Generate self-signed certificate for localhost
  execSync(`openssl req -x509 -newkey rsa:4096 -keyout ${path.join(certsDir, 'key.pem')} -out ${path.join(certsDir, 'cert.pem')} -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, { stdio: 'inherit' });
  
  console.log('✅ HTTPS certificates generated successfully!');
  console.log('📁 Certificates saved in:', certsDir);
  console.log('🔒 You can now run your app with HTTPS locally');
} catch (error) {
  console.error('❌ Error generating certificates:', error.message);
  console.log('💡 Make sure OpenSSL is installed on your system');
  console.log('💡 Or use the simpler approach with mkcert (see package.json scripts)');
}
