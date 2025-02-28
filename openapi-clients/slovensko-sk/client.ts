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
import { Configuration } from './configuration'
import type { AxiosInstance } from 'axios'

export const createSlovenskoSkClient = (
  configuration: Configuration = {} as Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) => {
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
