import fs from 'fs/promises'
import path from 'path'
// Mailgun.js 12.x is ESM-only and its `exports` map only exposes `.` and
// `./definitions`. The root entry no longer re-exports the `Interfaces` namespace,
// so we go through the `definitions` subpath. Type-only import from an ESM module
// inside a CJS module needs the `resolution-mode` attribute.
import type { Interfaces as MailgunInterfaces } from 'mailgun.js/definitions' with {
  'resolution-mode': 'import',
}
import extractHandlebarsVariables from './extractHandlebarsVariables'

/* Created by Claude */

export type EmailTemplate = {
  name: string
  html: string
  description: string
  subject: string | null
  variables: string[]
}

// metadata.json on disk follows Mailgun's IDomainTemplate shape, with the version
// body stripped out (it lives in template.html instead). The Mailgun.js SDK type
// omits the `headers` field that the REST API actually returns on a version, so
// we augment it here.
type TemplateVersionWithHeaders = NonNullable<MailgunInterfaces.IDomainTemplate['version']> & {
  headers?: { Subject?: string } | null
}
type StoredTemplate = Omit<MailgunInterfaces.IDomainTemplate, 'version'> & {
  version?: Omit<TemplateVersionWithHeaders, 'template'>
}

const readJson = async (filePath: string): Promise<unknown> => {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const loadOneTemplate = async (
  templateDir: string,
  name: string,
): Promise<EmailTemplate | null> => {
  let html: string
  try {
    html = await fs.readFile(path.join(templateDir, 'template.html'), 'utf8')
  } catch {
    return null
  }
  const metadata = (await readJson(
    path.join(templateDir, 'metadata.json'),
  )) as StoredTemplate | null
  return {
    name,
    html,
    description: metadata?.description ?? '',
    subject: metadata?.version?.headers?.Subject ?? null,
    variables: extractHandlebarsVariables(html),
  }
}

const loadEmailTemplates = async (dir: string): Promise<EmailTemplate[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const templates = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => loadOneTemplate(path.join(dir, entry.name), entry.name)),
  )
  return templates
    .filter((template): template is EmailTemplate => template !== null)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export default loadEmailTemplates
