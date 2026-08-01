const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const pkgPath = path.join(projectRoot, 'package.json');
const lockPath = path.join(projectRoot, 'package-lock.json');

// ── Read the staged commit message ──────────────────────────────────────────
function getCommitMsg() {
  try {
    // COMMIT_EDITMSG holds the current commit message being composed
    const msgFile = path.join(projectRoot, '.git', 'COMMIT_EDITMSG');
    if (fs.existsSync(msgFile)) {
      return fs.readFileSync(msgFile, 'utf8').trim();
    }
  } catch (_) {}
  return '';
}

// ── Determine SemVer bump type from Conventional Commit message ─────────────
// MAJOR  →  "BREAKING CHANGE" in body, or type ending with "!" e.g. feat!:
// MINOR  →  "feat:" or "feat(scope):"
// PATCH  →  everything else (fix, style, refactor, chore, perf, docs, test…)
function getBumpType(msg) {
  if (!msg) return 'patch';

  const firstLine = msg.split('\n')[0];

  // Breaking change: feat!: or fix!: or BREAKING CHANGE in body
  if (/^[a-z]+(\([^)]*\))?!:/.test(firstLine)) return 'major';
  if (/BREAKING[\s-]CHANGE/i.test(msg)) return 'major';

  // New feature
  if (/^feat(\([^)]*\))?:/.test(firstLine)) return 'minor';

  // Everything else is a patch
  return 'patch';
}

// ── Apply the bump ───────────────────────────────────────────────────────────
try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const [major, minor, patch] = pkg.version.split('.').map(Number);

  if ([major, minor, patch].some(isNaN)) {
    console.error('Invalid version format in package.json');
    process.exit(1);
  }

  const msg = getCommitMsg();
  const bump = getBumpType(msg);

  let newMajor = major, newMinor = minor, newPatch = patch;
  if (bump === 'major') { newMajor += 1; newMinor = 0; newPatch = 0; }
  else if (bump === 'minor') { newMinor += 1; newPatch = 0; }
  else { newPatch += 1; }

  const newVersion = `${newMajor}.${newMinor}.${newPatch}`;
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  // Keep package-lock.json in sync
  if (fs.existsSync(lockPath)) {
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    lock.version = newVersion;
    if (lock.packages && lock.packages['']) lock.packages[''].version = newVersion;
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
  }

  console.log(`Bumped version: ${major}.${minor}.${patch} → ${newVersion}  [${bump}]`);
  execSync('git add package.json package-lock.json', { cwd: projectRoot });

} catch (err) {
  console.error('Failed to bump version:', err.message);
  process.exit(1);
}
