import {
  Configuration,
  InformcieOPrihlsenomPouvateoviApiFactory,
  ManipulciaSoSchrnkouApiFactory,
  ZasielaniePodanApiFactory,
} from './openapi-slovensko-sk'

const args = [
  {} as Configuration,
  process.env.SLOVENSKO_SK_CONTAINER_URI,
] as const

// eslint-disable-next-line import/prefer-default-export
export const slovenskoSkApi = {
  ...InformcieOPrihlsenomPouvateoviApiFactory(...args),
  ...ZasielaniePodanApiFactory(...args),
  ...ManipulciaSoSchrnkouApiFactory(...args),
}
