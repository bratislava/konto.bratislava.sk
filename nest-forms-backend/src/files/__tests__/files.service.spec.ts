import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { Files } from '@prisma/client'

import prismaMock from '../../../test/singleton'
import FormsHelper from '../../forms/forms.helper'
import FormsService from '../../forms/forms.service'
import NasesConsumerHelper from '../../nases-consumer/nases-consumer.helper'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../../utils/subservices/minio-client.subservice'
import FilesHelper from '../files.helper'
import FilesService from '../files.service'

jest.mock('@nestjs/config')
jest.mock('../utils/subservices/minio-client.subservice')
jest.mock('../forms/forms.service')
jest.mock('./files.helper')
jest.mock('../forms/forms.helper')
jest.mock('../nases-consumer/nases-consumer.helper')

describe('FilesService', () => {
  let service: FilesService

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: PrismaService, useValue: prismaMock },
        ConfigService,
        MinioClientSubservice,
        FormsService,
        FilesHelper,
        FormsHelper,
        ThrowerErrorGuard,
        NasesConsumerHelper,
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
      service['nasesConsumerHelper'].checkInfectedFiles = jest
        .fn()
        .mockResolvedValue(true)

      const result = await service.areFormAttachmentsReady('1')
      expect(result.filesReady).toBeFalsy()
    })

    it('should be false if there are error files', async () => {
      prismaMock.files.findMany.mockResolvedValue([])
      service['nasesConsumerHelper'].checkInfectedFiles = jest
        .fn()
        .mockResolvedValue(false)
      service['nasesConsumerHelper'].checkErrorFiles = jest
        .fn()
        .mockResolvedValue(true)

      const result = await service.areFormAttachmentsReady('1')
      expect(result.filesReady).toBeFalsy()
    })

    it('should return true otherwise', async () => {
      prismaMock.files.findMany.mockResolvedValue([])
      service['nasesConsumerHelper'].checkInfectedFiles = jest
        .fn()
        .mockResolvedValue(false)
      service['nasesConsumerHelper'].checkErrorFiles = jest
        .fn()
        .mockResolvedValue(false)

      const result = await service.areFormAttachmentsReady('1')
      expect(result.filesReady).toBeTruthy()
    })
  })
})
