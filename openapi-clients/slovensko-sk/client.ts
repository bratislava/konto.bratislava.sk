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

export const createSlovenskoSkClient = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig) => {
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
  }
}
