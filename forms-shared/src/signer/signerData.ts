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

export type GetSignerDataParams<
  FormDefinition extends FormDefinitionSlovenskoSk = FormDefinitionSlovenskoSk,
> = {
  formDefinition: FormDefinition
  formId: string
  formData: TaxFormData
  validatorRegistry: BaRjsfValidatorRegistry
  serverFiles?: FormsBackendFile[]
}

const getSlovenskoSkTaxXmls = (params: GetSignerDataParams<FormDefinitionSlovenskoSkTax>) => {
  const { formId, formData, formDefinition } = params

  const xdcXMLData = generateTaxXml(formData, false, formDefinition)
  const xdcUsedXSD = getTaxXsd(formDefinition)
  const xdcUsedXSLT = getTaxXslt(formDefinition)

  // These are legacy signer data, they might be improved (added missing fields), but the risk to do that is higher than the benefit
  return {
    signatureId: createFormSignatureId(formData),
    objectId: `object_${formId}`,
    objectDescription: '',
    objectFormatIdentifier: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
    xdcXMLData,
    xdcIdentifier: '',
    xdcVersion: '',
    xslMediaDestinationTypeDescription: 'TXT',
    xslTargetEnvironment: '',
    xdcIncludeRefs: true,
    xdcNamespaceURI: 'http://data.gov.sk/def/container/xmldatacontainer+xml/1.0',
    xdcUsedXSD,
    xsdReferenceURI: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
    xdcUsedXSLT,
    xslReferenceURI: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}/form.xslt`,
    xslXSLTLanguage: 'sk',
  }
}

/**
 * Formats a form title into a XML filename by removing diacritics and replacing spaces with underscores.
 *
 * @example
 * formatTitleForObjectId("Žiadosť o nájom bytu") // returns "Ziadost_o_najom_bytu.xml"
 * formatTitleForObjectId("Predzáhradky") // returns "Predzahradky.xml"
 * formatTitleForObjectId("Komunitné záhrady") // returns "Komunitne_zahrady.xml"
 */
const formatTitleForObjectId = (title: string): string => {
  // https://stackoverflow.com/a/37511463
  const withoutDiacritics = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const formatted = withoutDiacritics.replace(/\s+/g, '_')

  return `${formatted}.xml`
}

const getSlovenskoSkGenericXmls = async (
  params: GetSignerDataParams<FormDefinitionSlovenskoSkGeneric>,
) => {
  const { formDefinition, formData, validatorRegistry, serverFiles } = params

  const xmlObject = await generateSlovenskoSkXmlObject(
    formDefinition,
    formData,
    validatorRegistry,
    serverFiles,
  )
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
    xdcNamespaceURI: 'http://data.gov.sk/def/container/xmldatacontainer+xml/1.0',
    xdcUsedXSD,
    xsdReferenceURI: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
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
