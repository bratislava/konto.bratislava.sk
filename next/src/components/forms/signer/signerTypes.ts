import { GenericObjectType } from '@rjsf/utils'

/**
 * Type definitions for D.Bridge JS.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ditec {
    interface Callback<Instance = undefined, Error = GenericObjectType> {
      onSuccess: (instance: Instance) => void
      onError: (error: Error) => void
    }

    interface DSigXadesBpJs {
      deploy: (options: { platforms: string[] }, callback: Callback) => void
      initialize: (callback: Callback) => void
      addXmlObject: (
        objectId: string,
        objectDescription: string,
        objectFormatIdentifier: string,
        xdcXMLData: string,
        xdcIdentifier: string,
        xdcVersion: string,
        xdcUsedXSD: string,
        xsdReferenceURI: string,
        xdcUsedXSLT: string,
        xslReferenceURI: string,
        xslMediaDestinationTypeDescription: string,
        xslXSLTLanguage: string,
        xslTargetEnvironment: string,
        xdcIncludeRefs: boolean,
        xdcNamespaceURI: string,
        callback: Callback,
      ) => void
      sign: (
        signatureId: string,
        digestAlgUrl: string,
        signaturePolicyIdentifier: string,
        callback: Callback,
      ) => void
      getSignatureWithASiCEnvelopeBase64: (callback: Callback<string>) => void
      detectSupportedPlatforms: (platforms: string[] | null, callback: Callback<string[]>) => void
    }

    const dSigXadesBpJs: DSigXadesBpJs
  }
}

export type SignOptions = {
  objectId: string
  objectDescription: string
  objectFormatIdentifier: string
  xdcXMLData: string
  xdcIdentifier: string
  xdcVersion: string
  xdcUsedXSD: string
  xsdReferenceURI: string
  xdcUsedXSLT: string
  xslReferenceURI: string
  xslMediaDestinationTypeDescription: string
  xslXSLTLanguage: string
  xslTargetEnvironment: string
  xdcIncludeRefs: boolean
  xdcNamespaceURI: string
  signatureId: string
  digestAlgUrl?: string
  signaturePolicyIdentifier?: string
}

// This is required to make the module work with TypeScript.
export {}
