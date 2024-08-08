import * as libxmljs from 'libxmljs'

export function validateXml(xmlString: string, xsdString: string) {
  try {
    const xmlDoc = libxmljs.parseXml(xmlString)
    const xsdDoc = libxmljs.parseXml(xsdString)

    return xmlDoc.validate(xsdDoc) as boolean
  } catch (error) {
    return false
  }
}
