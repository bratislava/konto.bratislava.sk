import { FormDefinitionSlovenskoSk } from '../../definitions/formDefinitionTypes'
import { getEmptySlovenskoSkXmlObject } from '../generateXml'
import { buildSlovenskoSkXml } from '../xmlBuilder'

export const getEmptyXml = (formDefinition: FormDefinitionSlovenskoSk) => {
  const emptyXmlObject = getEmptySlovenskoSkXmlObject(formDefinition)
  return buildSlovenskoSkXml(emptyXmlObject, { headless: false, pretty: true })
}
