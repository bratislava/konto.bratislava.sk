import { chromium } from 'playwright'

// eslint-disable-next-line import/prefer-default-export,@typescript-eslint/explicit-function-return-type
export const getPlaywrightBrowserInstance = () => chromium.launch()
