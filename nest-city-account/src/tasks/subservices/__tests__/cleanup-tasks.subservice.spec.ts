import { LineLoggerService } from '@bratislava/log-nest'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../../test/singleton'
import { expectAny } from '../../../__tests__/matchers'
import { OAuth2Data } from '../../../generated/prisma/client'
import { PrismaService } from '../../../prisma/prisma.service'
import { CleanupTasksSubservice } from '../cleanup-tasks.subservice'

describe('CleanupTasksSubservice', () => {
  let service: CleanupTasksSubservice

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineLoggerService,
        CleanupTasksSubservice,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<CleanupTasksSubservice>(CleanupTasksSubservice)
  })

  describe('deleteOldUserVerificationData', () => {
    it('should delete UserIdCardVerify and LegalPersonIcoIdCardVerify records older than 1 month', async () => {
      const userIdCardVerifyDeleteSpy = vi
        .mocked(prismaMock.userIdCardVerify.deleteMany)
        .mockResolvedValue({ count: 0 })
      const legalPersonIcoIdCardVerifyDeleteSpy = vi
        .mocked(prismaMock.legalPersonIcoIdCardVerify.deleteMany)
        .mockResolvedValue({ count: 0 })

      const mockDate = new Date('2024-01-15T00:00:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(mockDate)

      const oneMonthAgo = new Date(mockDate)
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

      await service.deleteOldUserVerificationData()

      vi.useRealTimers()

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
      const codeCreatedAt = new Date('2024-01-14T23:50:00.000Z')
      const mockExpiredRecords: Pick<
        OAuth2Data,
        'id' | 'authorizationCode' | 'authorizationCodeCreatedAt'
      >[] = [
        { id: '1', authorizationCode: 'code1', authorizationCodeCreatedAt: codeCreatedAt },
        { id: '2', authorizationCode: 'code2', authorizationCodeCreatedAt: codeCreatedAt },
      ]

      prismaMock.oAuth2Data.findMany.mockResolvedValue(mockExpiredRecords as OAuth2Data[])
      const updateManySpy = vi.mocked(prismaMock.oAuth2Data.updateMany)
      const warnSpy = vi.spyOn(LineLoggerService.prototype, 'warn')

      const mockDate = new Date('2024-01-15T00:00:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(mockDate)

      await service.cleanupExpiredAuthorizationCodes()

      vi.useRealTimers()

      expect(prismaMock.oAuth2Data.findMany).toHaveBeenCalledWith({
        where: {
          authorizationCodeCreatedAt: {
            not: null,
            lt: expectAny<Date>(Date),
          },
          refreshTokenEnc: {
            not: null,
          },
        },
        select: {
          id: true,
          authorizationCode: true,
          authorizationCodeCreatedAt: true,
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

      // codes are logged only after the update went through
      expect(warnSpy).toHaveBeenCalledWith('Cleaned up expired oAuth2 tokens with id: 1', {
        authorizationCode: 'code1',
        authorizationCodeCreatedAt: codeCreatedAt,
      })
      expect(updateManySpy.mock.invocationCallOrder[0]).toBeLessThan(
        warnSpy.mock.invocationCallOrder[0]
      )
    })

    it('should not update anything if there are no expired records', async () => {
      prismaMock.oAuth2Data.findMany.mockResolvedValue([])
      const updateManySpy = vi.mocked(prismaMock.oAuth2Data.updateMany)

      await service.cleanupExpiredAuthorizationCodes()

      expect(updateManySpy).not.toHaveBeenCalled()
    })
  })

  describe('deleteOldOAuth2Data', () => {
    it('should delete OAuth2 records older than 1 month', async () => {
      const mockOldRecords: Pick<OAuth2Data, 'id' | 'authorizationCode'>[] = [
        { id: '1', authorizationCode: 'code1' },
        { id: '2', authorizationCode: null },
      ]

      prismaMock.oAuth2Data.findMany.mockResolvedValue(mockOldRecords as OAuth2Data[])
      const deleteManySpy = vi.mocked(prismaMock.oAuth2Data.deleteMany)
      const logSpy = vi.spyOn(LineLoggerService.prototype, 'log')

      const mockDate = new Date('2024-01-15T00:00:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(mockDate)

      await service.deleteOldOAuth2Data()

      vi.useRealTimers()

      expect(prismaMock.oAuth2Data.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              authorizationCodeCreatedAt: {
                not: null,
                lt: expectAny<Date>(Date),
              },
            },
            {
              authorizationCodeCreatedAt: null,
              createdAt: {
                lt: expectAny<Date>(Date),
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

      // codes are logged only after the delete went through
      expect(logSpy).toHaveBeenCalledWith('Deleted 2 old oAuth2 records: 1/code1, 2/null', {
        cutoff: expectAny<Date>(Date),
        recordCount: 2,
      })
      expect(deleteManySpy.mock.invocationCallOrder[0]).toBeLessThan(
        logSpy.mock.invocationCallOrder[0]
      )
    })

    it('should not delete anything if there are no old records', async () => {
      prismaMock.oAuth2Data.findMany.mockResolvedValue([])
      const deleteManySpy = vi.mocked(prismaMock.oAuth2Data.deleteMany)

      await service.deleteOldOAuth2Data()

      expect(deleteManySpy).not.toHaveBeenCalled()
    })
  })
})
