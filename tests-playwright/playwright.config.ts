import { defineConfig, devices } from '@playwright/test'

export const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

/**
 * Viewports match the Cypress suite exactly (`cypress.config.ts` -> `config.expose.resolution`).
 *
 * Deliberately viewport-only, not `devices['Pixel 5']`: the Cypress suite only ever changed the
 * viewport, and the app branches on the Tailwind `lg:` breakpoint (1024px). Adding touch emulation
 * and a mobile user agent would change behaviour and make the port unfaithful. Real device
 * emulation is worth adding later as new coverage, not as part of the migration.
 */
export const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 360, height: 640 },
} as const

export default defineConfig({
  testDir: './src/specs',
  globalSetup: './src/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 4 : 6,
  retries: process.env.CI ? 1 : 0,
  // The heaviest form scenarios fill ~100 fields across 8 steps and upload through the real backend
  // (forms-backend + ClamAV). `Example5NoCalculators` alone takes ~60s uncontended, and running the
  // legacy and engine form suites together multiplies that, so 120s was not enough.
  timeout: 180_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'results/junit.xml' }],
  ],
  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    // Set E2E_VIDEO=on to also record passing tests, which is useful for reviewing a flow.
    video: process.env.E2E_VIDEO === 'on' ? 'on' : 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Request-only: no browser is launched at all.
    {
      name: 'smoke',
      testDir: './src/specs/legacy/smoke',
    },
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: VIEWPORTS.desktop },
    },
    {
      name: 'desktop',
      dependencies: ['setup'],
      testIgnore: ['**/smoke/**'],
      use: { ...devices['Desktop Chrome'], viewport: VIEWPORTS.desktop },
    },
    {
      name: 'mobile',
      dependencies: ['setup'],
      testIgnore: ['**/smoke/**'],
      use: { ...devices['Desktop Chrome'], viewport: VIEWPORTS.mobile },
    },
  ],
})
