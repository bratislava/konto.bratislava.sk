import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../../prisma/prisma.service'
import prismaMock from '../../../../test/singleton'
import { CleanupTasksSubservice } from '../cleanup-tasks.subservice'
import { OAuth2Data } from '@prisma/client'

describe('CleanupTasksSubservice', () => {
  let service: CleanupTasksSubservice

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CleanupTasksSubservice, { provide: PrismaService, useValue: prismaMock }],
    }).compile()

    service = module.get<CleanupTasksSubservice>(CleanupTasksSubservice)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('deleteOldUserVerificationData', () => {
    it('should delete UserIdCardVerify and LegalPersonIcoIdCardVerify records older than 1 month', async () => {
      const userIdCardVerifyDeleteSpy = jest.spyOn(prismaMock.userIdCardVerify, 'deleteMany')
      const legalPersonIcoIdCardVerifyDeleteSpy = jest.spyOn(
        prismaMock.legalPersonIcoIdCardVerify,
        'deleteMany'
      )

      const today = new Date()
      const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1))

      await service.deleteOldUserVerificationData()

      expect(userIdCardVerifyDeleteSpy).toHaveBeenCalledWith({
        where: {
          verifyStart: {
            lt: oneMonthAgo,
          },
        },
      })

      expect(legalPersonIcoIdCardVerifyDeleteSpy).toHaveBeenCalledWith({
        where: {
          verifyStart: {
            lt: oneMonthAgo,
          },
        },
      })
    })
  })

  describe('cleanupExpiredAuthorizationCodes', () => {
    it('should cleanup expired authorization codes older than 5 minutes', async () => {
      const mockExpiredRecords: Pick<OAuth2Data, 'id' | 'authorizationCode'>[] = [
        { id: '1', authorizationCode: 'code1' },
        { id: '2', authorizationCode: 'code2' },
      ]

      prismaMock.oAuth2Data.findMany.mockResolvedValue(
        mockExpiredRecords as OAuth2Data[]
      )
      const updateManySpy = jest.spyOn(prismaMock.oAuth2Data, 'updateMany')

      await service.cleanupExpiredAuthorizationCodes()

      expect(prismaMock.oAuth2Data.findMany).toHaveBeenCalledWith({
        where: {
          authorizationCodeCreatedAt: {
            not: null,
            lt: expect.any(Date),
          },
          refreshTokenEnc: {
            not: null,
          },
        },
        select: {
          id: true,
          authorizationCode: true,
        },
      })

      expect(updateManySpy).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['1', '2'],
          },
        },
        data: {
          accessTokenEnc: null,
          idTokenEnc: null,
          refreshTokenEnc: null,
        },
      })
    })

    it('should not update anything if there are no expired records', async () => {
      prismaMock.oAuth2Data.findMany.mockResolvedValue([])
      const updateManySpy = jest.spyOn(prismaMock.oAuth2Data, 'updateMany')

      await service.cleanupExpiredAuthorizationCodes()

      expect(updateManySpy).not.toHaveBeenCalled()
    })
  })

  describe('deleteOldOAuth2Data', () => {
    it('should delete OAuth2 records older than 1 month', async () => {
      const mockOldRecords: Pick<OAuth2Data, 'id' | 'authorizationCode'>[] = [
        { id: '1', authorizationCode: 'code1' },
        { id: '2', authorizationCode: 'code2' },
      ]

      prismaMock.oAuth2Data.findMany.mockResolvedValue(mockOldRecords as OAuth2Data[])
      const deleteManySpy = jest.spyOn(prismaMock.oAuth2Data, 'deleteMany')

      await service.deleteOldOAuth2Data()

      expect(prismaMock.oAuth2Data.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              authorizationCodeCreatedAt: {
                not: null,
                lt: expect.any(Date),
              },
            },
            {
              authorizationCodeCreatedAt: null,
              createdAt: {
                lt: expect.any(Date),
              },
            },
          ],
        },
        select: {
          id: true,
          authorizationCode: true,
        },
      })

      expect(deleteManySpy).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['1', '2'],
          },
        },
      })
    })

    it('should not delete anything if there are no old records', async () => {
      prismaMock.oAuth2Data.findMany.mockResolvedValue([])
      const deleteManySpy = jest.spyOn(prismaMock.oAuth2Data, 'deleteMany')

      await service.deleteOldOAuth2Data()

      expect(deleteManySpy).not.toHaveBeenCalled()
    })
  })
})
