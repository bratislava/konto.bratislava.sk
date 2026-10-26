import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'
import { pretty } from 'react-email'

import { emailCases } from './utils/cases'

for (const emailCase of emailCases) {
  test(`${emailCase.path.join(' / ')}`, async () => {
    const snapshots = await emailCase.renderTextSnapshots()
    for (const [fileName, content] of Object.entries(snapshots)) {
      // Rendered HTML is one long line; formatted, a change shows up as a readable line diff.
      const snapshot = fileName.endsWith('.html') ? await pretty(content) : content
      expect(snapshot).toMatchSnapshot([...emailCase.path, fileName])
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
