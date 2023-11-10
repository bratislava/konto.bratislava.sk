import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    experimentalRunAllSpecs: true, // Allows to run all tests in open mode
    setupNodeEvents(on, config) {
      config.chromeWebSecurity = false
      config.video = false
      config.baseUrl = config.env.BASEURL

      config.retries = {
        runMode: 1,
        openMode: 0,
      }

      return config
    },
  },
})
