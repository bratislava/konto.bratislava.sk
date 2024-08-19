import { FormDefinitionSlovenskoSk } from '../definitions/formDefinitionTypes'

export const getSlovenskoSkXmlns = (formDefinition: FormDefinitionSlovenskoSk) =>
  `http://schemas.gov.sk/form/${formDefinition.pospID}/${formDefinition.pospVersion}`

export const getSlovenskoSkMetaIdentifier = (formDefinition: FormDefinitionSlovenskoSk) =>
  `http://data.gov.sk/doc/eform/${formDefinition.pospID}/${formDefinition.pospVersion}`

export function parseSlovenskoSkXmlnsString(xmlnsString: string) {
  const regex = /^http:\/\/schemas\.gov\.sk\/form\/([^/]+)\/([^/]+)$/

  const match = xmlnsString.match(regex)
  if (!match) {
    return null
  }

  const [, pospID, pospVersion] = match
  return {
    pospID,
    pospVersion,
  }
}
