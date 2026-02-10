import { GenericObjectType } from '@rjsf/utils'
import useStateRef from 'react-usestateref'
import { useIsMounted } from 'usehooks-ts'

import { isDefined } from '@/frontend/utils/general'

import { mapDitecError, SignerErrorType } from './mapDitecError'
import { SignOptions } from './signerTypes'
import { useFormSignerLoader } from './useFormSignerLoader'

export enum SignerDeploymentStatus {
  NotDeployed,
  Deploying,
  Deployed,
}

type UseFormSignerProps = {
  onDeploymentStatusChange?: (status: SignerDeploymentStatus) => void
  onError?: (error: SignerErrorType) => void
}

/**
 * A wrapper around the Ditec signer library that aspires to make it more engineered and stable.
 *
 * Based on the preexisting work: https://github.com/bratislava/slovensko-backend/blob/master/public/signer.js
 * As the official documentation https://www.ditec.sk/produkty/informacie_pre_integratorov_aplikacii_pre_kep lacks the
 * necessary information, to develop this I needed to reverse engineer the code from the official slovensko.sk
 * implementation: https://schranka.slovensko.sk/Content/jscript/DSignerMulti.js
 *
 * How to access the official implementation:
 * 1. Go to https://www.slovensko.sk/sk/detail-sluzby?externalCode=App.GeneralAgenda
 * 2. Select "Testovacia identita portálu slovensko.sk"
 * 3. Log in.
 * 4. Debug.
 */
export const useFormSigner = ({
  onDeploymentStatusChange = () => {},
  onError = () => {},
}: UseFormSignerProps) => {
  const { platforms } = useFormSignerLoader()
  const isMounted = useIsMounted()
  // We need also the ref variant, to be accessed in the callbacks.
  const [deploymentStatus, setDeploymentStatus, deploymentStatusRef] = useStateRef(
    SignerDeploymentStatus.NotDeployed,
  )

  const updateDeploymentStatus = (status: SignerDeploymentStatus) => {
    if (isMounted()) {
      setDeploymentStatus(status)
      onDeploymentStatusChange(status)
    }
  }

  /**
   * Errors in the signer library are not definite and work like a stream. For example, when deploying the signer the
   * library has a list of platforms and tries to spawn them in consecutive order. If one of them fails to deploy, it will
   * throw an error, but it will continue to load the rest of the platforms. Therefore, the signer can throw an error
   * and then successfully return a signature.
   */
  const handleError = (error: GenericObjectType) => {
    const mappedError = mapDitecError(error)
    if (isDefined(mappedError)) {
      onError(mappedError)
    }
  }

  const sign = ({
    objectId,
    objectDescription,
    objectFormatIdentifier,
    xdcXMLData,
    xdcIdentifier,
    xdcVersion,
    xdcUsedXSD,
    xsdReferenceURI,
    xdcUsedXSLT,
    xslReferenceURI,
    xslMediaDestinationTypeDescription,
    xslXSLTLanguage,
    xslTargetEnvironment,
    xdcIncludeRefs,
    xdcNamespaceURI,
    signatureId,
    digestAlgUrl = '',
    signaturePolicyIdentifier = '',
  }: SignOptions) => {
    return new Promise<string>((resolve) => {
      const signer = ditec.dSigXadesBpJs

      const handleGetSignature = (instance: string) => {
        resolve(instance)
      }

      const handleSignSuccess = () =>
        signer.getSignatureWithASiCEnvelopeBase64({
          onSuccess: handleGetSignature,
          onError: handleError,
        })

      const handleObjectAddedSuccess = () =>
        signer.sign(signatureId, digestAlgUrl, signaturePolicyIdentifier, {
          onSuccess: handleSignSuccess,
          onError: handleError,
        })

      const handleInitializeSuccess = () => {
        signer.addXmlObject(
          objectId,
          objectDescription,
          objectFormatIdentifier,
          xdcXMLData,
          xdcIdentifier,
          xdcVersion,
          xdcUsedXSD,
          xsdReferenceURI,
          xdcUsedXSLT,
          xslReferenceURI,
          xslMediaDestinationTypeDescription,
          xslXSLTLanguage,
          xslTargetEnvironment,
          xdcIncludeRefs,
          xdcNamespaceURI,
          // If more than one file is added, this callbacks must chain the addXmlObject calls.
          { onSuccess: handleObjectAddedSuccess, onError: handleError },
        )
      }

      const handleDeploySuccess = () => {
        if (deploymentStatusRef.current === SignerDeploymentStatus.Deploying) {
          updateDeploymentStatus(SignerDeploymentStatus.Deployed)
        }
        signer.initialize({ onSuccess: handleInitializeSuccess, onError: handleError })
      }

      if (!platforms) {
        // This should never happen in this stage.
        throw new Error('No supported platforms found.')
      }

      if (
        deploymentStatusRef.current === SignerDeploymentStatus.NotDeployed ||
        deploymentStatusRef.current === SignerDeploymentStatus.Deploying
      ) {
        signer.deploy(
          { platforms },
          {
            onSuccess: handleDeploySuccess,
            onError: (error) => {
              updateDeploymentStatus(SignerDeploymentStatus.NotDeployed)
              handleError(error)
            },
          },
        )
        updateDeploymentStatus(SignerDeploymentStatus.Deploying)
      } else {
        handleDeploySuccess()
      }
    })
  }

  return {
    deploymentStatus,
    sign,
  }
}
