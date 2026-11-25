import { LineLoggerService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'
import type { Mocked } from 'vitest'

import prismaMock from '../../test/singleton'
import { cognitoUserDataFactory } from '../__tests__/factories/cognitoUserData.factory'
import { BloomreachUnVerificationReasonEnum } from '../bloomreach/bloomreach.types'
import { BloomreachOutboxService } from '../bloomreach/bloomreach-outbox.service'
import {
  CognitoUserAttributesTierEnum,
  DeliveryMethodEnum,
  DeliveryMethodUserPreferenceEnum,
} from '../generated/prisma/enums'
import { NorisDeliveryMethodService } from '../noris/services/noris-delivery-method.service'
import { PrismaService } from '../prisma/prisma.service'
import {
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { UnverifySkipReasonEnum } from './dtos/unverify-users-with-failing-edesk-update.dto'
import { UserTierService } from './user-tier.service'
import { UnverifyCandidate, UserUnverificationService } from './user-unverification.service'

const candidateFactory = (overrides: Partial<UnverifyCandidate> = {}): UnverifyCandidate => ({
  id: 'user-id',
  externalId: 'external-id',
  birthNumber: '0101010000',
  taxDeliveryMethod: null,
  taxDeliveryMethodAtLockDate: null,
  physicalEntityId: 'physical-entity-id',
  hasUri: true,
  ...overrides,
})

const identityCardUser = cognitoUserDataFactory({
  [CognitoUserAttributesEnum.TIER]: CognitoUserAttributesTierEnum.IDENTITY_CARD,
})

describe('UserUnverificationService', () => {
  let service: UserUnverificationService
  let cognitoSubservice: Mocked<CognitoSubservice>
  let userTierService: Mocked<UserTierService>
  let norisDeliveryMethodService: Mocked<NorisDeliveryMethodService>
  let bloomreachOutboxService: Mocked<BloomreachOutboxService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserUnverificationService,
        LineLoggerService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CognitoSubservice, useValue: createMock<CognitoSubservice>() },
        { provide: UserTierService, useValue: createMock<UserTierService>() },
        {
          provide: NorisDeliveryMethodService,
          useValue: createMock<NorisDeliveryMethodService>(),
        },
        { provide: BloomreachOutboxService, useValue: createMock<BloomreachOutboxService>() },
      ],
    }).compile()

    service = module.get(UserUnverificationService)
    cognitoSubservice = module.get(CognitoSubservice)
    userTierService = module.get(UserTierService)
    norisDeliveryMethodService = module.get(NorisDeliveryMethodService)
    bloomreachOutboxService = module.get(BloomreachOutboxService)

    prismaMock.$transaction.mockImplementation(async (fn) => fn(prismaMock))
    cognitoSubservice.getDataFromCognito.mockResolvedValue(identityCardUser)
  })

  describe('unverifyUsersWithFailingEdeskUpdate', () => {
    it('should only report candidates and change nothing in a dry run', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        candidateFactory({
          externalId: 'a',
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
          taxDeliveryMethodAtLockDate: DeliveryMethodEnum.CITY_ACCOUNT,
        }),
        candidateFactory({ externalId: 'b', hasUri: false }),
      ])

      const result = await service.unverifyUsersWithFailingEdeskUpdate({})

      expect(result).toEqual({
        dryRun: true,
        unverified: ['a', 'b'],
        stats: { withUri: 1, withoutUri: 1, cityAccountPreference: 1, cityAccountLocked: 1 },
        skipped: [],
        failed: [],
        nextAfterUserId: undefined,
      })
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(norisDeliveryMethodService.removeDeliveryMethodsFromNoris).not.toHaveBeenCalled()
      expect(userTierService.changeTier).not.toHaveBeenCalled()
      expect(bloomreachOutboxService.trackUnVerification).not.toHaveBeenCalled()
    })

    it('should skip users whose Cognito tier is not IDENTITY_CARD or who are not physical entities', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        candidateFactory({ externalId: 'eid' }),
        candidateFactory({ externalId: 'legal' }),
      ])
      // Candidates are checked sequentially, in this order.
      cognitoSubservice.getDataFromCognito
        .mockResolvedValueOnce(
          cognitoUserDataFactory({
            [CognitoUserAttributesEnum.TIER]: CognitoUserAttributesTierEnum.EID,
          })
        )
        .mockResolvedValueOnce(
          cognitoUserDataFactory({
            [CognitoUserAttributesEnum.ACCOUNT_TYPE]: CognitoUserAccountTypesEnum.LEGAL_ENTITY,
            [CognitoUserAttributesEnum.TIER]: CognitoUserAttributesTierEnum.IDENTITY_CARD,
          })
        )

      const result = await service.unverifyUsersWithFailingEdeskUpdate({ dryRun: false })

      expect(result.unverified).toEqual([])
      expect(result.skipped).toEqual([
        { externalId: 'eid', reason: UnverifySkipReasonEnum.COGNITO_TIER_NOT_IDENTITY_CARD },
        { externalId: 'legal', reason: UnverifySkipReasonEnum.NOT_PHYSICAL_ENTITY },
      ])
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('should un-verify the user everywhere', async () => {
      prismaMock.$queryRaw.mockResolvedValue([candidateFactory()])

      const result = await service.unverifyUsersWithFailingEdeskUpdate({ dryRun: false })

      expect(result.unverified).toEqual(['external-id'])
      expect(norisDeliveryMethodService.removeDeliveryMethodsFromNoris).toHaveBeenCalledWith(
        '0101010000'
      )
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: {
          birthNumber: null,
          ifo: null,
          taxDeliveryMethod: null,
          taxDeliveryMethodAtLockDate: null,
          taxDeliveryMethodCityAccountLockDate: null,
          lastTaxDeliveryMethodsUpdateYear: null,
          userIdCardVerify: { deleteMany: {} },
        },
      })
      expect(prismaMock.physicalEntity.update).toHaveBeenCalledWith({
        where: { id: 'physical-entity-id' },
        data: {
          userId: null,
          uri: null,
          uriPossiblyOutdated: false,
          activeEdesk: null,
          activeEdeskUpdatedAt: null,
          activeEdeskUpdateFailedAt: null,
          activeEdeskUpdateFailCount: 0,
        },
      })
      expect(prismaMock.identityLookupRejection.deleteMany).toHaveBeenCalledWith({
        where: { physicalEntityId: 'physical-entity-id' },
      })
      expect(prismaMock.physicalEntity.delete).not.toHaveBeenCalled()
      expect(userTierService.changeTier).toHaveBeenCalledWith(
        'external-id',
        CognitoUserAttributesTierEnum.NEW,
        CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
      )
      expect(bloomreachOutboxService.trackCustomer).toHaveBeenCalledWith('external-id')
      expect(bloomreachOutboxService.trackUnVerification).toHaveBeenCalledWith(
        'external-id',
        BloomreachUnVerificationReasonEnum.IAM_NOT_FOUND
      )
    })

    it('should not touch the database when removing the delivery method from Noris fails', async () => {
      prismaMock.$queryRaw.mockResolvedValue([candidateFactory()])
      norisDeliveryMethodService.removeDeliveryMethodsFromNoris.mockRejectedValue(
        new Error('Noris is down')
      )

      const result = await service.unverifyUsersWithFailingEdeskUpdate({ dryRun: false })

      expect(result.failed).toEqual([{ externalId: 'external-id', error: 'Noris is down' }])
      expect(prismaMock.user.update).not.toHaveBeenCalled()
      expect(userTierService.changeTier).not.toHaveBeenCalled()
    })

    it('should continue with the next user when one fails', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        candidateFactory({ id: 'user-1', externalId: 'a' }),
        candidateFactory({ id: 'user-2', externalId: 'b' }),
      ])
      userTierService.changeTier.mockRejectedValueOnce(new Error('Cognito error'))

      const result = await service.unverifyUsersWithFailingEdeskUpdate({ dryRun: false })

      expect(result.failed).toEqual([{ externalId: 'a', error: 'Cognito error' }])
      expect(result.unverified).toEqual(['b'])
    })

    it('should select by the default fail count', async () => {
      prismaMock.$queryRaw.mockResolvedValue([])

      await service.unverifyUsersWithFailingEdeskUpdate({})

      // Tagged template call: the template strings, then the interpolated values.
      expect(prismaMock.$queryRaw.mock.calls[0]).toContain(7)
    })

    it('should select by the given fail count', async () => {
      prismaMock.$queryRaw.mockResolvedValue([])

      await service.unverifyUsersWithFailingEdeskUpdate({ minFailCount: 3 })

      // Tagged template call: the template strings, then the interpolated values.
      expect(prismaMock.$queryRaw.mock.calls[0]).toContain(3)
    })

    it('should return the last candidate id to continue from when the limit is reached', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        candidateFactory({ id: 'user-1', externalId: 'a' }),
        candidateFactory({ id: 'user-2', externalId: 'b' }),
      ])

      const result = await service.unverifyUsersWithFailingEdeskUpdate({ limit: 2 })

      expect(result.nextAfterUserId).toBe('user-2')
    })
  })
})
