import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'

import { registry } from '../src/registry'

/**
 * Writes every email example to `export/` exactly as it would be sent (HTML and plain text), with a
 * `manifest.json` listing them, for testing in real clients (Email on Acid).
 *
 * pnpm export-html [--filter <text>] [--assets-base-url <url>]
 *
 * `--filter` keeps examples whose `<product>/<email>/<example>` contains the text.
 * `--assets-base-url` must be reachable by the email clients; the default (production) only works
 * once the assets are deployed there.
 */

const { values } = parseArgs({
  options: {
    filter: { type: 'string', default: '' },
    'assets-base-url': { type: 'string' },
  },
})
const assetsBaseUrl = values['assets-base-url']

const exportRoot = path.join(import.meta.dirname, '..', 'export')
rmSync(exportRoot, { recursive: true, force: true })

const manifest: Array<{ path: string; subject: string; html: string; text: string }> = []
for (const email of registry) {
  for (const example of email.examples) {
    const examplePath = `${email.product}/${email.id}/${example.name}`
    if (!examplePath.includes(values.filter)) {
      continue
    }
    const { subject, html, text } = await example.render(assetsBaseUrl ? { assetsBaseUrl } : {})
    const directory = path.join(exportRoot, email.product, email.id)
    mkdirSync(directory, { recursive: true })
    writeFileSync(path.join(directory, `${example.name}.html`), html)
    writeFileSync(path.join(directory, `${example.name}.txt`), text)
    manifest.push({
      path: examplePath,
      subject,
      html: `${examplePath}.html`,
      text: `${examplePath}.txt`,
    })
  }
}

mkdirSync(exportRoot, { recursive: true })
writeFileSync(path.join(exportRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`${manifest.length} examples written to ${path.relative(process.cwd(), exportRoot)}`)
