import isEqual from 'lodash/isEqual'
import { parseStringPromise, processors } from 'xml2js'

import type { getSignerData } from './signerData'

type SignerData = Awaited<ReturnType<typeof getSignerData>>

/**
 * The signed data object is an XMLDataContainer (XDC) that wraps the form XML:
 *
 * ```xml
 * <xdc:XMLDataContainer xmlns:xdc="http://data.gov.sk/def/container/xmldatacontainer+xml/1.1">
 *   <xdc:XMLData ContentType="application/xml; charset=UTF-8" Identifier="…" Version="…">
 *     <E-form xmlns="…">…</E-form>
 *   </xdc:XMLData>
 *   <xdc:UsedSchemasReferenced>
 *     <xdc:UsedXSDReference …>…/form.xsd</xdc:UsedXSDReference>
 *     <xdc:UsedPresentationSchemaReference …>…/form.xslt</xdc:UsedPresentationSchemaReference>
 *   </xdc:UsedSchemasReferenced>
 * </xdc:XMLDataContainer>
 * ```
 */
export type SignedXdc = {
  namespace: string | undefined
  identifier: string | undefined
  version: string | undefined
  xsdReference: string | undefined
  presentationSchemaReference: string | undefined
  /** Parsed content of `xdc:XMLData` (the form XML), without the XMLData attributes. */
  formXml: Record<string, unknown>
  /**
   * `DatumZadaniaPodania` of the tax form, the only value in the signed XML that depends on the time of signing.
   * `undefined` for forms that do not contain it.
   */
  submittedAt: Date | undefined
}

export enum ParseSignedXdcErrorType {
  InvalidXml = 'InvalidXml',
  NotXdc = 'NotXdc',
}

export class ParseSignedXdcError extends Error {
  constructor(public type: ParseSignedXdcErrorType) {
    super(type)
    this.name = 'ParseSignedXdcError'
  }
}

export enum SignedXdcMismatch {
  Namespace = 'Namespace',
  Identifier = 'Identifier',
  Version = 'Version',
  XsdReference = 'XsdReference',
  PresentationSchemaReference = 'PresentationSchemaReference',
  FormXml = 'FormXml',
}

export type CompareSignedXdcResult =
  { matches: true } | { matches: false; mismatch: SignedXdcMismatch }

type ParsedNode = { $?: Record<string, string>; _?: string; [key: string]: unknown }

/**
 * Both the signed XML and the generated XML go through the same parser, so the comparison is insensitive to
 * serialization details (attribute order, quoting, escaping, namespace prefixes, whitespace-only text between
 * elements), but sensitive to every element, attribute and text value.
 */
const parseXml = async (xml: string): Promise<Record<string, unknown>> =>
  parseStringPromise(xml, {
    explicitArray: false,
    tagNameProcessors: [processors.stripPrefix],
  }) as Promise<Record<string, unknown>>

const getText = (node: unknown): string | undefined => {
  if (typeof node === 'string') {
    return node.trim()
  }
  if (node && typeof node === 'object' && typeof (node as ParsedNode)._ === 'string') {
    return (node as ParsedNode)._!.trim()
  }
  return undefined
}

/**
 * Generic form XML embeds the form data as `<Json>{…}</Json>` (`JSON.stringify(formData)`). The signed string is
 * serialized from the form data the browser sent, the regenerated one from the form data stored in PostgreSQL. `jsonb`
 * does not preserve key order, so the strings differ while the data is the same (seen in 120 of 146 real signatures
 * of the waste fee form). The embedded JSON is therefore compared as parsed data.
 */
const normalizeEmbeddedJson = (formXml: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(formXml).map(([rootName, root]) => {
      if (!root || typeof root !== 'object') {
        return [rootName, root]
      }
      const { Json: json } = root as ParsedNode
      if (typeof json !== 'string') {
        return [rootName, root]
      }
      try {
        return [rootName, { ...root, Json: JSON.parse(json) as unknown }]
      } catch {
        return [rootName, root]
      }
    }),
  )

const XDC_NAMESPACE_PREFIX = 'http://data.gov.sk/def/container/xmldatacontainer+xml/'

/** XDC namespace declared on the root element, whatever prefix it is bound to (D.Signer uses `xdc`). */
const getXdcNamespace = (attributes: Record<string, string> | undefined) =>
  Object.entries(attributes ?? {}).find(
    ([name, value]) =>
      (name === 'xmlns' || name.startsWith('xmlns:')) && value.startsWith(XDC_NAMESPACE_PREFIX),
  )?.[1]

const parseSubmittedAt = (formXml: Record<string, unknown>): Date | undefined => {
  const root = Object.values(formXml)[0] as ParsedNode | undefined
  const body = root?.Body as ParsedNode | undefined
  const value = getText(body?.DatumZadaniaPodania)
  if (!value) {
    return undefined
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export const parseSignedXdc = async (xml: string): Promise<SignedXdc> => {
  let parsed: Record<string, unknown>
  try {
    parsed = await parseXml(xml)
  } catch {
    throw new ParseSignedXdcError(ParseSignedXdcErrorType.InvalidXml)
  }

  const container = parsed?.XMLDataContainer as ParsedNode | undefined
  const xmlData = container?.XMLData as ParsedNode | undefined
  if (!container || !xmlData || typeof xmlData !== 'object') {
    throw new ParseSignedXdcError(ParseSignedXdcErrorType.NotXdc)
  }

  const { $: xmlDataAttributes, ...formXml } = xmlData
  const schemas = container.UsedSchemasReferenced as ParsedNode | undefined

  return {
    namespace: getXdcNamespace(container.$),
    identifier: xmlDataAttributes?.Identifier,
    version: xmlDataAttributes?.Version,
    xsdReference: getText(schemas?.UsedXSDReference),
    presentationSchemaReference: getText(schemas?.UsedPresentationSchemaReference),
    formXml,
    submittedAt: parseSubmittedAt(formXml),
  }
}

/**
 * Checks that the signed XDC contains exactly the XML the backend generates from the stored form data.
 *
 * Signature verification (CEP) only confirms that the signature is valid for whatever is inside the container, not
 * that it is the form being sent. For tax forms, `signerData` must be generated with `submittedAt` from
 * `parseSignedXdc`, otherwise `DatumZadaniaPodania` differs.
 */
export const compareSignedXdcWithSignerData = async (
  signed: SignedXdc,
  signerData: Pick<
    SignerData,
    | 'xdcNamespaceURI'
    | 'xdcIdentifier'
    | 'xdcVersion'
    | 'xsdReferenceURI'
    | 'xslReferenceURI'
    | 'xdcXMLData'
  >,
): Promise<CompareSignedXdcResult> => {
  const mismatch = (value: SignedXdcMismatch): CompareSignedXdcResult => ({
    matches: false,
    mismatch: value,
  })

  if (signed.namespace !== signerData.xdcNamespaceURI) {
    return mismatch(SignedXdcMismatch.Namespace)
  }
  if (signed.identifier !== signerData.xdcIdentifier) {
    return mismatch(SignedXdcMismatch.Identifier)
  }
  if (signed.version !== signerData.xdcVersion) {
    return mismatch(SignedXdcMismatch.Version)
  }
  if (signed.xsdReference !== signerData.xsdReferenceURI) {
    return mismatch(SignedXdcMismatch.XsdReference)
  }
  if (signed.presentationSchemaReference !== signerData.xslReferenceURI) {
    return mismatch(SignedXdcMismatch.PresentationSchemaReference)
  }

  const expectedFormXml = await parseXml(signerData.xdcXMLData)
  if (!isEqual(normalizeEmbeddedJson(signed.formXml), normalizeEmbeddedJson(expectedFormXml))) {
    return mismatch(SignedXdcMismatch.FormXml)
  }

  return { matches: true }
}
