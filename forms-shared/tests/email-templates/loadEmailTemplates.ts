import path from 'path'
import { describe, expect, test } from 'vitest'
import loadEmailTemplates from '../../src/email-templates/loadEmailTemplates'

const fixtureDir = path.resolve(__dirname, 'fixtures')

describe('loadEmailTemplates', () => {
  test('returns one entry per subdirectory that contains a template.html', async () => {
    const result = await loadEmailTemplates(fixtureDir)
    expect(result.map((template) => template.name)).toContain('templateA')
  })

  test('returns templates sorted alphabetically by name', async () => {
    const result = await loadEmailTemplates(fixtureDir)
    expect(result.map((template) => template.name)).toEqual(['templateA', 'templateB'])
  })

  test('skips subdirectories that do not contain a template.html', async () => {
    const result = await loadEmailTemplates(fixtureDir)
    expect(result.map((template) => template.name)).not.toContain('notATemplate')
  })

  test('exposes the raw template.html contents on each entry', async () => {
    const result = await loadEmailTemplates(fixtureDir)
    const templateA = result.find((template) => template.name === 'templateA')
    expect(templateA?.html).toBe('<p>Hello {{firstName}}</p>\n')
  })

  test('reads description from metadata.json when present', async () => {
    const result = await loadEmailTemplates(fixtureDir)
    const templateA = result.find((template) => template.name === 'templateA')
    expect(templateA?.description).toBe('Greets the user by first name.')
  })

  test('falls back to an empty description when metadata.json is missing or has no description', async () => {
    const result = await loadEmailTemplates(fixtureDir)
    const templateB = result.find((template) => template.name === 'templateB')
    expect(templateB?.description).toBe('')
  })

  test('reads subject from metadata.json version.headers.Subject when present', async () => {
    const result = await loadEmailTemplates(fixtureDir)
    const templateA = result.find((template) => template.name === 'templateA')
    expect(templateA?.subject).toBe('Hello {{firstName}}')
  })

  test('returns null subject when metadata.json or its Subject header is missing', async () => {
    const result = await loadEmailTemplates(fixtureDir)
    const templateB = result.find((template) => template.name === 'templateB')
    expect(templateB?.subject).toBeNull()
  })

  test('exposes the Handlebars variables referenced by the template', async () => {
    const result = await loadEmailTemplates(fixtureDir)
    const templateA = result.find((template) => template.name === 'templateA')
    const templateB = result.find((template) => template.name === 'templateB')
    expect(templateA?.variables).toEqual(['firstName'])
    expect(templateB?.variables).toEqual([])
  })
})
