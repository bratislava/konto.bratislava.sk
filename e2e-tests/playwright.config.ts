import { defineConfig, devices, type ReporterDescription } from '@playwright/test'

export const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

const reporter: ReporterDescription[] = [['list'], ['html', { open: 'never' }]]
if (process.env.CI) {
  reporter.push(['junit', { outputFile: 'results/junit.xml' }])
}

export default defineConfig({
  testDir: './src',
  globalSetup: './src/global-setup.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  workers: process.env.CI ? '100%' : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter,
  /**
   * The app is started by hand: Next needs the e2e variables baked into the build, and dev server
   * versus prod build is our call, not the runner's. `command` is required by Playwright but only
   * runs when nothing answers on `url`, so it just explains itself and fails. Not the standard
   * Playwright workflow, which launches the app from here.
   */
  webServer: {
    command: `node -e "console.error('No healthy app on ${BASE_URL} — it is not running, or it is answering with 5xx. Start it with the e2e environment first, or point the suite elsewhere with E2E_BASE_URL.'); process.exit(1)"`,
    url: BASE_URL,
    reuseExistingServer: true,
  },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    video: process.env.E2E_VIDEO === 'on' ? 'on' : 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'smoke',
      grep: /@smoke/,
    },
    {
      name: 'desktop',
      grepInvert: /@smoke/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      grepInvert: /@smoke/,
      use: { ...devices['Pixel 5'] },
    },
  ],
})
