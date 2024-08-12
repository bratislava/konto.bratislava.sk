import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'

export const getSlovenskoSkXmlns = (formDefinition: FormDefinitionSlovenskoSk) =>
  `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`

export const getSlovenskoSkMetaIdentifier = (formDefinition: FormDefinitionSlovenskoSk) =>
  `http://data.gov.sk/doc/eform/${formDefinition.pospID}/${formDefinition.pospVersion}`
