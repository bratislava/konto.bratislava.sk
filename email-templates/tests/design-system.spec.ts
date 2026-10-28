import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { expect, test } from '@playwright/test'

import { registry } from '../src/registry'
import { type Brand, brands } from '../src/theme/brands'
import { colors } from '../src/theme/tokens'
import { assetsRoot } from './utils/assets'

/** WCAG 2 contrast ratio of two hex colours. */
const contrast = (first: string, second: string) => {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((index) => {
      const channel = parseInt(hex.slice(index, index + 2), 16) / 255
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    }) as [number, number, number]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a) as [
    number,
    number,
  ]
  return (lighter + 0.05) / (darker + 0.05)
}

test('text colours meet WCAG AA contrast on the card', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const { surface, text, textSecondary, codeBackground, error } = colors[scheme]
    expect(contrast(text, surface), `${scheme} text`).toBeGreaterThanOrEqual(4.5)
    expect(contrast(textSecondary, surface), `${scheme} secondary text`).toBeGreaterThanOrEqual(4.5)
    expect(contrast(text, codeBackground), `${scheme} code`).toBeGreaterThanOrEqual(4.5)
    expect(contrast(error, surface), `${scheme} error`).toBeGreaterThanOrEqual(4.5)
  }
})

test('button colours meet WCAG AA contrast', () => {
  for (const brand of Object.keys(brands) as Brand[]) {
    for (const scheme of ['light', 'dark'] as const) {
      const { background, text } = brands[brand].button[scheme]
      expect(contrast(text, background), `${brand} ${scheme}`).toBeGreaterThanOrEqual(4.5)
    }
  }
})

test('every email file is in the registry', () => {
  // Emails are the `.tsx` files directly in a product folder; shared parts live in subfolders.
  const emailsRoot = path.join(import.meta.dirname, '..', 'src', 'emails')
  const emailFiles = readdirSync(emailsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((product) =>
      readdirSync(path.join(emailsRoot, product.name), { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
        .map((entry) => `${product.name}/${entry.name.replace(/\.tsx$/, '')}`),
    )
  const registered = new Set(registry.map((email) => `${email.product}/${email.id}`))

  expect(emailFiles.filter((file) => !registered.has(file))).toEqual([])
})

test('published assets are unchanged (assets/manifest.json)', () => {
  const manifest: Record<string, string> = JSON.parse(
    readFileSync(path.join(assetsRoot, 'manifest.json'), 'utf8'),
  )
  const files = readdirSync(assetsRoot, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name !== 'manifest.json')
    .map((entry) =>
      path.relative(assetsRoot, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'),
    )
    .sort()

  expect(files, 'Run `node scripts/update-assets-manifest.ts` after adding assets').toEqual(
    Object.keys(manifest).sort(),
  )
  for (const file of files) {
    const hash = createHash('sha256')
      .update(readFileSync(path.join(assetsRoot, file)))
      .digest('hex')
    expect(hash, `${file} changed; add a new file instead`).toBe(manifest[file])
  }
})
