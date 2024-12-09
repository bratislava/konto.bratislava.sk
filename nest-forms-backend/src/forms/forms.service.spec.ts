import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { Forms, FormState } from '@prisma/client'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import prismaMock from '../../test/singleton'
import FilesHelper from '../files/files.helper'
import FilesService from '../files/files.service'
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

describe('FormsService', () => {
  let service: FormsService

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
        { provide: PrismaService, useValue: prismaMock },
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
        schemas: {
          schema: {
            baUiSchema: {},
          },
        },
      })
      const spy = jest
        .spyOn(prismaMock.forms, 'findMany')
        .mockResolvedValue([{ id: '1' }, { id: '2' }] as Forms[])
      prismaMock.forms.count.mockResolvedValue(63)
      prismaMock.forms.groupBy = jest.fn().mockResolvedValue([])
      Object.defineProperty(prismaMock.forms, 'fields', {
        value: { createdAt: 'createdAtMock' },
      })

      const query: GetFormsRequestDto = {
        currentPage: '2',
        pagination: '20',
        states: [FormState.DRAFT, FormState.PROCESSING],
      }
      const userExternalId = 'userId'

      const result = await service.getForms(query, userExternalId, null)

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
          userExternalId: 'userId',
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
      prismaMock.forms.groupBy = jest.fn().mockResolvedValue([])
      const result = await service.getFormsCount({})
      Object.values(FormState).forEach((state) => {
        expect(result[state]).toBe(0)
      })
    })

    it('should return correct count otherwise', async () => {
      prismaMock.forms.groupBy = jest.fn().mockResolvedValue([
        {
          _count: {
            _all: 10,
          },
          state: 'DRAFT',
        },
      ])
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
})
