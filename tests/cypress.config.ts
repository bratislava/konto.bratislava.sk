import { defineConfig } from 'cypress'
import { initPlugin as cypressVisualDiffPlugin } from '@frsource/cypress-plugin-visual-regression-diff/plugins'
import { unlinkSync } from 'fs'

export default defineConfig({
  e2e: {
    // Allows to run all tests in open mode
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      cypressVisualDiffPlugin(on, config)
      config.chromeWebSecurity = false
      config.video = true
      config.baseUrl = config.env.BASEURL

      config.env = {
        devices: {
          desktop: ['all', 'desktop'].includes(config.env.DEVICE),
          mobile: ['all', 'mobile'].includes(config.env.DEVICE),
        },
        resolution: {
          desktop: { viewportWidth: 1920, viewportHeight: 1080 },
          mobile: { viewportWidth: 360, viewportHeight: 640 },
        },
      }

      config.retries = {
        runMode: 1,
        openMode: 1,
      }

      // Based on: https://docs.cypress.io/guides/guides/screenshots-and-videos#Delete-videos-for-specs-without-failing-or-retried-tests
      on('after:spec', (spec, results) => {
        if (results && results.video) {
          // Check if there were any failures
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === 'failed'),
          )

          if (!failures) {
            // Delete the video if the spec passed and no tests failed
            unlinkSync(results.video)
          }
        }
      })

      return config
    },
    env: {
      pluginVisualRegressionUpdateImages: false,
      pluginVisualRegressionMaxDiffThreshold: 0.1,
    },
    videoCompression: true,
    trashAssetsBeforeRuns: true,
  },
})
