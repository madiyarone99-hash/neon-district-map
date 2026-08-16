/* Visual QA harness: serves dist/ and captures key states (themes, selections). */
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(fileURLToPath(import.meta.url), '../..')
const dist = join(root, 'dist')
const outDir = join(root, 'qa-shots')
mkdirSync(outDir, { recursive: true })

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  let path = join(dist, decodeURIComponent(url.pathname))
  if (url.pathname.endsWith('/')) path = join(path, 'index.html')
  if (!existsSync(path)) {
    res.writeHead(404)
    res.end('nope')
    return
  }
  res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' })
  res.end(readFileSync(path))
})

await new Promise((resolve) => server.listen(0, resolve))
const port = server.address().port
const base = `http://localhost:${port}/`

const browser = await chromium.launch()

const scenarios = [
  { name: 'iphone-dark', viewport: { width: 390, height: 844 }, dark: true, action: null },
  { name: 'iphone-light', viewport: { width: 390, height: 844 }, dark: false, action: null },
  { name: 'promax-dark', viewport: { width: 430, height: 932 }, dark: true, action: null },
  {
    name: 'iphone-dark-selected',
    viewport: { width: 390, height: 844 },
    dark: true,
    action: 'select-project',
  },
  {
    name: 'iphone-dark-timeline',
    viewport: { width: 390, height: 844 },
    dark: true,
    action: 'expand-timeline',
  },
  {
    name: 'iphone-dark-filters',
    viewport: { width: 390, height: 844 },
    dark: true,
    action: 'open-filters',
  },
]

for (const scenario of scenarios) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.dark ? 'dark' : 'light',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('response', (response) => {
    if (response.status() === 404) errors.push(`404: ${response.url()}`)
  })
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  // Wait for the app to signal that data + style are both up.
  await page.waitForFunction(() => !document.querySelector('.status-banner'), { timeout: 30_000 })
  await page.waitForTimeout(1200)

  if (scenario.action === 'select-project') {
    await page.mouse.click(195, 400)
    await page.waitForTimeout(800)
  } else if (scenario.action === 'expand-timeline') {
    await page.click('.timeline-summary')
    await page.waitForTimeout(500)
  } else if (scenario.action === 'open-filters') {
    await page.click('.control-strip-main')
    await page.waitForTimeout(500)
  }

  await page.screenshot({ path: join(outDir, `${scenario.name}.png`) })
  console.log(`[${scenario.name}] errors: ${errors.length ? errors.join(' | ') : 'none'}`)
  await context.close()
}

await browser.close()
server.close()
console.log(`shots in ${outDir}`)
