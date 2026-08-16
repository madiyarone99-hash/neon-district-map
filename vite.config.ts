import { defineConfig } from 'vitest/config'
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'

const rootDir = dirname(fileURLToPath(import.meta.url))

// MapLibre 6.3 ships as two chunks (maplibre-gl.mjs + maplibre-gl-shared.mjs)
// plus a WebGL worker it resolves relative to the module URL. Bundling
// inlines the entry but the shared chunk and worker are still requested
// next to it, so copy both into dist/assets/.
function copyMapLibreWorker() {
  return {
    name: 'copy-maplibre-worker',
    closeBundle() {
      for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
        const src = join(rootDir, 'node_modules/maplibre-gl/dist', file)
        const dest = join(rootDir, 'dist/assets', file)
        mkdirSync(dirname(dest), { recursive: true })
        copyFileSync(src, dest)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), copyMapLibreWorker()],
  base: './',
  // MapLibre used to be externalized to a jsDelivr ESM build to keep this
  // bundle small enough for a single-file upload. The Pages deploy now
  // ships arbitrarily large files as checksummed parts (see
  // scripts/split-pages-parts.mjs), so bundling MapLibre from npm is the
  // more resilient choice: no runtime dependency on a third-party CDN.
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
