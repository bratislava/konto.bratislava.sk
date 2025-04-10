export async function validateXml(xmlString: string, xsdString: string) {
  try {
    const { XmlDocument, XsdValidator } = await import('libxml2-wasm')
    const xmlDoc = XmlDocument.fromString(xmlString)
    const xsdDoc = XmlDocument.fromString(xsdString)
    const xsdValidator = XsdValidator.fromDoc(xsdDoc)

    try {
      xsdValidator.validate(xmlDoc)
      return true
    } catch (e) {
      return false
    } finally {
      xsdValidator.dispose()
      xmlDoc.dispose()
      xsdDoc.dispose()
    }
  } catch (error) {
    return false
  }
}
