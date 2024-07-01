import { Readable } from 'node:stream'

import { createMock } from '@golevelup/ts-jest'
import { getQueueToken } from '@nestjs/bull'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { FormError, Forms } from '@prisma/client'
import {
  FormDefinitionSlovenskoSk,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'

import prismaMock from '../../test/singleton'
import ConvertService from '../convert/convert.service'
import JsonXmlConvertService from '../convert/utils-services/json-xml.convert.service'
import ConvertPdfService from '../convert-pdf/convert-pdf.service'
import FilesHelper from '../files/files.helper'
import FilesService from '../files/files.service'
import FormsHelper from '../forms/forms.helper'
import FormsService from '../forms/forms.service'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import ScannerClientService from '../scanner-client/scanner-client.service'
import TaxService from '../tax/tax.service'
import MailgunService from '../utils/global-services/mailgun/mailgun.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import rabbitmqRequeueDelay from '../utils/handlers/rabbitmq.handlers'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import { FormWithFiles } from '../utils/types/prisma'
import NasesConsumerHelper from './nases-consumer.helper'
import NasesConsumerService from './nases-consumer.service'

jest.mock('../rabbitmq-client/rabbitmq-client.service')
jest.mock('../files/files.service')
jest.mock('../forms/forms.service')
jest.mock('../utils/global-services/mailgun/mailgun.service')
jest.mock('../nases/utils-services/tokens.nases.service')

// TODO create factories for test data
const fakeFile = {
  id: 'fake-data',
  pospId: 'fake-data',
  formId: 'fake-data',
  scannerId: null,
  minioFileName: 'fake-data',
  fileName: 'fake-data',
  fileSize: 1,
  status: 'SAFE',
  ginisOrder: null,
  ginisUploaded: false,
  ginisUploadedError: false,
  createdAt: new Date(),
  updatedAt: new Date(),
} as const

describe('NasesConsumerService', () => {
  let service: NasesConsumerService
  let formsService: FormsService
  let convertService: ConvertService
  let filesHelper: FilesHelper

  beforeEach(async () => {
    jest.resetAllMocks()

    process.env = {
      MAILGUN_API_KEY: 'test',
      MAILGUN_DOMAIN: 'test',
      MAILGUN_HOST: 'test',
      MAILGUN_EMAIL_FROM: 'test',
    }

    // TODO refactor to use imports
    const app: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        ConvertPdfService,
        NasesConsumerService,
        NasesUtilsService,
        RabbitmqClientService,
        FormsService,
        FilesService,
        MailgunService,
        FilesHelper,
        FormsHelper,
        NasesConsumerHelper,
        ScannerClientService,
        ConvertService,
        TaxService,
        JsonXmlConvertService,
        ThrowerErrorGuard,
        {
          provide: getQueueToken('tax'),
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'MIMETYPE_WHITELIST') {
                return 'application/pdf application/msword application/vnd.openxmlformats-officedocument.wordprocessingml.document application/vnd.ms-excel application/vnd.openxmlformats-officedocument.spreadsheetml.sheet application/vnd.ms-powerpoint application/vnd.openxmlformats-officedocument.presentationml.presentation text/csv image/jpeg image/png image/gif image/tiff image/bmp image/vnd.dwg image/vnd.dxf application/zip application/x-zip-compressed'
              }
              return null
            }),
          },
        },
        FormsService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: MinioClientSubservice,
          useValue: createMock<MinioClientSubservice>(),
        },
      ],
    }).compile()

    service = app.get<NasesConsumerService>(NasesConsumerService)
    formsService = app.get<FormsService>(FormsService)
    convertService = app.get<ConvertService>(ConvertService)
    filesHelper = app.get<FilesHelper>(FilesHelper)
    Object.defineProperty(service, 'logger', {
      value: {
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        log: jest.fn(),
      },
    })

    // mock resolving mick form & saving file to db in each convert-pdf call
    formsService['getUniqueForm'] = jest.fn().mockResolvedValue({
      id: 'id',
    } as FormWithFiles)
    filesHelper.upsertFileByUid = jest.fn().mockResolvedValue(fakeFile)
  })

  describe('should be defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })
  })

  describe('sendToNasesAndUpdateState', () => {
    it('should error handle if status is not 200', async () => {
      service['nasesUtilsService'].sendMessageNases = jest
        .fn()
        .mockResolvedValue({ status: 401 })

      const convertSpy = jest
        .spyOn(convertService, 'generatePdfV2')
        .mockResolvedValue(new Readable())

      const spyLog = jest.spyOn(service['logger'], 'error')

      await service.sendToNasesAndUpdateState(
        '',
        {} as Forms,
        {
          formId: '',
          tries: 1,
          userData: {
            email: 'test.inovacie_at_bratislava.sk',
            firstName: 'Tester',
          },
        },
        {} as FormDefinitionSlovenskoSk,
        '',
      )

      expect(spyLog).toHaveBeenCalled()
      expect(convertSpy).toHaveBeenCalled()
    })

    it('should start checking for nases delivery and not trigger any errors', async () => {
      service['nasesUtilsService'].sendMessageNases = jest
        .fn()
        .mockResolvedValue({ status: 200 })

      const spyLog = jest.spyOn(service['logger'], 'error')
      const spyDelay = jest.spyOn(service as any, 'queueDelayedForm')
      const spyPublish = jest.spyOn(
        service['rabbitmqClientService'],
        'publishToGinis',
      )

      const convertSpy = jest
        .spyOn(convertService, 'generatePdfV2')
        .mockResolvedValue(new Readable())

      await service.sendToNasesAndUpdateState(
        '',
        {} as Forms,
        {
          formId: 'formIdVal',
          tries: 1,
          userData: {
            email: 'test.inovacie_at_bratislava.sk',
            firstName: 'Tester',
          },
        },
        {
          type: FormDefinitionType.SlovenskoSkGeneric,
        } as FormDefinitionSlovenskoSk,
        '',
      )

      expect(spyLog).not.toHaveBeenCalled()
      expect(spyDelay).not.toHaveBeenCalled()
      expect(spyPublish).toHaveBeenCalledWith({
        formId: 'formIdVal',
        tries: 0,
        userData: {
          email: 'test.inovacie_at_bratislava.sk',
          firstName: 'Tester',
        },
      })

      expect(convertSpy).toHaveBeenCalled()
    })
  })

  describe('queueDelayedForm', () => {
    it('should requeue', async () => {
      const spyError = jest.spyOn(service['logger'], 'error')
      const spyDelay = jest.spyOn(
        service['rabbitmqClientService'],
        'publishDelay',
      )

      await service['queueDelayedForm']('formIdVal', 2, FormError.NONE, {
        email: 'test.inovacie_at_bratislava.sk',
        firstName: 'Tester',
      })

      expect(spyError).not.toHaveBeenCalled()
      expect(spyDelay).toHaveBeenCalledWith(
        {
          formId: 'formIdVal',
          tries: 3,
          userData: {
            email: 'test.inovacie_at_bratislava.sk',
            firstName: 'Tester',
          },
        },
        rabbitmqRequeueDelay(3),
      )
    })
  })
})
