export type ValidateXmlResultError = {
  message: string
  line: number
  col: number
}

export type ValidateXmlResult =
  | {
      success: true
    }
  | {
      success: false
      errors?: ValidateXmlResultError[]
    }

export async function validateXml(
  xmlString: string,
  xsdString: string,
): Promise<ValidateXmlResult> {
  const { XmlDocument, XsdValidator, XmlLibError } = await import('libxml2-wasm')

  let xmlDoc: InstanceType<typeof XmlDocument> | null = null
  let xsdDoc: InstanceType<typeof XmlDocument> | null = null
  let xsdValidator: InstanceType<typeof XsdValidator> | null = null

  try {
    xmlDoc = XmlDocument.fromString(xmlString)
    xsdDoc = XmlDocument.fromString(xsdString)
    xsdValidator = XsdValidator.fromDoc(xsdDoc)

    xsdValidator.validate(xmlDoc)

    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof XmlLibError) {
      return {
        success: false,
        errors: error.details,
      }
    }

    return {
      success: false,
    }
  } finally {
    xsdValidator?.dispose()
    xmlDoc?.dispose()
    xsdDoc?.dispose()
  }
}

export const formatValidateXmlResultErrors = (errors: ValidateXmlResultError[]) => {
  return errors
    .map((error) => `${error.message} (line ${error.line}, column ${error.col})`)
    .join('\n')
}
