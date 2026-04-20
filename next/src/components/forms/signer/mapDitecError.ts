import { GenericObjectType } from '@rjsf/utils'

export enum SignerErrorType {
  NotInstalled = 'NotInstalled',
  LaunchFailed = 'LaunchFailed',
}

/**
 * The list of error codes is available in the official documentation:
 * https://www.ditec.sk/static/zep/dbridge_js/v1.0/Integracna_prirucka_D.Bridge_JS,_v1.0.zip
 * in "7. Návratové kódy" section. These are only codes that are returned from the JS library.
 * More codes can be found in D.Signer/XAdES Java or .NET documentation:
 * https://www.ditec.sk/produkty/informacie_pre_integratorov_aplikacii_pre_kep
 *
 * However, these seem to be only relevant codes that we should display to the user.
 */
export const ditecErrorMap = {
  '-201': SignerErrorType.NotInstalled,
  '-202': SignerErrorType.LaunchFailed,
}

export const mapDitecError = (error: GenericObjectType) => {
  if (typeof error !== 'object' || error.name !== 'DitecError') {
    return
  }

  const errorCode = error.code as string
  // eslint-disable-next-line consistent-return
  return ditecErrorMap[errorCode] as SignerErrorType
}
