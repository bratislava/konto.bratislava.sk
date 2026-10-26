import { expect, test } from '@playwright/test'

import { emailCases } from './utils/cases'

for (const emailCase of emailCases) {
  test(`${emailCase.path.join(' / ')}`, async ({ page }, testInfo) => {
    test.skip(
      emailCase.isScreenshotProject?.(testInfo.project.name) === false,
      'Not screenshotted in this project',
    )

    // Emails must not load anything that isn't part of the email itself.
    const unexpectedRequests: string[] = []
    await page.route('**/*', async (route) => {
      unexpectedRequests.push(route.request().url())
      await route.abort()
    })

    await page.setContent(await emailCase.renderDocument())
    await expect(page).toHaveScreenshot([...emailCase.path, `${testInfo.project.name}.png`], {
      fullPage: true,
    })
    expect(unexpectedRequests).toEqual([])
  })
}
