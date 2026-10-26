import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'
import { pretty } from 'react-email'

import { defaultAssetsBaseUrl } from '../src/render/define-email'
import { getAssetFilePath } from './utils/assets'
import { emailCases } from './utils/cases'

for (const emailCase of emailCases) {
  test(`${emailCase.path.join(' / ')}`, async () => {
    const snapshots = await emailCase.renderTextSnapshots()
    for (const [fileName, content] of Object.entries(snapshots)) {
      // Rendered HTML is one long line; formatted, a change shows up as a readable line diff.
      const snapshot = fileName.endsWith('.html') ? await pretty(content) : content
      expect(snapshot).toMatchSnapshot([...emailCase.path, fileName])
    }

    if (!emailCase.usesLayout) {
      return
    }
    const html = await emailCase.renderDocument()

    // Classic Outlook ignores `rem`; email clients support neither OKLCH nor CSS variables.
    expect(html).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(html).not.toContain('oklch(')
    expect(html).not.toContain('var(--')
    // Leftovers of missing data or Handlebars.
    expect(html).not.toMatch(/undefined|null|NaN|\{\{/)
    // Gmail clips messages over 102 KB.
    expect(html.length).toBeLessThan(100 * 1024)

    for (const image of html.matchAll(/<img\b[^>]*>/g)) {
      expect(image[0], 'Images need alt, width and height').toMatch(/\balt="/)
      expect(image[0], 'Images need alt, width and height').toMatch(/\bwidth="\d+"/)
      expect(image[0], 'Images need alt, width and height').toMatch(/\bheight="\d+"/)
    }
    for (const [, url] of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
      expect(url, 'Links and images need absolute https or mailto URLs').toMatch(
        /^(https:\/\/|mailto:)/,
      )
    }
    for (const [url] of html.matchAll(new RegExp(`${defaultAssetsBaseUrl}/[^'")\\s]+`, 'g'))) {
      expect(getAssetFilePath(url), `${url} is not in assets/`).not.toBeNull()
    }
  })
}

test('every snapshot directory belongs to an email example', () => {
  const snapshotsRoot = path.join(import.meta.dirname, '__snapshots__')
  const listDirectories = (directory: string) =>
    existsSync(directory)
      ? readdirSync(directory, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
      : []

  const existing = listDirectories(snapshotsRoot).flatMap((product) =>
    listDirectories(path.join(snapshotsRoot, product)).flatMap((email) =>
      listDirectories(path.join(snapshotsRoot, product, email)).map((example) =>
        [product, email, example].join('/'),
      ),
    ),
  )
  const expected = new Set(emailCases.map((emailCase) => emailCase.path.join('/')))

  expect(existing.filter((directory) => !expected.has(directory))).toEqual([])
})
