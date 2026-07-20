import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

let gitVersion = 'v2.4.0'
try {
  const commitCount = execSync('git rev-list --count HEAD').toString().trim()
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
  gitVersion = `v2.4.${commitCount}-${commitHash}`
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
