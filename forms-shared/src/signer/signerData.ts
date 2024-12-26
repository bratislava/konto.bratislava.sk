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

  const xdcXMLData = generateTaxXml(formData, false, formDefinition)
  const xdcUsedXSD = getTaxXsd(formDefinition)
  const xdcUsedXSLT = getTaxXslt(formDefinition)

  return { xdcXMLData, xdcUsedXSD, xdcUsedXSLT, xslMediaDestinationTypeDescription: 'TXT' }
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

  return { xdcXMLData, xdcUsedXSD, xdcUsedXSLT, xslMediaDestinationTypeDescription: 'HTML' }
}

export const getXmls = async (params: GetSignerDataParams) => {
  if (isSlovenskoSkTaxFormDefinition(params.formDefinition)) {
    return getSlovenskoSkTaxXmls(params as GetSignerDataParams<FormDefinitionSlovenskoSkTax>)
  } else if (isSlovenskoSkGenericFormDefinition(params.formDefinition)) {
    return await getSlovenskoSkGenericXmls(
      params as GetSignerDataParams<FormDefinitionSlovenskoSkGeneric>,
    )
  } else {
    throw new Error('Unsupported form definition type')
  }
}

export const getSignerData = async (params: GetSignerDataParams) => {
  const { formDefinition, formId, formData } = params
  const { xdcXMLData, xdcUsedXSD, xdcUsedXSLT, xslMediaDestinationTypeDescription } =
    await getXmls(params)

  return {
    signatureId: createFormSignatureId(formData),
    objectId: `object_${formId}`,
    objectDescription: '',
    objectFormatIdentifier: `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`,
    xdcXMLData,
    xdcIdentifier: '',
    xdcVersion: '',
    xslMediaDestinationTypeDescription,
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
