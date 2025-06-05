import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { UserType } from '../../auth-v2/types/user'
import PrismaService from '../../prisma/prisma.service'
import { FormAccessService } from './form-access.service'
import { FormMigrationsService } from './form-migrations.service'

describe('FormAccessService', () => {
  let service: FormAccessService
  let prismaService: jest.Mocked<PrismaService>
  let formMigrationsService: jest.Mocked<FormMigrationsService>

  const mockAuthUser = {
    type: UserType.Auth as const,
    cognitoJwtPayload: { sub: 'auth-user-123' },
    cognitoUser: {},
    cityAccountUser: {},
  }

  const mockGuestUser = {
    type: UserType.Guest as const,
    cognitoIdentityId: 'guest-identity-456',
  }

  beforeEach(async () => {
    const mockPrismaService = {
      forms: {
        findUnique: jest.fn(),
      },
    }

    const mockFormMigrationsService = {
      hasValidMigration: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormAccessService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: FormMigrationsService, useValue: mockFormMigrationsService },
      ],
    }).compile()

    service = module.get<FormAccessService>(FormAccessService)
    prismaService = module.get(PrismaService)
    formMigrationsService = module.get(FormMigrationsService)
  })

  describe('hasAccess', () => {
    it('should throw NotFoundException when form does not exist', async () => {
      prismaService.forms.findUnique.mockResolvedValue(null)

      await expect(
        service.hasAccess('non-existent-form', mockAuthUser),
      ).rejects.toThrow(NotFoundException)
    })

    it('should return true for authenticated user with direct access', async () => {
      const mockForm = {
        id: 'form-123',
        userExternalId: 'auth-user-123',
        cognitoGuestIdentityId: null,
      }
      prismaService.forms.findUnique.mockResolvedValue(mockForm)

      const hasAccess = await service.hasAccess('form-123', mockAuthUser)
      expect(hasAccess).toBe(true)
    })

    it('should return true for guest user with direct access', async () => {
      const mockForm = {
        id: 'form-123',
        userExternalId: null,
        cognitoGuestIdentityId: 'guest-identity-456',
      }
      prismaService.forms.findUnique.mockResolvedValue(mockForm)

      const hasAccess = await service.hasAccess('form-123', mockGuestUser)
      expect(hasAccess).toBe(true)
    })

    it('should return false for authenticated user without direct access and migrations disabled', async () => {
      const mockForm = {
        id: 'form-123',
        userExternalId: 'different-user',
        cognitoGuestIdentityId: null,
      }
      prismaService.forms.findUnique.mockResolvedValue(mockForm)

      const hasAccess = await service.hasAccess('form-123', mockAuthUser)
      expect(hasAccess).toBe(false)
    })

    it('should check migrations when checkMigrations is true', async () => {
      const mockForm = {
        id: 'form-123',
        userExternalId: null,
        cognitoGuestIdentityId: 'guest-identity-789',
      }
      prismaService.forms.findUnique.mockResolvedValue(mockForm)
      formMigrationsService.hasValidMigration.mockResolvedValue(true)

      const hasAccess = await service.hasAccess('form-123', mockAuthUser, {
        checkMigrations: true,
      })

      expect(hasAccess).toBe(true)
      expect(formMigrationsService.hasValidMigration).toHaveBeenCalledWith(
        'auth-user-123',
        'guest-identity-789',
      )
    })

    it('should not check migrations for guest users even when checkMigrations is true', async () => {
      const mockForm = {
        id: 'form-123',
        userExternalId: 'different-user',
        cognitoGuestIdentityId: null,
      }
      prismaService.forms.findUnique.mockResolvedValue(mockForm)

      const hasAccess = await service.hasAccess('form-123', mockGuestUser, {
        checkMigrations: true,
      })

      expect(hasAccess).toBe(false)
      expect(formMigrationsService.hasValidMigration).not.toHaveBeenCalled()
    })
  })

  describe('requireAccess', () => {
    it('should not throw when user has access', async () => {
      const mockForm = {
        id: 'form-123',
        userExternalId: 'auth-user-123',
        cognitoGuestIdentityId: null,
      }
      prismaService.forms.findUnique.mockResolvedValue(mockForm)

      await expect(
        service.requireAccess('form-123', mockAuthUser),
      ).resolves.not.toThrow()
    })

    it('should throw NotFoundException when user does not have access', async () => {
      const mockForm = {
        id: 'form-123',
        userExternalId: 'different-user',
        cognitoGuestIdentityId: null,
      }
      prismaService.forms.findUnique.mockResolvedValue(mockForm)

      await expect(
        service.requireAccess('form-123', mockAuthUser),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
