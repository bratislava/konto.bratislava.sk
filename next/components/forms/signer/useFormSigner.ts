import useStateRef from 'react-usestateref'
import { useIsMounted } from 'usehooks-ts'

import { SignOptions } from './signerTypes'

enum DeploymentStatus {
  NotDeployed,
  Deploying,
  Deployed,
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
export const useFormSigner = () => {
  const isMounted = useIsMounted()
  // We need also the ref variant, to be accessed in the callbacks.
  const [deploymentStatus, setDeploymentStatus, deploymentStatusRef] = useStateRef(
    DeploymentStatus.NotDeployed,
  )

  const updateDeploymentStatus = (status: DeploymentStatus) => {
    if (isMounted()) {
      setDeploymentStatus(status)
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
    return new Promise<string>((resolve, reject) => {
      const signer = ditec.dSigXadesBpJs

      const handleError = (error) => {
        // TODO explore ditec error types
        reject(error)
      }

      const handleGetSignature = (instance: string) => {
        // TODO this returns nothing right now, examine
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
        if (deploymentStatusRef.current === DeploymentStatus.Deploying) {
          updateDeploymentStatus(DeploymentStatus.Deployed)
        }
        signer.initialize({ onSuccess: handleInitializeSuccess, onError: handleError })
      }

      if (deploymentStatusRef.current === DeploymentStatus.NotDeployed) {
        signer.deploy(
          {},
          {
            onSuccess: handleDeploySuccess,
            onError: (error) => {
              updateDeploymentStatus(DeploymentStatus.NotDeployed)
              handleError(error)
            },
          },
        )
        updateDeploymentStatus(DeploymentStatus.Deploying)
      } else if (deploymentStatusRef.current === DeploymentStatus.Deploying) {
        // TODO improve error
        throw new Error('Already initializing')
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
