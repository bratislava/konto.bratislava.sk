import { ErrorEnum, ErrorFactoryService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { CognitoUserAttributesTierEnum } from 'openapi-clients/city-account'
import type { Mocked } from 'vitest'

import alertReporting from '../../../utils/constants/error.alerts'
import { TIERS_KEY } from '../../../utils/decorators/tier.decorator'
import { CognitoSubservice } from '../../../utils/subservices/cognito.subservice'
import { TiersGuard } from '../tiers.guard'

const USER_SUB = 'user-sub-123'

const makeMockContext = (sub = USER_SUB): ExecutionContext =>
  createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ cognito_jwt_payload: { sub } }),
    }),
  })

describe('TiersGuard', () => {
  let guard: TiersGuard
  let reflector: Mocked<Reflector>
  let cognitoSubservice: Mocked<CognitoSubservice>
  const errorFactoryService = new ErrorFactoryService({ alertReporting })
  const forbiddenTierError = errorFactoryService.ForbiddenException({
    errorEnum: ErrorEnum.FORBIDDEN_ERROR,
    message: 'Forbidden tier',
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TiersGuard,
        { provide: Reflector, useValue: createMock<Reflector>() },
        {
          provide: CognitoSubservice,
          useValue: createMock<CognitoSubservice>(),
        },
        { provide: ErrorFactoryService, useValue: errorFactoryService },
      ],
    }).compile()

    guard = module.get(TiersGuard)
    reflector = module.get(Reflector)
    cognitoSubservice = module.get(CognitoSubservice)
  })

  describe('when no tiers are required', () => {
    it('should return true and skip Cognito when metadata is undefined', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined)

      const result = await guard.canActivate(makeMockContext())

      expect(result).toBe(true)
      expect(cognitoSubservice.getUserTierFromCognito).not.toHaveBeenCalled()
    })

    it('should return true and skip Cognito when metadata is an empty array', async () => {
      reflector.getAllAndOverride.mockReturnValue([])

      const result = await guard.canActivate(makeMockContext())

      expect(result).toBe(true)
      expect(cognitoSubservice.getUserTierFromCognito).not.toHaveBeenCalled()
    })
  })

  describe('reflector usage', () => {
    it('should query reflector with TIERS_KEY and both handler and class', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined)
      const ctx = makeMockContext()

      await guard.canActivate(ctx)

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(TIERS_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ])
    })
  })

  describe('when tiers are required', () => {
    it('should call Cognito with the sub from JWT payload', async () => {
      reflector.getAllAndOverride.mockReturnValue([
        CognitoUserAttributesTierEnum.IdentityCard,
      ])
      cognitoSubservice.getUserTierFromCognito.mockResolvedValue(
        CognitoUserAttributesTierEnum.IdentityCard,
      )

      await guard.canActivate(makeMockContext('specific-sub'))

      expect(cognitoSubservice.getUserTierFromCognito).toHaveBeenCalledWith(
        'specific-sub',
      )
    })
  })

  describe('when user tier matches', () => {
    it('should return true for a single-tier requirement that matches', async () => {
      reflector.getAllAndOverride.mockReturnValue([
        CognitoUserAttributesTierEnum.IdentityCard,
      ])
      cognitoSubservice.getUserTierFromCognito.mockResolvedValue(
        CognitoUserAttributesTierEnum.IdentityCard,
      )

      const result = await guard.canActivate(makeMockContext())

      expect(result).toBe(true)
    })

    it('should return true when user tier matches the first of multiple required tiers', async () => {
      reflector.getAllAndOverride.mockReturnValue([
        CognitoUserAttributesTierEnum.IdentityCard,
        CognitoUserAttributesTierEnum.Eid,
      ])
      cognitoSubservice.getUserTierFromCognito.mockResolvedValue(
        CognitoUserAttributesTierEnum.IdentityCard,
      )

      const result = await guard.canActivate(makeMockContext())

      expect(result).toBe(true)
    })

    it('should return true when user tier matches the last of multiple required tiers', async () => {
      reflector.getAllAndOverride.mockReturnValue([
        CognitoUserAttributesTierEnum.IdentityCard,
        CognitoUserAttributesTierEnum.Eid,
      ])
      cognitoSubservice.getUserTierFromCognito.mockResolvedValue(
        CognitoUserAttributesTierEnum.Eid,
      )

      const result = await guard.canActivate(makeMockContext())

      expect(result).toBe(true)
    })

    it('should return true for every possible tier when it is the sole requirement', async () => {
      const allTiers = Object.values(CognitoUserAttributesTierEnum)

      await Promise.all(
        allTiers.map(async (tier) => {
          reflector.getAllAndOverride.mockReturnValue([tier])
          cognitoSubservice.getUserTierFromCognito.mockResolvedValue(tier)
          const result = await guard.canActivate(makeMockContext())
          expect(result).toBe(true)
        }),
      )
    })
  })

  describe('when user tier does not match', () => {
    it('should throw a 403 ForbiddenException for a single-tier mismatch', async () => {
      reflector.getAllAndOverride.mockReturnValue([
        CognitoUserAttributesTierEnum.IdentityCard,
      ])
      cognitoSubservice.getUserTierFromCognito.mockResolvedValue(
        CognitoUserAttributesTierEnum.New,
      )

      await expect(guard.canActivate(makeMockContext())).rejects.toThrow(
        forbiddenTierError,
      )
    })

    it('should throw a 403 ForbiddenException when user tier matches none of multiple required tiers', async () => {
      reflector.getAllAndOverride.mockReturnValue([
        CognitoUserAttributesTierEnum.IdentityCard,
        CognitoUserAttributesTierEnum.Eid,
      ])
      cognitoSubservice.getUserTierFromCognito.mockResolvedValue(
        CognitoUserAttributesTierEnum.New,
      )

      await expect(guard.canActivate(makeMockContext())).rejects.toThrow(
        forbiddenTierError,
      )
    })
  })

  describe('when Cognito throws', () => {
    it('should propagate the error without catching it', async () => {
      const cognitoError = new Error('Cognito unavailable')
      reflector.getAllAndOverride.mockReturnValue([
        CognitoUserAttributesTierEnum.IdentityCard,
      ])
      cognitoSubservice.getUserTierFromCognito.mockRejectedValue(cognitoError)

      await expect(guard.canActivate(makeMockContext())).rejects.toThrow(
        cognitoError,
      )
    })
  })
})
