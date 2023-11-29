import { defineConfig } from 'cypress'
import { initPlugin as cypressVisualDiffPlugin } from '@frsource/cypress-plugin-visual-regression-diff/plugins'

export default defineConfig({
  e2e: {
    // Allows to run all tests in open mode
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      cypressVisualDiffPlugin(on, config)
      config.chromeWebSecurity = false
      config.video = false
      config.baseUrl = config.env.BASEURL
      config.viewportWidth = 1920
      config.viewportHeight = 1080

      config.env = {
        devices: {
          desktop: ['all', 'desktop'].includes(config.env.DEVICE),
          mobile: ['all', 'mobile'].includes(config.env.DEVICE),
        },
        resolution: {
          desktop: { viewportWidth: 1440, viewportHeight: 1080 },
          mobile: { viewportWidth: 360, viewportHeight: 640 },
        },
      }

      config.retries = {
        runMode: 1,
        openMode: 0,
      }

      return config
    },
    env: {
      pluginVisualRegressionUpdateImages: false,
      pluginVisualRegressionMaxDiffThreshold: 0.01,
    },
  },
})
