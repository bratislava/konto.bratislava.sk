import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'

export const createTestUserDataFromCityAccount = (
  overrides?: Partial<ResponseUserByBirthNumberDto>,
): ResponseUserByBirthNumberDto => ({
  birthNumber: null,
  email: null,
  externalId: null,
  userAttribute: {},
  ...overrides,
})
