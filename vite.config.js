import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const baseVersion = pkg.version || '3.1.8'

let gitVersion = `v${baseVersion}`
try {
  const commitCount = execSync('git rev-list --count HEAD').toString().trim()
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
  gitVersion = `v${baseVersion}-${commitCount}-${commitHash}`
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
