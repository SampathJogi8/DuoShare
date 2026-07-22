const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const pkgPath = path.join(projectRoot, 'package.json');
const lockPath = path.join(projectRoot, 'package-lock.json');

try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const parts = pkg.version.split('.').map(Number);
  
  if (parts.length === 3 && !parts.some(isNaN)) {
    parts[2] += 1; // Increment the patch number
    pkg.version = parts.join('.');
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    
    if (fs.existsSync(lockPath)) {
      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
      lock.version = pkg.version;
      if (lock.packages && lock.packages['']) {
        lock.packages[''].version = pkg.version;
      }
      fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
    }
    
    console.log(`Bumped version to ${pkg.version}`);
    execSync('git add package.json package-lock.json', { cwd: projectRoot });
  } else {
    console.error('Invalid version format in package.json');
    process.exit(1);
  }
} catch (error) {
  console.error('Failed to bump version:', error.message);
  process.exit(1);
}
