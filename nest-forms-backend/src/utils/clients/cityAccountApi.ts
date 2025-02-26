import {
  Configuration,
  UsersManipulationApiFactory,
  UserVerificationsApiFactory,
} from './openapi-city-account'

const args = [{} as Configuration, process.env.USER_ACCOUNT_API] as const

// eslint-disable-next-line import/prefer-default-export
export const cityAccountApi = {
  ...UsersManipulationApiFactory(...args),
  ...UserVerificationsApiFactory(...args),
}
