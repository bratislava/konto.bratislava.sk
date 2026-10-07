import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { Test } from '@nestjs/testing'
import {
  FormDefinition,
  isSlovenskoSkFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import prismaMock from '../../../test/singleton'
import { createTestFormDefinitionSlovenskoSkGeneric } from '../../__tests__/factories/formDefinition.factory'
import BaConfigService from '../../config/ba-config.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import { Files, Forms } from '../../generated/prisma/client'
import { MinioStorageService } from '../../minio-storage/minio-storage.service'
import PrismaService from '../../prisma/prisma.service'
import ScannerClientService from '../../scanner-client/scanner-client.service'
import alertReporting from '../../utils/constants/error.alerts'
import { FilesErrorsEnum, FilesErrorsResponseEnum } from '../files.errors.enum'
import FilesHelper from '../files.helper'

vi.mock('forms-shared/definitions/formDefinitionTypes')
vi.mock('forms-shared/definitions/getFormDefinitionBySlug')

describe('FilesHelper', () => {
  let service: FilesHelper
  let logger: LineLoggerService
  const errorFactory = new ErrorFactoryService({ alertReporting })

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        {
          provide: LineLoggerService,
          useValue: createMock<LineLoggerService>(),
        },
        FilesHelper,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: BaConfigService,
          useValue: {
            files: { mimeTypeWhitelist: 'image/jpeg image/png' },
            minio: {
              buckets: {
                safe: 'safe-bucket',
                infected: 'infected-bucket',
                unscanned: 'unscanned-bucket',
              },
            },
          },
        },
        {
          provide: MinioStorageService,
          useValue: createMock<MinioStorageService>(),
        },
        {
          provide: ScannerClientService,
          useValue: createMock<ScannerClientService>(),
        },
        { provide: ErrorFactoryService, useValue: errorFactory },
      ],
    }).compile()

    service = app.get<FilesHelper>(FilesHelper)
    logger = app.get(LineLoggerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('forms2formInfo', () => {
    let mockForm: Forms
    let mockFormDefinition: FormDefinition

    beforeEach(() => {
      mockForm = {
        id: 'test-form-id',
        formDefinitionSlug: 'test-slug',
      } as Forms

      mockFormDefinition = createTestFormDefinitionSlovenskoSkGeneric({
        slug: 'test-slug',
        pospID: 'test-posp-id',
      })

      vi.mocked(getFormDefinitionBySlug).mockReturnValue(mockFormDefinition)
    })

    it('should return FormInfo with pospID for SlovenskoSk form definition', () => {
      vi.mocked(isSlovenskoSkFormDefinition).mockReturnValue(true)

      const result = service.forms2formInfo(mockForm)

      expect(result).toEqual({
        pospIdOrSlug: 'test-posp-id',
        formId: 'test-form-id',
      })
    })

    it('should return FormInfo with slug for non-SlovenskoSk form definition', () => {
      vi.mocked(isSlovenskoSkFormDefinition).mockReturnValue(false)

      const result = service.forms2formInfo(mockForm)

      expect(result).toEqual({
        pospIdOrSlug: 'test-slug',
        formId: 'test-form-id',
      })
    })

    it('should throw NotFoundException when form definition is not found', () => {
      vi.mocked(getFormDefinitionBySlug).mockReturnValue(null)

      expect(() => service.forms2formInfo(mockForm)).toThrow(
        errorFactory.NotFoundException({
          errorEnum: FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
          message: `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${mockForm.formDefinitionSlug}`,
        }),
      )
    })
  })

  describe('areErrorFilesInForm', () => {
    it('should return true when there are error files', async () => {
      const mockErrorFiles: Files[] = [
        {
          id: 'file-1',
        } as Files,
      ]

      const formId = 'test-form-id'
      prismaMock.files.findMany.mockResolvedValue(mockErrorFiles)

      const result = await service.areErrorFilesInForm(formId)

      expect(result).toBe(true)
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        errorFactory.InternalServerErrorException({
          errorEnum: FilesErrorsEnum.FILE_SCANNING_SERVICE_ERROR,
          message: FilesErrorsResponseEnum.FILE_SCANNING_SERVICE_ERROR,
          console: { formId, errorFiles: mockErrorFiles },
        }),
      )
    })

    it('should return true when there are multiple error files', async () => {
      const mockErrorFiles: Files[] = [
        {
          id: 'file-1',
        } as Files,
        {
          id: 'file-2',
        } as Files,
      ]

      prismaMock.files.findMany.mockResolvedValue(mockErrorFiles)

      const result = await service.areErrorFilesInForm('test-form-id')

      expect(result).toBe(true)
    })

    it('should return false when there are no error files', async () => {
      prismaMock.files.findMany.mockResolvedValue([])

      const result = await service.areErrorFilesInForm('test-form-id')

      expect(result).toBe(false)
      expect(vi.mocked(logger.error)).not.toHaveBeenCalled()
    })
  })
})
