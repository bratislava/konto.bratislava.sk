import * as libxmljs from 'libxmljs'

export function validateXML(xmlString: string, xsdString: string): boolean {
  try {
    const xmlDoc = libxmljs.parseXml(xsdString);
    const xsdDoc = libxmljs.parseXml(xmlString);

    return xmlDoc.validate(xsdDoc) as boolean;
  } catch (error) {
    console.log(error);
    return false;
  }
}
