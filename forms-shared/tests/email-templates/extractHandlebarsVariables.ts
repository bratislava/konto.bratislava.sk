import { describe, expect, test } from 'vitest'
import extractHandlebarsVariables from '../../src/email-templates/extractHandlebarsVariables'

describe('extractHandlebarsVariables', () => {
  test('returns the variable name for a simple {{x}} reference', () => {
    expect(extractHandlebarsVariables('Hello {{firstName}}')).toEqual(['firstName'])
  })

  test('returns only the root segment for a nested path {{a.b.c}}', () => {
    expect(extractHandlebarsVariables('Email: {{user.profile.email}}')).toEqual(['user'])
  })

  test('collects the variable referenced by a block helper and the body variables', () => {
    expect(extractHandlebarsVariables('{{#if firstName}}Hi {{firstName}}{{/if}}')).toEqual([
      'firstName',
    ])
  })

  test('collects multiple distinct variables from a block', () => {
    expect(extractHandlebarsVariables('{{#if a}}{{b}}{{/if}}')).toEqual(['a', 'b'])
  })

  test('dedupes repeated variables and preserves first-seen order across mustache and block usage', () => {
    expect(
      extractHandlebarsVariables('{{title}} {{#if user}}{{user.name}}{{/if}} {{title}}'),
    ).toEqual(['title', 'user'])
  })

  test('returns an empty list for a template with no variables', () => {
    expect(extractHandlebarsVariables('Hello, world!')).toEqual([])
    expect(extractHandlebarsVariables('')).toEqual([])
  })
})
