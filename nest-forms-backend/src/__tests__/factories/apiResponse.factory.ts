import { createMock } from '@golevelup/ts-jest'
import {
  type CityAccountClient,
  CognitoUserAccountTypesEnum,
  type UserIntegrationControllerGetContactAndIdInfoByExternalId200Response,
} from 'openapi-clients/city-account'
import type {
  ApiIamIdentitiesIdGet200Response,
  SlovenskoSkClient,
} from 'openapi-clients/slovensko-sk'

type CityAccountUserApiResponse = Awaited<
  ReturnType<CityAccountClient['userIntegrationControllerGetContactAndIdInfoByExternalId']>
>

type SlovenskoSkIdentitiesApiResponse = Awaited<
  ReturnType<SlovenskoSkClient['apiIamIdentitiesSearchPost']>
>

export const createCityAccountUserApiResponseMock = (
  overrides?: Partial<UserIntegrationControllerGetContactAndIdInfoByExternalId200Response>,
): CityAccountUserApiResponse =>
  createMock<CityAccountUserApiResponse>({
    data: {
      externalId: 'test-external-id',
      accountType: CognitoUserAccountTypesEnum.Fo,
      ...overrides,
    },
  })

export const createSlovenskoSkIdentitiesApiResponseMock = (
  data: ApiIamIdentitiesIdGet200Response[] = [],
): SlovenskoSkIdentitiesApiResponse =>
  createMock<SlovenskoSkIdentitiesApiResponse>({ data })
