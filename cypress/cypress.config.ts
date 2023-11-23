import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    fixturesFolder: "./fixtures",
    screenshotsFolder: "./screenshots",
    downloadsFolder: "./downloads",
    supportFile: "./support/e2e.ts",
    fileServerFolder: "./",
    specPattern: "./e2e/**/*.cy.ts",
  
    // Allows to run all tests in open mode
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      config.chromeWebSecurity = false
      config.video = false
      config.baseUrl = config.env.BASEURL
      config.viewportWidth = 1920;
      config.viewportHeight = 1080;

      config.retries = {
        runMode: 1,
        openMode: 0,
      }

      return config
    },
  },
})
