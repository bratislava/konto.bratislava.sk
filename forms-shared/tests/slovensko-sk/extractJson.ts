import { describe, expect, test } from 'vitest'
import {
  extractJsonFromSlovenskoSkXml,
  ExtractJsonFromSlovenskoSkXmlErrorType,
} from '../../src/slovensko-sk/extractJson'
import { FormDefinitionSlovenskoSk } from '../../src/definitions/formDefinitionTypes'

describe('extractJsonFromSlovenskoSkXml', () => {
  const validXmlString = `
    <?xml version="1.0" encoding="UTF-8"?>
    <eform xmlns="http://schemas.gov.sk/form/App.GeneralAgenda/1.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <JsonVersion>1.0.0</JsonVersion>
      <Json>{"key":"value"}</Json>
    </eform>
  `

  const formDefinition = {
    pospID: 'App.GeneralAgenda',
    schema: {},
  } as FormDefinitionSlovenskoSk

  test('should successfully extract JSON from valid XML', async () => {
    const result = await extractJsonFromSlovenskoSkXml(formDefinition, validXmlString)
    expect(result).toEqual({
      formDataJson: { key: 'value' },
      jsonVersion: '1.0.0',
    })
  })

  test('should handle legacy version 1.0 (converts to 1.0.0)', async () => {
    const xmlWithLegacyVersion = validXmlString.replace(
      '<JsonVersion>1.0.0</JsonVersion>',
      '<JsonVersion>1.0</JsonVersion>',
    )
    const result = await extractJsonFromSlovenskoSkXml(formDefinition, xmlWithLegacyVersion)
    expect(result).toEqual({
      formDataJson: { key: 'value' },
      jsonVersion: '1.0.0',
    })
  })

  test('should handle missing version (defaults to 1.0.0)', async () => {
    const xmlWithoutVersion = validXmlString.replace('<JsonVersion>1.0.0</JsonVersion>\n      ', '')
    const result = await extractJsonFromSlovenskoSkXml(formDefinition, xmlWithoutVersion)
    expect(result).toEqual({
      formDataJson: { key: 'value' },
      jsonVersion: '1.0.0',
    })
  })

  test('should throw InvalidXml error for malformed XML', async () => {
    const invalidXml = '<invalid></xml>'
    await expect(extractJsonFromSlovenskoSkXml(formDefinition, invalidXml)).rejects.toThrow(
      expect.objectContaining({
        name: 'ExtractJsonFromSlovenskoSkXmlError',
        type: ExtractJsonFromSlovenskoSkXmlErrorType.InvalidXml,
      }),
    )
  })

  test('should throw XmlDoesntMatchSchema error for incorrect XML structure', async () => {
    const incorrectXmlStructure = `
      <?xml version="1.0" encoding="UTF-8"?>
      <wrongRoot xmlns="http://schemas.gov.sk/form/App.GeneralAgenda/1.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <JsonVersion>1.0</JsonVersion>
        <Json>{"key":"value"}</Json>
      </wrongRoot>
    `
    await expect(
      extractJsonFromSlovenskoSkXml(formDefinition, incorrectXmlStructure),
    ).rejects.toThrow(
      expect.objectContaining({
        name: 'ExtractJsonFromSlovenskoSkXmlError',
        type: ExtractJsonFromSlovenskoSkXmlErrorType.XmlDoesntMatchSchema,
      }),
    )
  })

  test('should throw XmlDoesntMatchSchema error for incorrect xmlns format', async () => {
    const incorrectXmlns = validXmlString.replace(
      'http://schemas.gov.sk/form/App.GeneralAgenda/1.9',
      'invalid-xmlns',
    )
    await expect(extractJsonFromSlovenskoSkXml(formDefinition, incorrectXmlns)).rejects.toThrow(
      expect.objectContaining({
        name: 'ExtractJsonFromSlovenskoSkXmlError',
        type: ExtractJsonFromSlovenskoSkXmlErrorType.XmlDoesntMatchSchema,
      }),
    )
  })

  test('should throw WrongPospId error when pospID doesnt match', async () => {
    const mismatchedPospIdDefinition = {
      ...formDefinition,
      pospID: 'DifferentApp',
    } as FormDefinitionSlovenskoSk
    await expect(
      extractJsonFromSlovenskoSkXml(mismatchedPospIdDefinition, validXmlString),
    ).rejects.toThrow(
      expect.objectContaining({
        name: 'ExtractJsonFromSlovenskoSkXmlError',
        type: ExtractJsonFromSlovenskoSkXmlErrorType.WrongPospId,
      }),
    )
  })

  test('should throw InvalidJson error for malformed JSON in XML', async () => {
    const invalidJsonXml = validXmlString.replace('{"key":"value"}', '{invalid json}')
    await expect(extractJsonFromSlovenskoSkXml(formDefinition, invalidJsonXml)).rejects.toThrow(
      expect.objectContaining({
        name: 'ExtractJsonFromSlovenskoSkXmlError',
        type: ExtractJsonFromSlovenskoSkXmlErrorType.InvalidJson,
      }),
    )
  })

  test('should throw InvalidXml error for invalid version format', async () => {
    const xmlWithInvalidVersion = validXmlString.replace(
      '<JsonVersion>1.0.0</JsonVersion>',
      '<JsonVersion>invalid.version</JsonVersion>',
    )
    await expect(
      extractJsonFromSlovenskoSkXml(formDefinition, xmlWithInvalidVersion),
    ).rejects.toThrow(
      expect.objectContaining({
        name: 'ExtractJsonFromSlovenskoSkXmlError',
        type: ExtractJsonFromSlovenskoSkXmlErrorType.InvalidXml,
      }),
    )
  })
})
