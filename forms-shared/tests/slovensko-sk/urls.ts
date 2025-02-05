import { describe, test, expect } from 'vitest'
import { parseSlovenskoSkXmlnsString } from '../../src/slovensko-sk/urls'

describe('parseSlovenskoSkXmlnsString', () => {
  test('should correctly parse a valid xmlns string', () => {
    const xmlnsString = 'http://schemas.gov.sk/form/App.GeneralAgenda/1.9'
    const result = parseSlovenskoSkXmlnsString(xmlnsString)
    expect(result).toEqual({
      pospID: 'App.GeneralAgenda',
      pospVersion: '1.9',
    })
  })

  test('should return null for invalid xmlns string', () => {
    const xmlnsString = 'http://invalid.url/form/App/1.0'
    const result = parseSlovenskoSkXmlnsString(xmlnsString)
    expect(result).toBeNull()
  })
})
