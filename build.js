const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- SmartBasket Universal Build Runner ---');
console.log('Current working directory:', process.cwd());

if (fs.existsSync(path.join(process.cwd(), 'frontend'))) {
  console.log('Detected root directory. Building frontend...');
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
  
  const frontendDist = path.join(process.cwd(), 'frontend', 'dist');
  const rootDist = path.join(process.cwd(), 'dist');
  if (fs.existsSync(frontendDist)) {
    console.log('Copying frontend/dist to root dist for Vercel...');
    fs.cpSync(frontendDist, rootDist, { recursive: true });
  }
} else {
  console.log('Detected frontend directory. Building directly...');
  execSync('npm run build', { stdio: 'inherit' });
}

console.log('Build completed successfully!');
