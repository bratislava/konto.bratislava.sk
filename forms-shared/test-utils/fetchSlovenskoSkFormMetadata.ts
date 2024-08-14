import { JSDOM } from 'jsdom'
import { parseStringPromise } from 'xml2js'
import { FormDefinitionSlovenskoSk } from '../src/definitions/formDefinitionTypes'

interface SlovenskoSkMetadataXml {
  'meta:metadata': {
    $: {
      'xmlns:attachment': string
      'xmlns:manifest': string
      'xmlns:attachmentfile': string
      'xmlns:xs': string
      'xmlns:setting': string
      'xmlns:content': string
      'xmlns:dc': string
      'xmlns:presentation': string
      'xmlns:data': string
      'xmlns:meta': string
    }
    'dc:title': string[]
    'dc:identifier': string[]
    'dc:description': string[]
    'dc:creator': string[]
    'dc:publisher': string[]
    'meta:version': string[]
    'meta:validDateFrom': string[]
    'meta:inForceFrom': string[]
    'meta:inForceTo'?: string[]
  }
}

const getSlovenskoSkUrl = (formDefinition: FormDefinitionSlovenskoSk) => {
  const versionRegex = /^\d+\.\d+$/
  if (!versionRegex.test(formDefinition.pospVersion)) {
    throw new Error(
      'Invalid pospVersion format. Expected format: "x.y" where x and y are integers.',
    )
  }
  const [vh, vl] = formDefinition.pospVersion.split('.').map(Number)

  return `https://formulare.slovensko.sk/_layouts/eFLCM/DetailVzoruEFormulara.aspx?vid=${formDefinition.pospID}&vh=${vh}&vl=${vl}`
}

/**
 * Fetches the form metadata XML and converts it to JSON, e.g.:
 * https://formulare.slovensko.sk/_layouts/eFLCM/DetailVzoruEFormulara.aspx?vid=00603481.predzahradky&vh=1&vl=0
 */
export async function fetchSlovenskoSkFormMetadata(formDefintion: FormDefinitionSlovenskoSk) {
  const url = getSlovenskoSkUrl(formDefintion)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch the URL: ${response.statusText}`)
  }
  const htmlText = await response.text()

  const dom = new JSDOM(htmlText)
  const document = dom.window.document

  const textarea = document.querySelector(
    'textarea#PlaceHolderMain_metadataTextBox',
  ) as HTMLTextAreaElement
  if (!textarea) {
    throw new Error('Textarea with ID "PlaceHolderMain_metadataTextBox" not found')
  }
  const xmlContent = textarea.value
  const parsedXml = (await parseStringPromise(xmlContent)) as SlovenskoSkMetadataXml
  return parsedXml['meta:metadata']
}
