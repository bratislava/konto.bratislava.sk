import AdmZip from 'adm-zip'
import { parseStringPromise } from 'xml2js'

import { FormSignature } from '../../components/forms/signer/useFormSignature'
import { parseObjectHashFromFormSignatureId } from './formSignature'

export async function extractSignatureIdFromAsice(base64Asice: string | undefined) {
  if (!base64Asice) {
    return null
  }
  try {
    const binaryZip = Buffer.from(base64Asice, 'base64')
    const zip = new AdmZip(binaryZip)
    const signaturesXmlEntry = zip.getEntry('META-INF/signatures.xml')

    if (!signaturesXmlEntry) {
      return null
    }

    const signaturesXmlContent = zip.readAsText(signaturesXmlEntry)
    const xmlTree = await parseStringPromise(signaturesXmlContent)

    // <asic:XAdESSignatures><ds:Signature Id="(signature_id)">...
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const id = xmlTree?.['asic:XAdESSignatures']?.['ds:Signature']?.[0]?.$?.Id

    if (typeof id !== 'string') {
      return null
    }

    return id
  } catch (error) {
    return null
  }
}

/**
 * To check the validity of the signature generate the object hash of the JSON data and store it in the signature id.
 * The signature is base64 encoded ASiCe container. The signature id is stored in META-INF/signatures.xml file. This
 * function attempts to extract it, however if extracted successfully, it doesn't mean that the signature is valid for
 * the JSON data, the FE displays whether it is.
 */
export async function getInitialFormSignature(base64Asice: string | null | undefined) {
  if (!base64Asice) {
    return null
  }

  const signatureId = await extractSignatureIdFromAsice(base64Asice)
  if (!signatureId) {
    return null
  }

  const parsed = parseObjectHashFromFormSignatureId(signatureId)
  if (!parsed) {
    return null
  }

  return {
    signature: base64Asice,
    objectHash: parsed,
  } satisfies FormSignature
}
