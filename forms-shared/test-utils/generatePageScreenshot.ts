import { launchPlaywrightTest } from './launchPlaywright'

export async function generatePageScreenshot(html: string, size: 'desktop' | 'mobile') {
  const browser = await launchPlaywrightTest()
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.setContent(html)

  if (size === 'mobile') {
    await page.setViewportSize({ width: 360, height: 1000 })
  } else if (size === 'desktop') {
    await page.setViewportSize({ width: 800, height: 1000 })
  } else {
    throw new Error(`Unsupported size: ${size}`)
  }

  const screenshot = await page.screenshot({ fullPage: true })
  await browser.close()

  return screenshot
}
