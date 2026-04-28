import fs from 'fs/promises'
import path from 'path'
import extractHandlebarsVariables from './extractHandlebarsVariables'

/* Created by Claude */

export type EmailTemplate = {
  name: string
  html: string
  description: string
  subject: string | null
  variables: string[]
}

type StoredMetadata = {
  description?: string
  subject?: string | null
}

const readMetadata = async (filePath: string): Promise<StoredMetadata | null> => {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as StoredMetadata
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
  const metadata = await readMetadata(path.join(templateDir, 'metadata.json'))
  return {
    name,
    html,
    description: metadata?.description ?? '',
    subject: metadata?.subject ?? null,
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
