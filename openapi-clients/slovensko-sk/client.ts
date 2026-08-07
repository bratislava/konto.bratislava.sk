import {
  CentrlnaRadnTabuaDostupnLenPreOVMApiFactory,
  DlhodobLoiskoApiFactory,
  InformcieOPrihlsenomPouvateoviApiFactory,
  ManamentAutentifikanchCertifiktovAdministrciaApiFactory,
  ManipulciaSoSchrnkouApiFactory,
  PodpisovanieApiFactory,
  PrihlasovaniePomocouEIDApiFactory,
  StavKomponentuMonitoringApiFactory,
  UniverzlneSynchrnneRozhranieSluiebPVSApiFactory,
  VyhadvanieIdenttDostupnLenPreOVMApiFactory,
  ZasielaniePodanApiFactory,
  ZasielaniePodanAdministrciaApiFactory,
} from './api'
import { Configuration, ConfigurationParameters } from './configuration'
import type { AxiosInstance } from 'axios'

type ClientConfig = {
  basePath: string
  configurationParameters?: ConfigurationParameters
  axios?: AxiosInstance
}

export interface SlovenskoSkClient
  extends
    ReturnType<typeof CentrlnaRadnTabuaDostupnLenPreOVMApiFactory>,
    ReturnType<typeof DlhodobLoiskoApiFactory>,
    ReturnType<typeof InformcieOPrihlsenomPouvateoviApiFactory>,
    ReturnType<typeof ManamentAutentifikanchCertifiktovAdministrciaApiFactory>,
    ReturnType<typeof ManipulciaSoSchrnkouApiFactory>,
    ReturnType<typeof PodpisovanieApiFactory>,
    ReturnType<typeof PrihlasovaniePomocouEIDApiFactory>,
    ReturnType<typeof StavKomponentuMonitoringApiFactory>,
    ReturnType<typeof UniverzlneSynchrnneRozhranieSluiebPVSApiFactory>,
    ReturnType<typeof VyhadvanieIdenttDostupnLenPreOVMApiFactory>,
    ReturnType<typeof ZasielaniePodanApiFactory>,
    ReturnType<typeof ZasielaniePodanAdministrciaApiFactory> {}

export const createSlovenskoSkClient = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig): SlovenskoSkClient => {
  const configuration = new Configuration(configurationParameters)
  const args = [configuration, basePath, axios] as const

  return {
    ...CentrlnaRadnTabuaDostupnLenPreOVMApiFactory(...args),
    ...DlhodobLoiskoApiFactory(...args),
    ...InformcieOPrihlsenomPouvateoviApiFactory(...args),
    ...ManamentAutentifikanchCertifiktovAdministrciaApiFactory(...args),
    ...ManipulciaSoSchrnkouApiFactory(...args),
    ...PodpisovanieApiFactory(...args),
    ...PrihlasovaniePomocouEIDApiFactory(...args),
    ...StavKomponentuMonitoringApiFactory(...args),
    ...UniverzlneSynchrnneRozhranieSluiebPVSApiFactory(...args),
    ...VyhadvanieIdenttDostupnLenPreOVMApiFactory(...args),
    ...ZasielaniePodanApiFactory(...args),
    ...ZasielaniePodanAdministrciaApiFactory(...args),
  } satisfies SlovenskoSkClient
}
