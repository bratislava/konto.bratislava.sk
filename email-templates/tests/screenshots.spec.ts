import { expect, test } from '@playwright/test'

import { getAssetFilePath, getContentType } from './utils/assets'
import { emailCases } from './utils/cases'

for (const emailCase of emailCases) {
  test(`${emailCase.path.join(' / ')}`, async ({ page }, testInfo) => {
    test.skip(
      emailCase.isScreenshotProject?.(testInfo.project.name) === false,
      'Not screenshotted in this project',
    )

    // Assets come from the package's `assets/` folder; nothing else may be loaded.
    const unexpectedRequests: string[] = []
    await page.route('**/*', async (route) => {
      const url = route.request().url()
      const filePath = getAssetFilePath(url)
      if (!filePath) {
        unexpectedRequests.push(url)
        await route.abort()
        return
      }
      // The page is `about:blank`, so web fonts are cross-origin requests that need CORS headers.
      // The web app serves the assets with the same header.
      await route.fulfill({
        path: filePath,
        contentType: getContentType(filePath),
        headers: { 'access-control-allow-origin': '*' },
      })
    })

    await page.setContent(await emailCase.renderDocument())
    if (emailCase.usesLayout) {
      // Fail loudly if the web font can't load, instead of comparing against a fallback font.
      // `load()` returns the faces it loaded; it is empty when no Inter face could be loaded.
      const loadedInterFaces = await page.evaluate(
        async () => (await document.fonts.load('600 16px Inter')).length,
      )
      expect(loadedInterFaces).toBeGreaterThan(0)
      await page.evaluate(() => document.fonts.ready)
    }
    await expect(page).toHaveScreenshot([...emailCase.path, `${testInfo.project.name}.png`], {
      fullPage: true,
    })
    expect(unexpectedRequests).toEqual([])
  })
}
