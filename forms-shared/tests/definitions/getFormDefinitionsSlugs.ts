import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { FormDefinition } from '../../src/definitions/formDefinitionTypes'

const mockDefinitionsContainer = vi.hoisted(() => ({
  current: [] as Partial<FormDefinition>[],
}))

vi.mock('../../src/definitions/formDefinitions', () => ({
  get formDefinitions() {
    return mockDefinitionsContainer.current
  },
}))

import { getFormDefinitionsSlugs } from '../../src/definitions/getFormDefinitionsSlugs'

describe('getFormDefinitionsSlugs', () => {
  beforeEach(() => {
    mockDefinitionsContainer.current = []
  })

  test('returns empty arrays when there are no form definitions', () => {
    expect(getFormDefinitionsSlugs()).toEqual({ enabled: [], disabled: [] })
  })

  test('returns all slugs as enabled when no definition has isDisabled', () => {
    mockDefinitionsContainer.current = [{ slug: 'form-a' }, { slug: 'form-b' }, { slug: 'form-c' }]

    expect(getFormDefinitionsSlugs()).toEqual({
      enabled: ['form-a', 'form-b', 'form-c'],
      disabled: [],
    })
  })

  test('returns all slugs as disabled when all definitions are disabled', () => {
    mockDefinitionsContainer.current = [
      { slug: 'form-a', isDisabled: true },
      { slug: 'form-b', isDisabled: true },
    ]

    expect(getFormDefinitionsSlugs()).toEqual({
      enabled: [],
      disabled: ['form-a', 'form-b'],
    })
  })

  test('correctly separates enabled and disabled slugs in mixed definitions', () => {
    mockDefinitionsContainer.current = [
      { slug: 'form-enabled-1' },
      { slug: 'form-disabled-1', isDisabled: true },
      { slug: 'form-enabled-2' },
      { slug: 'form-disabled-2', isDisabled: true },
    ]

    expect(getFormDefinitionsSlugs()).toEqual({
      enabled: ['form-enabled-1', 'form-enabled-2'],
      disabled: ['form-disabled-1', 'form-disabled-2'],
    })
  })

  test('treats isDisabled: false the same as no isDisabled flag', () => {
    mockDefinitionsContainer.current = [{ slug: 'form-a', isDisabled: false }, { slug: 'form-b' }]

    expect(getFormDefinitionsSlugs()).toEqual({
      enabled: ['form-a', 'form-b'],
      disabled: [],
    })
  })
})
