import {
  AdminApiFactory,
  DefaultApiFactory,
  DeveloperApiFactory,
  KNKatasterNehnutenostApiFactory,
  NEVNrodnEvidenciaVozidielApiFactory,
  RARegisterAdriesApiFactory,
  RFORegisterFyzickchOsbApiFactory,
  RPORegisterPrvnickchOsbApiFactory,
  RSDRegisterSocilnychDvokApiFactory,
} from './api'
import { Configuration, ConfigurationParameters } from './configuration'
import type { AxiosInstance } from 'axios'

type ClientConfig = {
  basePath: string
  configurationParameters?: ConfigurationParameters
  axios?: AxiosInstance
}

export type MagproxyClient = ReturnType<typeof createMagproxyClient>

export const createMagproxyClient = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig) => {
  const configuration = new Configuration(configurationParameters)
  const args = [configuration, basePath, axios] as const

  return {
    ...AdminApiFactory(...args),
    ...DefaultApiFactory(...args),
    ...DeveloperApiFactory(...args),
    ...KNKatasterNehnutenostApiFactory(...args),
    ...NEVNrodnEvidenciaVozidielApiFactory(...args),
    ...RARegisterAdriesApiFactory(...args),
    ...RFORegisterFyzickchOsbApiFactory(...args),
    ...RPORegisterPrvnickchOsbApiFactory(...args),
    ...RSDRegisterSocilnychDvokApiFactory(...args),
  }
}
