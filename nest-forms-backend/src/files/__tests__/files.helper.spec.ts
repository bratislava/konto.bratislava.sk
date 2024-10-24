import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { Forms } from '@prisma/client'
import { isSlovenskoSkFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import prismaMock from '../../../test/singleton'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import ScannerClientService from '../../scanner-client/scanner-client.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../../utils/subservices/minio-client.subservice'
import FilesHelper from '../files.helper'

jest.mock('forms-shared/definitions/formDefinitionTypes')
jest.mock('forms-shared/definitions/getFormDefinitionBySlug')

describe('FilesHelper', () => {
  let service: FilesHelper

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        FilesHelper,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: MinioClientSubservice,
          useValue: createMock<MinioClientSubservice>(),
        },
        {
          provide: ScannerClientService,
          useValue: createMock<ScannerClientService>(),
        },
        {
          provide: ThrowerErrorGuard,
          useValue: createMock<ThrowerErrorGuard>(),
        },
      ],
    }).compile()

    service = app.get<FilesHelper>(FilesHelper)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('forms2formInfo', () => {
    let mockForm: Forms
    let mockFormDefinition: any

    beforeEach(() => {
      mockForm = {
        id: 'test-form-id',
        formDefinitionSlug: 'test-slug',
      } as Forms

      mockFormDefinition = {
        slug: 'test-slug',
        pospID: 'test-posp-id',
      }

      // Mock the getFormDefinitionBySlug function
      ;(getFormDefinitionBySlug as unknown as jest.Mock) = jest
        .fn()
        .mockReturnValue(mockFormDefinition)

      // Mock the isSlovenskoSkFormDefinition function
      ;(isSlovenskoSkFormDefinition as unknown as jest.Mock) = jest.fn()
    })

    it('should return FormInfo with pospID for SlovenskoSk form definition', () => {
      ;(isSlovenskoSkFormDefinition as unknown as jest.Mock).mockReturnValue(
        true,
      )

      const result = service.forms2formInfo(mockForm)

      expect(result).toEqual({
        pospIdOrSlug: 'test-posp-id',
        formId: 'test-form-id',
      })
    })

    it('should return FormInfo with slug for non-SlovenskoSk form definition', () => {
      ;(isSlovenskoSkFormDefinition as unknown as jest.Mock).mockReturnValue(
        false,
      )

      const result = service.forms2formInfo(mockForm)

      expect(result).toEqual({
        pospIdOrSlug: 'test-slug',
        formId: 'test-form-id',
      })
    })

    it('should throw NotFoundException when form definition is not found', () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(null)

      const mockThrowException = jest.fn()
      service['throwerErrorGuard'].NotFoundException = mockThrowException

      expect(() => service.forms2formInfo(mockForm)).toThrow()
      expect(mockThrowException).toHaveBeenCalledWith(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} test-slug`,
      )
    })
  })
})
