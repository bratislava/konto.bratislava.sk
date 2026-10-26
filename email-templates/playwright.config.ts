import { defineConfig, type Project } from '@playwright/test'

const engines = ['chromium', 'webkit'] as const
const viewportWidths = { desktop: 800, mobile: 360 } as const
const colorSchemes = ['light', 'dark'] as const

/**
 * Screenshots match pixel for pixel only inside the Docker test image (same browser builds and
 * system fonts as CI), so the screenshot projects exist only where the image sets
 * `EMAIL_TEMPLATES_SCREENSHOTS`. Anywhere else, only the `markup` project runs.
 */
const screenshotProjects: Project[] = process.env.EMAIL_TEMPLATES_SCREENSHOTS
  ? engines.flatMap((engine) =>
      Object.entries(viewportWidths).flatMap(([viewport, width]) =>
        colorSchemes.map((colorScheme) => ({
          name: `${engine}-${viewport}-${colorScheme}`,
          testMatch: 'screenshots.spec.ts',
          use: {
            browserName: engine,
            viewport: { width, height: 600 },
            deviceScaleFactor: 1,
            colorScheme,
          },
        })),
      ),
    )
  : []

export default defineConfig({
  testDir: './tests',
  // One file per email, example and project, without Playwright's default OS suffix: the
  // screenshots are always taken in the same Linux image.
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // In CI a missing snapshot is a failure, not something to write.
  updateSnapshots: process.env.CI ? 'none' : 'missing',
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: { maxDiffPixels: 0, animations: 'disabled', caret: 'hide' },
  },
  projects: [{ name: 'markup', testIgnore: 'screenshots.spec.ts' }, ...screenshotProjects],
})
