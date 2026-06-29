import { createMock } from '@golevelup/ts-jest'
import { Test } from '@nestjs/testing'
import { Files } from '@prisma/client'

import prismaMock from '../../../test/singleton'
import BaConfigService from '../../config/ba-config.service'
import FormsService from '../../forms/forms.service'
import { FormAccessService } from '../../forms-v2/services/form-access.service'
import { MinioStorageService } from '../../minio-storage/minio-storage.service'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import FilesHelper from '../files.helper'
import FilesService from '../files.service'

jest.mock('../../forms/forms.service')

describe('FilesService', () => {
  let service: FilesService

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: BaConfigService,
          useValue: { tokens: { jwtSecret: 'test-secret' } },
        },
        {
          provide: MinioStorageService,
          useValue: createMock<MinioStorageService>(),
        },
        { provide: FormsService, useValue: createMock<FormsService>() },
        { provide: FilesHelper, useValue: createMock<FilesHelper>() },
        {
          provide: FormAccessService,
          useValue: createMock<FormAccessService>(),
        },
        ThrowerErrorGuard,
      ],
    }).compile()

    service = app.get<FilesService>(FilesService)
    Object.defineProperty(service, 'logger', {
      value: { error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
    })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('areFormAttachmentsReady', () => {
    // TODO test also other values, not only filesReady
    it('should be false if there are files in processing state', async () => {
      prismaMock.files.findMany.mockResolvedValue([
        { id: '1' } as Files,
        { id: '2' } as Files,
      ])

      const result = await service.areFormAttachmentsReady('1')

      expect(result.filesReady).toBeFalsy()
    })

    it('should be false if there are virus files', async () => {
      prismaMock.files.findMany.mockResolvedValue([])
      service['filesHelper'].checkInfectedFiles = jest
        .fn()
        .mockResolvedValue(true)

      const result = await service.areFormAttachmentsReady('1')
      expect(result.filesReady).toBeFalsy()
    })

    it('should be false if there are error files', async () => {
      prismaMock.files.findMany.mockResolvedValue([])
      service['filesHelper'].checkInfectedFiles = jest
        .fn()
        .mockResolvedValue(false)
      service['filesHelper'].areErrorFilesInForm = jest
        .fn()
        .mockResolvedValue(true)

      const result = await service.areFormAttachmentsReady('1')
      expect(result.filesReady).toBeFalsy()
    })

    it('should return true otherwise', async () => {
      prismaMock.files.findMany.mockResolvedValue([])
      service['filesHelper'].checkInfectedFiles = jest
        .fn()
        .mockResolvedValue(false)
      service['filesHelper'].areErrorFilesInForm = jest
        .fn()
        .mockResolvedValue(false)

      const result = await service.areFormAttachmentsReady('1')
      expect(result.filesReady).toBeTruthy()
    })
  })
})
