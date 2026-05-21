import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import {
  ConsentEnum,
  DeliveryMethodUserPreferenceEnum,
  GDPRCategoryEnum,
  GDPRSubTypeEnum,
  GDPRTypeEnum,
} from '@prisma/client'

import prismaMock from '../../../../../test/singleton'
import { BloomreachOutboxService } from '../../../../bloomreach/bloomreach-outbox.service'
import { PrismaService } from '../../../../prisma/prisma.service'
import ThrowerErrorGuard from '../../../../utils/guards/errors.guard'
import { UserIdentitySubservice } from '../../../../utils/subservices/user-identity.subservice'
import { UserDataSubservice } from '../user-data.subservice'

describe('UserDataSubservice', () => {
  let service: UserDataSubservice
  let bloomreach: jest.Mocked<BloomreachOutboxService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDataSubservice,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: BloomreachOutboxService,
          useValue: createMock<BloomreachOutboxService>(),
        },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
        {
          provide: UserIdentitySubservice,
          useValue: createMock<UserIdentitySubservice>(),
        },
      ],
    }).compile()

    service = module.get<UserDataSubservice>(UserDataSubservice)
    bloomreach = module.get(BloomreachOutboxService)

    // Make $transaction execute its callback with the prisma mock so the upsert
    // calls below are routed through the same mocked client we assert against.
    ;(prismaMock.$transaction as jest.Mock).mockImplementation(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: typeof prismaMock) => unknown)(prismaMock)
      }
      return Promise.all(fn as Promise<unknown>[])
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('setUserConsents', () => {
    it('should be a no-op when consents array is empty', async () => {
      await service.setUserConsents('user-id', 'external-id', [])

      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.userConsents.upsert).not.toHaveBeenCalled()
      expect(bloomreach.trackEventConsents).not.toHaveBeenCalled()
    })

    it('should upsert each consent and forward them to Bloomreach', async () => {
      const consents = [
        { consentType: ConsentEnum.MARKETING, isGranted: true },
        { consentType: ConsentEnum.GENERAL, isGranted: false },
      ]

      await service.setUserConsents('user-id', 'external-id', consents)

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
      expect(prismaMock.userConsents.upsert).toHaveBeenCalledTimes(2)
      expect(prismaMock.userConsents.upsert).toHaveBeenCalledWith({
        where: {
          userId_consentType: { userId: 'user-id', consentType: ConsentEnum.MARKETING },
        },
        update: { isGranted: true },
        create: { userId: 'user-id', consentType: ConsentEnum.MARKETING, isGranted: true },
      })
      expect(prismaMock.userConsents.upsert).toHaveBeenCalledWith({
        where: {
          userId_consentType: { userId: 'user-id', consentType: ConsentEnum.GENERAL },
        },
        update: { isGranted: false },
        create: { userId: 'user-id', consentType: ConsentEnum.GENERAL, isGranted: false },
      })

      expect(bloomreach.trackEventConsents).toHaveBeenCalledWith(
        [
          {
            category: GDPRCategoryEnum.ESBS,
            type: GDPRTypeEnum.MARKETING,
            subType: GDPRSubTypeEnum.subscribe,
          },
          {
            category: GDPRCategoryEnum.ESBS,
            type: GDPRTypeEnum.GENERAL,
            subType: GDPRSubTypeEnum.unsubscribe,
          },
        ],
        'external-id',
        'user-id',
        false
      )
    })

    it('should not call Bloomreach if the transaction throws', async () => {
      ;(prismaMock.$transaction as jest.Mock).mockRejectedValueOnce(new Error('db down'))

      await expect(
        service.setUserConsents('user-id', 'external-id', [
          { consentType: ConsentEnum.MARKETING, isGranted: true },
        ])
      ).rejects.toThrow('db down')

      expect(bloomreach.trackEventConsents).not.toHaveBeenCalled()
    })
  })

  describe('setLegalPersonConsents', () => {
    it('should be a no-op when consents array is empty', async () => {
      await service.setLegalPersonConsents('legal-person-id', 'external-id', [])

      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.legalPersonConsents.upsert).not.toHaveBeenCalled()
      expect(bloomreach.trackEventConsents).not.toHaveBeenCalled()
    })

    it('should upsert each consent and forward them to Bloomreach as legal person', async () => {
      const consents = [
        { consentType: ConsentEnum.MARKETING, isGranted: false },
        { consentType: ConsentEnum.GENERAL, isGranted: true },
      ]

      await service.setLegalPersonConsents('legal-person-id', 'external-id', consents)

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
      expect(prismaMock.legalPersonConsents.upsert).toHaveBeenCalledTimes(2)
      expect(prismaMock.legalPersonConsents.upsert).toHaveBeenCalledWith({
        where: {
          legalPersonId_consentType: {
            legalPersonId: 'legal-person-id',
            consentType: ConsentEnum.MARKETING,
          },
        },
        update: { isGranted: false },
        create: {
          legalPersonId: 'legal-person-id',
          consentType: ConsentEnum.MARKETING,
          isGranted: false,
        },
      })
      expect(prismaMock.legalPersonConsents.upsert).toHaveBeenCalledWith({
        where: {
          legalPersonId_consentType: {
            legalPersonId: 'legal-person-id',
            consentType: ConsentEnum.GENERAL,
          },
        },
        update: { isGranted: true },
        create: {
          legalPersonId: 'legal-person-id',
          consentType: ConsentEnum.GENERAL,
          isGranted: true,
        },
      })

      expect(bloomreach.trackEventConsents).toHaveBeenCalledWith(
        [
          {
            category: GDPRCategoryEnum.ESBS,
            type: GDPRTypeEnum.MARKETING,
            subType: GDPRSubTypeEnum.unsubscribe,
          },
          {
            category: GDPRCategoryEnum.ESBS,
            type: GDPRTypeEnum.GENERAL,
            subType: GDPRSubTypeEnum.subscribe,
          },
        ],
        'external-id',
        'legal-person-id',
        true
      )
    })

    it('should not call Bloomreach if the transaction throws', async () => {
      ;(prismaMock.$transaction as jest.Mock).mockRejectedValueOnce(new Error('db down'))

      await expect(
        service.setLegalPersonConsents('legal-person-id', 'external-id', [
          { consentType: ConsentEnum.MARKETING, isGranted: true },
        ])
      ).rejects.toThrow('db down')

      expect(bloomreach.trackEventConsents).not.toHaveBeenCalled()
    })
  })

  describe('setDeliveryMethodPreference', () => {
    it.each([
      [DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT, GDPRSubTypeEnum.subscribe],
      [DeliveryMethodUserPreferenceEnum.POSTAL, GDPRSubTypeEnum.unsubscribe],
    ])(
      'should update the user and emit a tax-delivery event for %s as %s',
      async (deliveryMethod, expectedSubType) => {
        await service.setDeliveryMethodPreference('cognito-sub-id', deliveryMethod)

        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { externalId: 'cognito-sub-id' },
          data: { taxDeliveryMethod: deliveryMethod },
        })
        expect(bloomreach.trackEventConsents).toHaveBeenCalledWith(
          [
            {
              category: GDPRCategoryEnum.TAXES,
              type: GDPRTypeEnum.FORMAL_COMMUNICATION,
              subType: expectedSubType,
            },
          ],
          'cognito-sub-id',
          undefined,
          false
        )
      }
    )

    it('should not call Bloomreach if the prisma update throws', async () => {
      ;(prismaMock.user.update as jest.Mock).mockRejectedValueOnce(new Error('db down'))

      await expect(
        service.setDeliveryMethodPreference(
          'cognito-sub-id',
          DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT
        )
      ).rejects.toThrow('db down')

      expect(bloomreach.trackEventConsents).not.toHaveBeenCalled()
    })
  })
})
