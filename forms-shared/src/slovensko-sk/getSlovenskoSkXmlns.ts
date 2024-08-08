import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'

export const getSlovenskoSkXmlns = (formDefinition: FormDefinitionSlovenskoSk) =>
  `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`
