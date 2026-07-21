import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const pkgVersion = pkg.version || '3.1.8'
const [major] = pkgVersion.split('.')

let gitVersion = `v${pkgVersion}`
try {
  const commitCountStr = execSync('git rev-list --count HEAD').toString().trim()
  const commitCount = parseInt(commitCountStr, 10)
  if (!isNaN(commitCount)) {
    const minor = Math.floor(commitCount / 11)
    const patch = commitCount % 11
    gitVersion = `v${major}.${minor}.${patch}`
  }
} catch (e) {
  // fallback
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(gitVersion)
  }
})
