import fs from 'node:fs'
import path from 'node:path'

import cloneDeep from 'lodash/cloneDeep'
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  FormDefinitionSlovenskoSk,
  isSlovenskoSkGenericFormDefinition,
  isSlovenskoSkTaxFormDefinition,
} from '../../src/definitions/formDefinitionTypes'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import {
  compareSignedXdcWithSignerData,
  parseSignedXdc,
  ParseSignedXdcError,
  ParseSignedXdcErrorType,
  SignedXdcMismatch,
} from '../../src/signer/signedXdc'
import { getSignerData } from '../../src/signer/signerData'
import { formatXsDateTimeXml } from '../../src/tax-form/mapping/xml/functions'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

type SignerData = Awaited<ReturnType<typeof getSignerData>>

const FORM_ID = '123e4567-e89b-12d3-a456-426614174000'
const SIGNED_AT = new Date('2026-04-21T07:52:18.224Z')
const SENT_AT = new Date('2026-04-22T10:00:00.000Z')

/**
 * Wraps signer data into an XMLDataContainer in the shape D.Signer produces (XDC 1.1, `Identifier` and `Version` on
 * `XMLData`, form XML without its XML declaration, schema references with digests).
 */
const wrapInXdc = (signerData: SignerData) =>
  [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<xdc:XMLDataContainer xmlns:xdc="${signerData.xdcNamespaceURI}">`,
    `<xdc:XMLData ContentType="application/xml; charset=UTF-8" Identifier="${signerData.xdcIdentifier}" Version="${signerData.xdcVersion}">`,
    signerData.xdcXMLData.replace(/^<\?xml[^>]*\?>\s*/, ''),
    `</xdc:XMLData>`,
    `<xdc:UsedSchemasReferenced>`,
    `<xdc:UsedXSDReference DigestMethod="urn:oid:2.16.840.1.101.3.4.2.1" DigestValue="REDACTED" TransformAlgorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315">${signerData.xsdReferenceURI}</xdc:UsedXSDReference>`,
    `<xdc:UsedPresentationSchemaReference ContentType="application/xslt+xml" DigestMethod="urn:oid:2.16.840.1.101.3.4.2.1" DigestValue="REDACTED" Language="sk" MediaDestinationTypeDescription="${signerData.xslMediaDestinationTypeDescription}" TransformAlgorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315">${signerData.xslReferenceURI}</xdc:UsedPresentationSchemaReference>`,
    `</xdc:UsedSchemasReferenced>`,
    `</xdc:XMLDataContainer>`,
  ].join('')

type SignerDataParams = Omit<Parameters<typeof getSignerData>[0], 'validatorRegistry'>

const signerDataAt = async (now: Date, params: SignerDataParams) => {
  vi.setSystemTime(now)
  return getSignerData({ ...params, validatorRegistry: testValidatorRegistry })
}

const paramsFor = (
  formDefinition: FormDefinitionSlovenskoSk,
  formData: SignerDataParams['formData'],
  serverFiles?: SignerDataParams['serverFiles'],
): SignerDataParams => ({
  formDefinition,
  formId: FORM_ID,
  jsonVersion: formDefinition.jsonVersion,
  formData,
  serverFiles,
})

describe('signedXdc', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  describe('parseSignedXdc', () => {
    test('parses the fixture data file', async () => {
      const xml = fs.readFileSync(
        path.join(__dirname, 'test-container', 'signed_form_Test.xdcf'),
        'utf8',
      )

      const signed = await parseSignedXdc(xml)

      expect(signed).toEqual({
        namespace: 'http://data.gov.sk/def/container/xmldatacontainer+xml/1.1',
        identifier: 'http://data.gov.sk/doc/eform/00603481.test/1.0',
        version: '1.0',
        xsdReference: 'http://schemas.gov.sk/form/00603481.test/1.0/form.xsd',
        presentationSchemaReference: 'http://schemas.gov.sk/form/00603481.test/1.0/form.xslt',
        formXml: { eform: { $: { xmlns: 'http://schemas.gov.sk/form/00603481.test/1.0' } } },
        submittedAt: undefined,
      })
    })

    test.each([
      ['not XML', 'toto nie je XML', ParseSignedXdcErrorType.InvalidXml],
      ['form XML without container', '<E-form><Body/></E-form>', ParseSignedXdcErrorType.NotXdc],
      [
        'container without XMLData',
        '<xdc:XMLDataContainer xmlns:xdc="http://data.gov.sk/def/container/xmldatacontainer+xml/1.1"/>',
        ParseSignedXdcErrorType.NotXdc,
      ],
    ])('rejects %s', async (_name, xml, type) => {
      await expect(parseSignedXdc(xml)).rejects.toThrow(new ParseSignedXdcError(type))
    })
  })

  describe('tax form', () => {
    const [{ formDefinition, exampleForm }] = getExampleFormPairs({
      formDefinitionFilterFn: isSlovenskoSkTaxFormDefinition,
    })
    const params = paramsFor(formDefinition, exampleForm.formData)

    test('signed XML contains the time of signing', async () => {
      const signed = await parseSignedXdc(wrapInXdc(await signerDataAt(SIGNED_AT, params)))

      expect(signed.submittedAt?.toISOString()).toBe(SIGNED_AT.toISOString())
    })

    test('matches when regenerated later with the date from the signed XML', async () => {
      const signed = await parseSignedXdc(wrapInXdc(await signerDataAt(SIGNED_AT, params)))

      const expected = await signerDataAt(SENT_AT, { ...params, submittedAt: signed.submittedAt })

      expect(await compareSignedXdcWithSignerData(signed, expected)).toEqual({ matches: true })
    })

    test('does not match when regenerated with the current time', async () => {
      const signed = await parseSignedXdc(wrapInXdc(await signerDataAt(SIGNED_AT, params)))

      const expected = await signerDataAt(SENT_AT, params)

      expect(await compareSignedXdcWithSignerData(signed, expected)).toEqual({
        matches: false,
        mismatch: SignedXdcMismatch.FormXml,
      })
    })

    test('does not match when the stored form data differs from the signed data', async () => {
      const signed = await parseSignedXdc(wrapInXdc(await signerDataAt(SIGNED_AT, params)))
      const changedFormData = cloneDeep(exampleForm.formData)
      changedFormData.druhPriznania.rok += 1

      const expected = await signerDataAt(SENT_AT, {
        ...paramsFor(formDefinition, changedFormData),
        submittedAt: signed.submittedAt,
      })

      expect(await compareSignedXdcWithSignerData(signed, expected)).toEqual({
        matches: false,
        mismatch: SignedXdcMismatch.FormXml,
      })
    })

    test.each([
      [
        'XDC 1.0 namespace (older signer data)',
        (s: SignerData) => ({
          ...s,
          xdcNamespaceURI: 'http://data.gov.sk/def/container/xmldatacontainer+xml/1.0',
        }),
        SignedXdcMismatch.Namespace,
      ],
      [
        'different form',
        (s: SignerData) => ({ ...s, xdcIdentifier: 'http://data.gov.sk/doc/eform/other/1.0' }),
        SignedXdcMismatch.Identifier,
      ],
      [
        'different form version',
        (s: SignerData) => ({ ...s, xdcVersion: '0.0.0' }),
        SignedXdcMismatch.Version,
      ],
      [
        'different XSD',
        (s: SignerData) => ({ ...s, xsdReferenceURI: 'http://example.com/form.xsd' }),
        SignedXdcMismatch.XsdReference,
      ],
      [
        'different visualisation',
        (s: SignerData) => ({ ...s, xslReferenceURI: 'http://example.com/form.xslt' }),
        SignedXdcMismatch.PresentationSchemaReference,
      ],
      [
        'additional form in XMLData',
        (s: SignerData) => ({
          ...s,
          xdcXMLData: s.xdcXMLData.replace(/<\/E-form>$/, '</E-form><E-form/>'),
        }),
        SignedXdcMismatch.FormXml,
      ],
    ])('does not match a container with %s', async (_name, modifySigned, mismatch) => {
      const signerData = await signerDataAt(SIGNED_AT, params)
      const signed = await parseSignedXdc(wrapInXdc(modifySigned(signerData)))

      const expected = await signerDataAt(SENT_AT, { ...params, submittedAt: signed.submittedAt })

      expect(await compareSignedXdcWithSignerData(signed, expected)).toEqual({
        matches: false,
        mismatch,
      })
    })

    test('is insensitive to serialization (indentation, attribute order, prefix)', async () => {
      const signerData = await signerDataAt(SIGNED_AT, params)
      const reformatted = wrapInXdc(signerData)
        .replaceAll('xdc:', 'c:')
        .replace('xmlns:xdc=', 'xmlns:c=')
        .replaceAll('><', '>\n  <')
        .replace(
          /<c:XMLData ContentType="([^"]*)" Identifier="([^"]*)" Version="([^"]*)">/,
          '<c:XMLData Version="$3" Identifier="$2" ContentType="$1">',
        )
      const signed = await parseSignedXdc(reformatted)

      const expected = await signerDataAt(SENT_AT, { ...params, submittedAt: signed.submittedAt })

      expect(signed.namespace).toBe(signerData.xdcNamespaceURI)
      expect(await compareSignedXdcWithSignerData(signed, expected)).toEqual({ matches: true })
    })
  })

  describe('DatumZadaniaPodania round trip', () => {
    test.each([
      ['winter time', '2026-01-15T09:30:00.123Z'],
      ['summer time', '2026-07-15T09:30:00.123Z'],
      ['whole second', '2026-04-21T07:52:18.000Z'],
      ['new year in Bratislava', '2026-12-31T23:00:00.000Z'],
      ['clocks go back, first 02:30 (CEST)', '2026-10-25T00:30:00.000Z'],
      ['clocks go back, second 02:30 (CET)', '2026-10-25T01:30:00.000Z'],
      ['clocks go forward', '2026-03-29T01:00:00.000Z'],
    ])('%s', (_name, iso) => {
      const signed = formatXsDateTimeXml(new Date(iso))

      // Same shape as in real signed tax forms, e.g. 2026-04-21T09:52:18.224+02:00
      expect(signed).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/)
      expect(formatXsDateTimeXml(new Date(signed!))).toBe(signed)
    })
  })

  describe('generic forms', () => {
    getExampleFormPairs({
      formDefinitionFilterFn: (formDefinition): formDefinition is FormDefinitionSlovenskoSk =>
        isSlovenskoSkGenericFormDefinition(formDefinition) && formDefinition.isSigned,
    }).forEach(({ formDefinition, exampleForm }) => {
      describe(exampleForm.name, () => {
        const params = paramsFor(formDefinition, exampleForm.formData, exampleForm.serverFiles)

        test('matches regardless of the time of signing', async () => {
          const signed = await parseSignedXdc(wrapInXdc(await signerDataAt(SIGNED_AT, params)))

          expect(signed.submittedAt).toBeUndefined()
          expect(
            await compareSignedXdcWithSignerData(signed, await signerDataAt(SENT_AT, params)),
          ).toEqual({
            matches: true,
          })
        })

        test('matches when the stored form data has a different key order (jsonb)', async () => {
          const signed = await parseSignedXdc(wrapInXdc(await signerDataAt(SIGNED_AT, params)))
          const reversedKeys = (value: unknown): unknown =>
            Array.isArray(value)
              ? value.map(reversedKeys)
              : value && typeof value === 'object'
                ? Object.fromEntries(
                    Object.entries(value)
                      .reverse()
                      .map(([k, v]) => [k, reversedKeys(v)]),
                  )
                : value
          const storedFormData = reversedKeys(exampleForm.formData) as SignerDataParams['formData']

          const expected = await signerDataAt(
            SENT_AT,
            paramsFor(formDefinition, storedFormData, exampleForm.serverFiles),
          )

          expect(expected.xdcXMLData).not.toBe((await signerDataAt(SIGNED_AT, params)).xdcXMLData)
          expect(await compareSignedXdcWithSignerData(signed, expected)).toEqual({ matches: true })
        })

        test('does not match when the embedded JSON differs', async () => {
          const signerData = await signerDataAt(SIGNED_AT, params)
          const signed = await parseSignedXdc(
            wrapInXdc({
              ...signerData,
              xdcXMLData: signerData.xdcXMLData.replace(
                /<Json>([^<]*)<\/Json>/,
                (_, json: string) =>
                  `<Json>${json.replace('{', '{&quot;injected&quot;:true,')}</Json>`,
              ),
            }),
          )

          expect(
            await compareSignedXdcWithSignerData(signed, await signerDataAt(SENT_AT, params)),
          ).toEqual({
            matches: false,
            mismatch: SignedXdcMismatch.FormXml,
          })
        })
      })
    })
  })
})
