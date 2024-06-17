import { JSDOM } from 'jsdom'
import { parseStringPromise } from 'xml2js'

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

/**
 * Fetches the form metadata XML and converts it to JSON, e.g.:
 * https://formulare.slovensko.sk/_layouts/eFLCM/DetailVzoruEFormulara.aspx?vid=00603481.predzahradky&vh=1&vl=0
 */
export async function fetchSlovenskoSkFormMetadata(url: string) {
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
