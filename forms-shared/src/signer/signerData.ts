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
  const { formData, formDefinition } = params

  const xml = generateTaxXml(formData, false, formDefinition)
  const xsd = getTaxXsd(formDefinition)
  const xslt = getTaxXslt(formDefinition)

  return { xml, xsd, xslt }
}

const getSlovenskoSkGenericXmls = (
  params: GetSignerDataParams<FormDefinitionSlovenskoSkGeneric>,
) => {
  const { formDefinition, formData, validatorRegistry, serverFiles } = params

  const xmlObject = generateSlovenskoSkXmlObject(
    formDefinition,
    formData,
    validatorRegistry,
    serverFiles,
  )
  const xml = buildSlovenskoSkXml(xmlObject, { headless: false, pretty: false })
  const xsd = getSchemaXsd(formDefinition)
  const xslt = getHtmlSbXslt(formDefinition)

  return { xml, xsd, xslt }
}

export const getXmls = (params: GetSignerDataParams) => {
  if (isSlovenskoSkTaxFormDefinition(params.formDefinition)) {
    return getSlovenskoSkTaxXmls(params as GetSignerDataParams<FormDefinitionSlovenskoSkTax>)
  } else if (isSlovenskoSkGenericFormDefinition(params.formDefinition)) {
    return getSlovenskoSkGenericXmls(
      params as GetSignerDataParams<FormDefinitionSlovenskoSkGeneric>,
    )
  } else {
    throw new Error('Unsupported form definition type')
  }
}

export const getSignerData = (params: GetSignerDataParams) => {
  const { formDefinition, formId, formData } = params
  const { xml, xsd, xslt } = getXmls(params)

  return {
    signatureId: createFormSignatureId(formData),
    objectId: `object_${formId}`,
    objectDescription: '',
    objectFormatIdentifier: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
    xdcXMLData: xml,
    xdcIdentifier: '',
    xdcVersion: '',
    xslMediaDestinationTypeDescription: 'TXT',
    xslTargetEnvironment: '',
    xdcIncludeRefs: true,
    xdcNamespaceURI: 'http://data.gov.sk/def/container/xmldatacontainer+xml/1.0',
    xdcUsedXSD: xsd,
    xsdReferenceURI: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
    xdcUsedXSLT: xslt,
    xslReferenceURI: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}/form.xslt`,
    xslXSLTLanguage: 'sk',
  }
}
