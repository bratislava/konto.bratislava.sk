import { Test, TestingModule } from '@nestjs/testing'

import { Tier } from '../utils/global-enums/city-account.enum'
import AuthService from './auth.service'
import {
  CognitoGetUserAttributesData,
  CognitoUserAttributesDto,
} from './dtos/cognito.dto'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    jest.resetAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile()

    service = app.get<AuthService>(AuthService)
  })

  describe('should be defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })
  })

  describe('attributesToObject', () => {
    const attributes: CognitoUserAttributesDto[] = [
      { Name: 'sub', Value: 'sub' },
      { Name: 'email_verified', Value: 'yes' },
      { Name: 'custom:tier', Value: Tier.EID },
      { Name: 'family_name' },
    ]
    const expected: CognitoGetUserAttributesData = {
      sub: 'sub',
      email_verified: 'yes',
      'custom:tier': Tier.EID,
    }

    it('should correctly return', () => {
      expect(service['attributesToObject'](attributes)).toEqual(expected)
    })

    it('should correctly return even with extra data', () => {
      const extraAttributes: CognitoUserAttributesDto[] = [
        ...attributes,
        { Name: 'extra', Value: 'valueExtra' },
      ]
      expect(service['attributesToObject'](extraAttributes)).toEqual({
        ...expected,
        extra: 'valueExtra',
      })
    })
  })
})
