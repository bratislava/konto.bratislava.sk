import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { Forms, FormState } from '@prisma/client'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { omitExtraData } from 'forms-shared/form-utils/omitExtraData'

import {
  AuthFixtureUser,
  UserFixtureFactory,
} from '../../test/fixtures/auth/user-fixture-factory'
import prismaMock from '../../test/singleton'
import FilesHelper from '../files/files.helper'
import FilesService from '../files/files.service'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import { FormAccessService } from '../forms-v2/services/form-access.service'
import { GetFormsRequestDto } from '../nases/dtos/requests.dto'
import NasesConsumerHelper from '../nases-consumer/nases-consumer.helper'
import PrismaService from '../prisma/prisma.service'
import ScannerClientService from '../scanner-client/scanner-client.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import FormsHelper from './forms.helper'
import FormsService from './forms.service'

jest.mock('forms-shared/definitions/getFormDefinitionBySlug', () => ({
  getFormDefinitionBySlug: jest.fn(),
}))
jest.mock('@nestjs/config')
jest.mock('./forms.helper')
jest.mock('../files/files.helper')
jest.mock('../files/files.service')
jest.mock('../utils/subservices/minio-client.subservice')
jest.mock('../nases-consumer/nases-consumer.helper')
jest.mock('../scanner-client/scanner-client.service')
jest.mock('forms-shared/form-utils/omitExtraData', () => ({
  omitExtraData: jest.fn(),
}))
jest.mock('../form-validator-registry/form-validator-registry.service')

describe('FormsService', () => {
  let service: FormsService
  let userFixtureFactory: UserFixtureFactory
  let authUser: AuthFixtureUser

  beforeAll(() => {
    userFixtureFactory = new UserFixtureFactory()
    authUser = userFixtureFactory.createFoAuthUser()
  })

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [],
      providers: [
        FormsService,
        FilesService,
        FilesHelper,
        MinioClientSubservice,
        NasesConsumerHelper,
        ScannerClientService,
        ThrowerErrorGuard,
        FormsHelper,
        ConfigService,
        FormValidatorRegistryService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: FormAccessService,
          useValue: createMock<FormAccessService>(),
        },
      ],
    }).compile()

    service = app.get<FormsService>(FormsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getForms', () => {
    it('should count correctly', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        schema: {
          baUiSchema: {},
        },
      })
      const spy = jest
        .spyOn(prismaMock.forms, 'findMany')
        .mockResolvedValue([{ id: '1' }, { id: '2' }] as Forms[])
      prismaMock.forms.count.mockResolvedValue(63)
      prismaMock.forms.groupBy.mockResolvedValue([])
      Object.defineProperty(prismaMock.forms, 'fields', {
        value: { createdAt: 'createdAtMock' },
      })

      const query: GetFormsRequestDto = {
        currentPage: '2',
        pagination: '20',
        states: [FormState.DRAFT, FormState.PROCESSING],
      }
      const result = await service.getForms(query, authUser.user)

      expect(spy).toHaveBeenCalledWith({
        select: {
          id: true,
          updatedAt: true,
          createdAt: true,
          state: true,
          error: true,
          formDataJson: true,
          formDefinitionSlug: true,
        },
        where: {
          archived: false,
          userExternalId: authUser.sub,
          formDataJson: {
            not: {
              equals: null,
            },
          },
          updatedAt: {
            not: {
              equals: 'createdAtMock',
            },
          },
          state: { in: [FormState.DRAFT, FormState.PROCESSING] },
        },
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
        take: 20,
        skip: 20,
      })

      const countByState = {} as Record<FormState, number>
      Object.values(FormState).forEach((state) => {
        countByState[state] = 0
      })

      expect(result).toEqual({
        countPages: 4,
        items: [
          {
            id: '1',
          },
          {
            id: '2',
          },
        ] as unknown as Forms[],
        currentPage: 2,
        pagination: 20,
        meta: {
          countByState,
        },
      })
    })
  })

  describe('checkFormBeforeSending', () => {
    it('should throw error if form is not found', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(null)
      await expect(service.checkFormBeforeSending('1')).rejects.toThrow()
    })

    it('should throw error if form is not in DRAFT state', async () => {
      prismaMock.forms.findUnique.mockResolvedValue({
        state: FormState.QUEUED,
      } as Forms)
      await expect(service.checkFormBeforeSending('1')).rejects.toThrow()
    })

    it('should return the form if everyting is ok', async () => {
      const insertForm = { state: FormState.DRAFT, id: '123' } as Forms
      prismaMock.forms.findUnique.mockResolvedValue(insertForm)
      FormsHelper.isEditable = jest.fn().mockReturnValue(true)

      const result = await service.checkFormBeforeSending('123')
      expect(result).toEqual(insertForm)
    })
  })

  describe('getFormsCount', () => {
    it('should return all 0 if there is no record in database', async () => {
      prismaMock.forms.groupBy.mockResolvedValue([])
      const result = await service.getFormsCount({})
      Object.values(FormState).forEach((state) => {
        expect(result[state]).toBe(0)
      })
    })

    it('should return correct count otherwise', async () => {
      prismaMock.forms.groupBy.mockResolvedValue([
        {
          _count: {
            _all: 10,
          },
          state: FormState.DRAFT,
        },
      ] as any)
      const result = await service.getFormsCount({})
      Object.values(FormState).forEach((state) => {
        if (state === FormState.DRAFT) {
          expect(result[state]).toBe(10)
        } else {
          expect(result[state]).toBe(0)
        }
      })
    })
  })

  describe('bumpJsonVersion', () => {
    it('should throw error if form not found', async () => {
      const formId = '123e4567-e89b-12d3-a456-426614174000'
      jest.spyOn(service, 'getUniqueForm').mockResolvedValue(null)

      await expect(service.bumpJsonVersion(formId)).rejects.toThrow()
    })

    it('should throw error if form is not editable', async () => {
      const formId = '123e4567-e89b-12d3-a456-426614174000'
      const form = {
        id: formId,
        state: FormState.PROCESSING,
      } as Forms
      jest.spyOn(service, 'getUniqueForm').mockResolvedValue(form)
      FormsHelper.isEditable = jest.fn().mockReturnValue(false)

      await expect(service.bumpJsonVersion(formId)).rejects.toThrow()
    })

    it('should throw error if form definition is not found', async () => {
      const formId = '123e4567-e89b-12d3-a456-426614174000'
      const form = {
        id: formId,
        state: FormState.DRAFT,
        formDefinitionSlug: 'non-existent',
      } as Forms
      jest.spyOn(service, 'getUniqueForm').mockResolvedValue(form)
      FormsHelper.isEditable = jest.fn().mockReturnValue(true)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(null)

      await expect(service.bumpJsonVersion(formId)).rejects.toThrow()
    })

    it('should throw error if version bump is not possible', async () => {
      const formId = '123e4567-e89b-12d3-a456-426614174001'
      const form = {
        id: formId,
        state: FormState.DRAFT,
        formDefinitionSlug: 'test-form',
        jsonVersion: '1.0.0',
      } as Forms
      jest.spyOn(service, 'getUniqueForm').mockResolvedValue(form)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        jsonVersion: '2.0.0',
        schema: { type: 'object' },
      })

      await expect(service.bumpJsonVersion(formId)).rejects.toThrow()
    })

    it('should update form version and data when bump is possible', async () => {
      const formId = '123e4567-e89b-12d3-a456-426614174002'
      const formDataJson = { existingData: true, dataToRemove: true }
      const form = {
        id: formId,
        state: FormState.DRAFT,
        formDefinitionSlug: 'test-form',
        jsonVersion: '1.0.0',
        formDataJson,
      } as Partial<Forms> as Forms

      jest.spyOn(service, 'getUniqueForm').mockResolvedValue(form)

      const mockRegistry = {}
      ;(
        FormValidatorRegistryService.prototype.getRegistry as jest.Mock
      ).mockReturnValue(mockRegistry)

      const omittedData = { existingData: true }
      ;(omitExtraData as jest.Mock).mockReturnValue(omittedData)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        jsonVersion: '1.1.0',
        schema: { type: 'object' },
      })

      const updateSpy = jest.spyOn(prismaMock.forms, 'update')
      await service.bumpJsonVersion(formId)

      expect(omitExtraData).toHaveBeenCalledWith(
        { type: 'object' },
        formDataJson,
        mockRegistry,
      )

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: form.id },
        data: {
          jsonVersion: '1.1.0',
          formDataJson: omittedData,
        },
      })
    })
  })
})
