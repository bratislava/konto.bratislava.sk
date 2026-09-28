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

export interface MagproxyClient
  extends
    ReturnType<typeof AdminApiFactory>,
    ReturnType<typeof DefaultApiFactory>,
    ReturnType<typeof DeveloperApiFactory>,
    ReturnType<typeof KNKatasterNehnutenostApiFactory>,
    ReturnType<typeof NEVNrodnEvidenciaVozidielApiFactory>,
    ReturnType<typeof RARegisterAdriesApiFactory>,
    ReturnType<typeof RFORegisterFyzickchOsbApiFactory>,
    ReturnType<typeof RPORegisterPrvnickchOsbApiFactory>,
    ReturnType<typeof RSDRegisterSocilnychDvokApiFactory> {}

export const createMagproxyClient = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig): MagproxyClient => {
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
  } satisfies MagproxyClient
}
