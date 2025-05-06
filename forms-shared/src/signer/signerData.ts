import {
  FormDefinitionSlovenskoSk,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionSlovenskoSkTax,
  isSlovenskoSkGenericFormDefinition,
  isSlovenskoSkTaxFormDefinition,
} from '../definitions/formDefinitionTypes'
import { TaxFormData } from '../tax-form/types'
import { generateTaxXml } from '../tax-form/generateTaxXml'
import { getTaxXsd, getTaxXslt } from '../tax-form/taxXsdXslt'
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry'
import { generateSlovenskoSkXmlObject } from '../slovensko-sk/generateXml'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { buildSlovenskoSkXml } from '../slovensko-sk/xmlBuilder'
import { getSchemaXsd } from '../slovensko-sk/file-templates/schemaXsd'
import { getHtmlSbXslt } from '../slovensko-sk/file-templates/htmlSbXslt'
import { createFormSignatureId } from './signatureId'
import { getFormSummary } from '../summary/summary'

export type GetSignerDataParams<
  FormDefinition extends FormDefinitionSlovenskoSk = FormDefinitionSlovenskoSk,
> = {
  formDefinition: FormDefinition
  formId: string
  formData: TaxFormData
  jsonVersion: string
  validatorRegistry: BaRjsfValidatorRegistry
  serverFiles?: FormsBackendFile[]
}

const getSlovenskoSkTaxXmls = (params: GetSignerDataParams<FormDefinitionSlovenskoSkTax>) => {
  const { formData, formDefinition } = params

  const xdcXMLData = generateTaxXml(formData, false, formDefinition)
  const xdcUsedXSD = getTaxXsd(formDefinition)
  const xdcUsedXSLT = getTaxXslt(formDefinition)

  // These are legacy signer data, they might be improved (added missing fields), but the risk is greater than the benefit
  return {
    signatureId: createFormSignatureId(formData),
    objectId: formatTitleForObjectId(formDefinition.title),
    objectDescription: formDefinition.title,
    objectFormatIdentifier: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
    xdcXMLData,
    xdcIdentifier: `http://data.gov.sk/doc/eform/${formDefinition.pospID}/${formDefinition.pospVersion}`,
    xdcVersion: formDefinition.pospVersion,
    xslMediaDestinationTypeDescription: 'TXT',
    xslTargetEnvironment: '',
    xdcIncludeRefs: true,
    xdcNamespaceURI: 'http://data.gov.sk/def/container/xmldatacontainer+xml/1.1',
    xdcUsedXSD,
    xsdReferenceURI: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}/form.xsd`,
    xdcUsedXSLT,
    xslReferenceURI: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}/form.xslt`,
    xslXSLTLanguage: 'sk',
  }
}

/**
 * Formats a form title into a XDCF filename by removing diacritics and replacing spaces with underscores.
 *
 * More info: https://www.slovensko.sk/sk/institucie-formulare-a-ziado/nova-pripona-xdcf-pre-xmldata
 *
 * @example
 * formatTitleForObjectId("Žiadosť o nájom bytu") // returns "Ziadost_o_najom_bytu.xdcf"
 * formatTitleForObjectId("Predzáhradky") // returns "Predzahradky.xdcf"
 * formatTitleForObjectId("Komunitné záhrady") // returns "Komunitne_zahrady.xdcf"
 */
const formatTitleForObjectId = (title: string): string => {
  // https://stackoverflow.com/a/37511463
  const withoutDiacritics = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const formatted = withoutDiacritics.replace(/\s+/g, '_')

  return `${formatted}.xdcf`
}

const getSlovenskoSkGenericXmls = async (
  params: GetSignerDataParams<FormDefinitionSlovenskoSkGeneric>,
) => {
  const { formDefinition, formId, formData, jsonVersion, serverFiles, validatorRegistry } = params

  const formSummary = getFormSummary({
    formDefinition,
    formDataJson: formData,
    validatorRegistry,
  })
  const xmlObject = await generateSlovenskoSkXmlObject({
    formDefinition,
    formId,
    formData,
    jsonVersion,
    formSummary,
    serverFiles,
  })
  const xdcXMLData = buildSlovenskoSkXml(xmlObject, { headless: false, pretty: false })
  const xdcUsedXSD = getSchemaXsd(formDefinition)
  const xdcUsedXSLT = getHtmlSbXslt(formDefinition)

  return {
    signatureId: createFormSignatureId(formData),
    objectId: formatTitleForObjectId(formDefinition.title),
    objectDescription: formDefinition.title,
    objectFormatIdentifier: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
    xdcXMLData,
    xdcIdentifier: `http://data.gov.sk/doc/eform/${formDefinition.pospID}/${formDefinition.pospVersion}`,
    xdcVersion: formDefinition.pospVersion,
    xslMediaDestinationTypeDescription: 'HTML',
    xslTargetEnvironment: '',
    xdcIncludeRefs: true,
    xdcNamespaceURI: 'http://data.gov.sk/def/container/xmldatacontainer+xml/1.1',
    xdcUsedXSD,
    xsdReferenceURI: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}/form.xsd`,
    xdcUsedXSLT,
    xslReferenceURI: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}/form.xslt`,
    xslXSLTLanguage: 'sk',
  }
}

export class GetSignerDataError extends Error {
  constructor(public type: GetSignerDataErrorType) {
    super(type)
    this.name = 'GetSignerDataError'
  }
}

export enum GetSignerDataErrorType {
  UnsupportedFormDefinitionType = 'UnsupportedFormDefinitionType',
}

export const getSignerData = async (params: GetSignerDataParams) => {
  if (isSlovenskoSkTaxFormDefinition(params.formDefinition)) {
    return getSlovenskoSkTaxXmls(params as GetSignerDataParams<FormDefinitionSlovenskoSkTax>)
  } else if (isSlovenskoSkGenericFormDefinition(params.formDefinition)) {
    return await getSlovenskoSkGenericXmls(
      params as GetSignerDataParams<FormDefinitionSlovenskoSkGeneric>,
    )
  } else {
    throw new GetSignerDataError(GetSignerDataErrorType.UnsupportedFormDefinitionType)
  }
}
