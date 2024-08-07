import { chromium } from 'playwright'

export const launchPlaywrightTest = () => chromium.launch()
