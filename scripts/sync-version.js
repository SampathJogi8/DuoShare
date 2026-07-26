import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const pkgPath = path.join(projectRoot, 'package.json');
const lockPath = path.join(projectRoot, 'package-lock.json');
const gradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle');

try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const version = pkg.version;
  const parts = version.split('.').map(Number);

  if (parts.length < 3 || parts.some(isNaN)) {
    console.error('Invalid SemVer format in package.json:', version);
    process.exit(1);
  }

  // 1. Sync package-lock.json
  if (fs.existsSync(lockPath)) {
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    lock.version = version;
    if (lock.packages && lock.packages['']) {
      lock.packages[''].version = version;
    }
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
    console.log(`✓ Synced package-lock.json -> ${version}`);
  }

  // 2. Sync Android build.gradle
  if (fs.existsSync(gradlePath)) {
    let gradleContent = fs.readFileSync(gradlePath, 'utf8');
    const [major, minor, patch] = parts;
    const versionCode = (major * 10000) + (minor * 100) + patch;

    gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
    gradleContent = gradleContent.replace(/versionName\s+"[^"]+"/, `versionName "${version}"`);

    fs.writeFileSync(gradlePath, gradleContent, 'utf8');
    console.log(`✓ Synced android/app/build.gradle -> versionName "${version}", versionCode ${versionCode}`);
  }

  console.log(`🚀 Version sync complete for v${version}`);
} catch (error) {
  console.error('Failed to sync versions:', error.message);
  process.exit(1);
}
