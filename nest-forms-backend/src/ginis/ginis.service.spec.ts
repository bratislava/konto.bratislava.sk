/* eslint-disable pii/no-email */
import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'

import { SslPridatSouborPridatSoubor } from '@bratislava/ginis-sdk'
import { createMock } from '@golevelup/ts-jest'
import { getQueueToken } from '@nestjs/bull'
import { Test, TestingModule } from '@nestjs/testing'
import { Files, FormError, Forms, FormState, GinisState } from '@prisma/client'
import { FormDefinitionType } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import prismaMock from '../../test/singleton'
import ClientsService from '../clients/clients.service'
import BaConfigService from '../config/ba-config.service'
import ConvertService from '../convert/convert.service'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import PrismaService from '../prisma/prisma.service'
import MailgunService from '../utils/global-services/mailer/mailgun.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import { FormWithFiles } from '../utils/types/prisma'
import { GinisCheckNasesPayloadDto } from './dtos/ginis.response.dto'
import GinisService from './ginis.service'
import GinisHelper from './subservices/ginis.helper'
import GinisAPIService, {
  GinContactType,
  SslFileUploadType,
  SslWflDocumentElectronicSourceExistence,
} from './subservices/ginis-api.service'

jest.mock('forms-shared/definitions/getFormDefinitionBySlug', () => ({
  getFormDefinitionBySlug: jest.fn(),
}))
jest.mock('./subservices/ginis.helper')
jest.mock('../rabbitmq-client/rabbitmq-client.service')
jest.mock('node:crypto', () => {
  const actualCrypto = jest.requireActual('node:crypto')
  return {
    ...actualCrypto,
    randomUUID: jest.fn(),
  }
})
jest.mock('forms-shared/form-utils/formDataExtractors', () => ({
  extractFormSubjectPlain: jest.fn(),
  extractFormSubjectTechnical: jest.fn(),
}))
jest.mock('forms-shared/slovensko-sk/xmlBuilder', () => ({
  buildSlovenskoSkXml: jest.fn(),
}))

describe('GinisService', () => {
  let service: GinisService

  const { JEST_WORKER_ID } = process.env

  beforeEach(async () => {
    jest.resetAllMocks()

    process.env = {
      MAILGUN_API_KEY: 'test',
      MAILGUN_DOMAIN: 'test',
      MAILGUN_HOST: 'test',
      MAILGUN_EMAIL_FROM: 'test',
      RABBIT_MQ_USERNAME: 'test',
      RABBIT_MQ_PASSWORD: 'test',
      RABBIT_MQ_HOST: 'test',
      RABBIT_MQ_PORT: 'test',
      NODE_ENV: 'development',
      JEST_WORKER_ID: JEST_WORKER_ID ?? '1',
    }

    const randomMocked = randomUUID as jest.MockedFunction<typeof randomUUID>
    randomMocked.mockReturnValue('mock-mock-mock-mock-mock')

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GinisService,
        GinisAPIService,
        GinisHelper,
        { provide: ClientsService, useValue: createMock<ClientsService>() },
        { provide: MailgunService, useValue: createMock<MailgunService>() },
        { provide: ConvertService, useValue: createMock<ConvertService>() },
        {
          provide: MinioClientSubservice,
          useValue: {
            download: jest.fn(),
          },
        },
        ThrowerErrorGuard,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: NasesUtilsService,
          useValue: createMock<NasesUtilsService>(),
        },
        { provide: getQueueToken('sharepoint'), useValue: { add: jest.fn() } },
        {
          provide: BaConfigService,
          useValue: {
            ginisApi: {
              username: '',
              password: '',
              sslHost: '',
              sslMtomHost: '',
              ginHost: '',
              formIdPropertyId: '',
            },
            ginis: {
              shouldRegister: true,
            },
            minio: {
              buckets: {
                safe: '',
              },
            },
            cityAccountBackend: {
              apiKey: 'test-api-key',
            },
          },
        },
      ],
    }).compile()

    service = module.get<GinisService>(GinisService)

    Object.defineProperty(service, 'logger', {
      value: { error: jest.fn(), debug: jest.fn(), log: jest.fn() },
    })

    // Create a real NasesUtilsService instance for extraction methods
    // The extraction methods are pure functions that don't need dependencies
    const realNasesUtilsService = new NasesUtilsService(
      createMock(),
      module.get(ThrowerErrorGuard),
      createMock<PrismaService>(),
      createMock(),
      createMock(),
      createMock(),
      createMock(),
    )

    // Use real implementations for extraction methods
    jest
      .spyOn(service['nasesUtilsService'], 'extractNaturalPersonData')
      .mockImplementation((contact) =>
        realNasesUtilsService.extractNaturalPersonData(contact),
      )
    jest
      .spyOn(service['nasesUtilsService'], 'extractCorporateBodyData')
      .mockImplementation((contact) =>
        realNasesUtilsService.extractCorporateBodyData(contact),
      )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('onQueueConsumption', () => {
    const messageBase: GinisCheckNasesPayloadDto = {
      formId: 'id1',
      tries: 0,
      userData: {
        firstName: 'first',
        email: 'mail',
      },
    }

    const formBase: FormWithFiles = {
      files: [] as Files[],
      id: 'id1',
      ginisState: GinisState.CREATED,
      state: FormState.DELIVERED_NASES,
      formDefinitionSlug: 'slug',
    } as FormWithFiles

    it('should error when form does not exist', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(null)
      const result = await service.onQueueConsumption(messageBase)

      const spy = jest.spyOn(service['ginisHelper'], 'setFormToError')
      expect(result.requeue).toBeFalsy()
      expect(spy).toHaveBeenCalled()
    })

    it('should error when form definition does not exist', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(null)

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
      } as FormWithFiles)

      await expect(service.onQueueConsumption(messageBase)).rejects.toThrow(
        'Form definition was not found for given slug. slug',
      )
    })

    it('should error when form definition is not of a SlovenskoSkGeneric type', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkTax,
      })

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
      } as FormWithFiles)

      await expect(service.onQueueConsumption(messageBase)).rejects.toThrow(
        'onQueueConsumption: Got unsupported type of FormDefinition.: SlovenskoSkTax, form id: id1',
      )
    })

    it('should run register if not yet registered', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })

      prismaMock.forms.findUnique.mockResolvedValue(formBase)

      const registerSpy = jest
        .spyOn(service, 'registerGinisDocument')
        .mockResolvedValue(false)

      // should only change state to allow register
      let result = await service.onQueueConsumption(messageBase)

      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.RUNNING_REGISTER,
          },
        }),
      )

      expect(registerSpy).not.toHaveBeenCalled()
      expect(result.requeue).toBeTruthy()
      jest.clearAllMocks()

      // should try to register and requeue if it couldn't find the document
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_REGISTER,
      })
      result = await service.onQueueConsumption(messageBase)
      expect(registerSpy).toHaveBeenCalled()
      expect(result.requeue).toBeTruthy()
      jest.clearAllMocks()

      // should only change state if there was error to allow register again
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.ERROR_REGISTER,
      })
      result = await service.onQueueConsumption(messageBase)
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.RUNNING_REGISTER,
          },
        }),
      )
      expect(registerSpy).not.toHaveBeenCalled()
      expect(result.requeue).toBeTruthy()
    })

    it('should upload files', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.REGISTERED,
        ginisDocumentId: 'ginis1',
        files: [
          {
            ginisUploadedError: false,
            ginisUploaded: false,
          } as unknown as Files,
          {
            ginisUploadedError: false,
            ginisUploaded: false,
          } as unknown as Files,
        ],
      } as FormWithFiles)
      const uploadSpy = jest
        .spyOn(service, 'uploadAttachments')
        .mockResolvedValue()

      // When upload for first time - just upload
      let result = await service.onQueueConsumption(messageBase)
      expect(uploadSpy).toHaveBeenCalled()
      expect(result.requeue).toBeTruthy()
      jest.clearAllMocks()

      // When one error - requeue, upload, report error
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
        ginisDocumentId: 'ginis1',
        files: [
          {
            ginisUploadedError: true,
            ginisUploaded: false,
          } as unknown as Files,
          {
            ginisUploadedError: false,
            ginisUploaded: true,
          } as unknown as Files,
        ],
      } as FormWithFiles)
      result = await service.onQueueConsumption(messageBase)
      expect(uploadSpy).toHaveBeenCalled()
      expect(result.requeue).toBeTruthy()
      jest.clearAllMocks()

      // When all errors - requeue, upload, report error
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
        ginisDocumentId: 'ginis1',
        files: [
          {
            ginisUploadedError: true,
            ginisUploaded: false,
          } as unknown as Files,
          {
            ginisUploadedError: true,
            ginisUploaded: false,
          } as unknown as Files,
        ],
      } as FormWithFiles)
      result = await service.onQueueConsumption(messageBase)
      expect(uploadSpy).toHaveBeenCalled()
      expect(result.requeue).toBeTruthy()
      jest.clearAllMocks()

      // When no more files, change to Attachments uploaded
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
        ginisDocumentId: 'ginis1',
        files: [],
      } as FormWithFiles)
      result = await service.onQueueConsumption(messageBase)
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.ATTACHMENTS_UPLOADED,
            error: FormError.NONE,
          },
        }),
      )
      expect(uploadSpy).not.toHaveBeenCalled()
      expect(result.requeue).toBeTruthy()

      // When missing ginisDocumentId, skip upload
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
        files: [
          {
            ginisUploadedError: false,
            ginisUploaded: false,
          } as unknown as Files,
          {
            ginisUploadedError: false,
            ginisUploaded: false,
          } as unknown as Files,
        ],
      } as FormWithFiles)

      result = await service.onQueueConsumption(messageBase)
      expect(uploadSpy).not.toHaveBeenCalled()
      expect(result.requeue).toBeTruthy()
    })

    it('should mark as files uploaded if there are no files', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.REGISTERED,
      })

      const uploadSpy = jest
        .spyOn(service, 'uploadAttachments')
        .mockResolvedValue()
      const result = await service.onQueueConsumption(messageBase)

      expect(result.requeue).toBeTruthy()
      expect(uploadSpy).not.toHaveBeenCalled()
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.ATTACHMENTS_UPLOADED,
            error: FormError.NONE,
          },
        }),
      )
    })

    it('should assign submission if all files are uploaded', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
        ginisAssignment: {
          ginisNodeId: 'nodeId',
          ginisFunctionId: 'functionId',
        },
      })

      // missing ginisDocumentId
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.ATTACHMENTS_UPLOADED,
      })
      const assignSpy = jest
        .spyOn(service, 'assignSubmission')
        .mockResolvedValue()

      let result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeTruthy()
      expect(assignSpy).not.toHaveBeenCalled()

      // ginisDocumentId present
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisDocumentId: 'docId',
        ginisState: GinisState.ATTACHMENTS_UPLOADED,
      } as FormWithFiles)
      result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeTruthy()
      expect(assignSpy).toHaveBeenCalledWith('docId', 'nodeId', 'functionId')

      // If ERROR_ASSIGN_SUBMISSION, skip upload, manual intervention required

      // missing ginisDocumentId
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.ERROR_ASSIGN_SUBMISSION,
      })
      assignSpy.mockClear()

      result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeTruthy()
      expect(assignSpy).not.toHaveBeenCalled()

      // ginisDocumentId present
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisDocumentId: 'docId',
        ginisState: GinisState.ERROR_ASSIGN_SUBMISSION,
      } as FormWithFiles)
      result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeTruthy()
      expect(assignSpy).not.toHaveBeenCalled()
    })

    it('should mark as ready for processing if there is no sharepoint', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.SUBMISSION_ASSIGNED,
      } as FormWithFiles)

      const sendMailSpy = jest
        .spyOn(service['mailgunService'], 'sendEmail')
        .mockResolvedValue()
      const sendToSharepointSpy = jest.spyOn(service['sharepointQueue'], 'add')

      let result = await service.onQueueConsumption({
        ...messageBase,
        userData: {
          firstName: 'first',
          email: null,
        },
      })
      expect(result.requeue).toBeFalsy() // all processed
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            state: FormState.PROCESSING,
            ginisState: GinisState.FINISHED,
            error: FormError.NONE,
          },
        }),
      )
      expect(sendMailSpy).not.toHaveBeenCalled()
      expect(sendToSharepointSpy).not.toHaveBeenCalled()

      jest.clearAllMocks()
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.SUBMISSION_ASSIGNED,
      } as FormWithFiles)
      result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeFalsy() // all processed
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            state: FormState.PROCESSING,
            ginisState: GinisState.FINISHED,
            error: FormError.NONE,
          },
        }),
      )
      expect(sendMailSpy).toHaveBeenCalled()
      expect(sendToSharepointSpy).not.toHaveBeenCalled()
    })

    it('should send to sharepoint', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
        sharepointData: {
          databaseName: 'test',
          columnMap: {
            col1: {
              type: 'mag_number',
            },
          },
        },
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.SUBMISSION_ASSIGNED,
      } as FormWithFiles)

      const sendMailSpy = jest
        .spyOn(service['mailgunService'], 'sendEmail')
        .mockResolvedValue()
      const sendToSharepointSpy = jest.spyOn(service['sharepointQueue'], 'add')

      let result = await service.onQueueConsumption({
        ...messageBase,
        userData: {
          firstName: 'first',
          email: null,
        },
      })
      expect(result.requeue).toBeFalsy() // all processed
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            state: FormState.SENDING_TO_SHAREPOINT,
            ginisState: GinisState.FINISHED,
            error: FormError.NONE,
          },
        }),
      )
      expect(sendMailSpy).not.toHaveBeenCalled()
      expect(sendToSharepointSpy).toHaveBeenCalled()

      jest.clearAllMocks()
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
        sharepointData: {
          databaseName: 'test',
          columnMap: {
            col1: {
              type: 'mag_number',
            },
          },
        },
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.SUBMISSION_ASSIGNED,
      } as FormWithFiles)
      result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeFalsy() // all processed
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            state: FormState.SENDING_TO_SHAREPOINT,
            ginisState: GinisState.FINISHED,
            error: FormError.NONE,
          },
        }),
      )
      expect(sendMailSpy).toHaveBeenCalled()
      expect(sendToSharepointSpy).toHaveBeenCalled()
    })
  })

  describe('registerToGinis', () => {
    beforeEach(() => {
      jest
        .spyOn(service['ginisHelper'], 'retryWithDelay')
        .mockImplementation(async (fn) => fn())

      jest
        .spyOn(service['ginisApiService'], 'findDocumentId')
        .mockResolvedValue('gid1')
    })

    it('should update form with error after ginis error', async () => {
      jest
        .spyOn(service['ginisApiService'], 'findDocumentId')
        .mockRejectedValueOnce(new Error('Ginis find failed'))

      const result = await service.registerGinisDocument('formId1')

      expect(result).toBeFalsy()
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            state: FormState.ERROR,
            error: FormError.GINIS_SEND_ERROR,
            ginisState: GinisState.ERROR_REGISTER,
          },
        }),
      )
    })

    it('should not update form after unsuccessful find', async () => {
      jest
        .spyOn(service['ginisApiService'], 'findDocumentId')
        .mockResolvedValueOnce(null)

      const result = await service.registerGinisDocument('formId1')

      expect(result).toBeFalsy()
      expect(prismaMock.forms['update']).not.toHaveBeenCalledWith()
    })

    it('should update form with ginis ID after success', async () => {
      const result = await service.registerGinisDocument('formId1')

      expect(result).toBeTruthy()
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            state: FormState.DELIVERED_GINIS,
            ginisDocumentId: 'gid1',
            error: FormError.NONE,
            ginisState: GinisState.REGISTERED,
          },
        }),
      )
    })
  })

  describe('uploadAttachments', () => {
    const formMock = {
      id: 'id1',
      ginisDocumentId: 'gid1',
      files: [
        {
          ginisUploaded: false,
          fileName: 'file1.pdf',
          minioFileName: 'minio-file1.pdf',
        },
      ],
    } as unknown as FormWithFiles

    const mockStream = new Readable({
      read() {
        this.push('file content')
        this.push(null)
      },
    })

    beforeEach(() => {
      jest
        .spyOn(service['ginisHelper'], 'retryWithDelay')
        .mockImplementation(async (fn) => fn())

      jest
        .spyOn(service['minioClientSubservice'], 'download')
        .mockResolvedValue(mockStream)

      jest
        .spyOn(service['ginisApiService'], 'uploadFile')
        .mockResolvedValue({} as SslPridatSouborPridatSoubor)
    })

    it('should update form to RUNNING_UPLOAD_ATTACHMENTS', async () => {
      await service.uploadAttachments(formMock, 'mockPospID')
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
          },
        }),
      )
    })

    it('should update file with error after ginis error', async () => {
      jest
        .spyOn(service['ginisApiService'], 'uploadFile')
        .mockRejectedValueOnce(new Error('Ginis upload failed'))

      const spy = jest.spyOn(prismaMock.files, 'update')
      await service.uploadAttachments(formMock, 'mockPospID')
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisUploadedError: true,
          },
        }),
      )
    })

    it('should update file as uploaded on success', async () => {
      const spy = jest.spyOn(prismaMock.files, 'update')
      await service.uploadAttachments(formMock, 'mockPospID')
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisUploaded: true,
            ginisUploadedError: false,
          },
        }),
      )
    })
  })

  describe('assignSubmission', () => {
    beforeEach(() => {
      jest
        .spyOn(service['ginisHelper'], 'retryWithDelay')
        .mockImplementation(async (fn) => fn())

      jest
        .spyOn(service['ginisApiService'], 'assignDocument')
        .mockResolvedValue({
          'Datum-zmeny': '2025-06-02T19:06:00',
        })
    })

    it('should update file to RUNNING_ASSIGN_SUBMISSION', async () => {
      await service.assignSubmission('docId', 'nodeId', 'functionId')
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.RUNNING_ASSIGN_SUBMISSION,
          },
        }),
      )
    })

    it('should update form with error after ginis error', async () => {
      jest
        .spyOn(service['ginisApiService'], 'assignDocument')
        .mockRejectedValueOnce(new Error('Ginis assign failed'))

      await service.assignSubmission('docId', 'nodeId', 'functionId')

      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            state: FormState.ERROR,
            error: FormError.GINIS_SEND_ERROR,
            ginisState: GinisState.ERROR_ASSIGN_SUBMISSION,
          },
        }),
      )
    })

    it('should update form state after success', async () => {
      await service.assignSubmission('docId', 'nodeId', 'functionId')

      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.SUBMISSION_ASSIGNED,
            error: FormError.NONE,
            state: FormState.PROCESSING,
          },
        }),
      )
    })
  })

  describe('createDocument', () => {
    const formBase = {
      id: 'formId1',
      formDataJson: { test: 'data' },
      updatedAt: new Date(),
      ginisDocumentId: null,
    } as unknown as Forms

    const formDefinitionBase = {
      type: FormDefinitionType.SlovenskoSkGeneric,
      ginisDocumentTypeId: 'docType1',
    }

    beforeEach(() => {
      const { extractFormSubjectTechnical } = jest.requireMock(
        'forms-shared/form-utils/formDataExtractors',
      )
      ;(extractFormSubjectTechnical as jest.Mock).mockReturnValue(
        'Test Subject',
      )

      jest
        .spyOn(service['ginisHelper'], 'retryWithDelay')
        .mockImplementation(async (fn) => fn())

      jest
        .spyOn(service['ginisApiService'], 'createDocument')
        .mockResolvedValue('newDocId')

      jest
        .spyOn(service['ginisApiService'], 'getDocumentDetail')
        .mockResolvedValue({
          'Cj-dokumentu': 'ref123',
          'Wfl-dokument': {
            'Priznak-el-obrazu': SslWflDocumentElectronicSourceExistence.EXISTS,
          },
        } as any)

      jest
        .spyOn(service['ginisApiService'], 'findDocumentId')
        .mockResolvedValue('foundDocId')

      jest
        .spyOn(service['ginisApiService'], 'createFormIdProperty')
        .mockResolvedValue('1')

      jest
        .spyOn(service['ginisApiService'], 'setFormIdProperty')
        .mockResolvedValue()

      jest
        .spyOn(service['ginisApiService'], 'upsertContact')
        .mockResolvedValue('contactId')

      jest
        .spyOn(service['nasesUtilsService'], 'createTechnicalAccountJwtToken')
        .mockReturnValue('jwt-token')
    })

    it('should throw error when formDataJson is null', async () => {
      const form = { ...formBase, formDataJson: null } as Forms

      await expect(
        service.createDocument(form, formDefinitionBase as any),
      ).rejects.toThrow('Form data is empty.')
    })

    it('should create document with externalId only', async () => {
      const form = {
        ...formBase,
        externalId: 'extId1',
        mainUri: null,
      } as Forms

      jest
        .spyOn(
          service['clientsService'].cityAccountApi,
          // eslint-disable-next-line no-secrets/no-secrets
          'userIntegrationControllerGetContactAndIdInfoByExternalId',
        )
        .mockResolvedValue({
          data: {
            email: 'test@example.com',
            accountType: 'fo',
            firstName: 'John',
            lastName: 'Doe',
          },
        } as any)

      await service.createDocument(form, formDefinitionBase as any)

      expect(service['ginisApiService'].upsertContact).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GinContactType.PHYSICAL_ENTITY,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        }),
      )
      expect(service['ginisApiService'].createDocument).toHaveBeenCalled()
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            state: FormState.DELIVERED_GINIS,
            ginisDocumentId: 'newDocId',
            error: FormError.NONE,
            ginisState: GinisState.REGISTERED,
          },
        }),
      )
    })

    it('should create document with mainUri only (natural person)', async () => {
      const form = {
        ...formBase,
        externalId: null,
        mainUri: 'uri://test',
      } as Forms

      jest
        .spyOn(
          service['clientsService'].slovenskoSkApi,
          'apiIamIdentitiesSearchPost',
        )
        .mockResolvedValue({
          data: [
            {
              type: 'natural_person',
              uri: 'uri://test',
              emails: [{ address: 'test@example.com' }],
              natural_person: {
                given_names: ['John'],
                family_names: [{ value: 'Doe', primary: true }],
              },
            },
          ],
        } as any)

      await service.createDocument(form, formDefinitionBase as any)

      expect(service['ginisApiService'].upsertContact).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GinContactType.PHYSICAL_ENTITY,
          uri: 'uri://test',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        }),
      )
    })

    it('should create document with mainUri only (corporate body)', async () => {
      const form = {
        ...formBase,
        externalId: null,
        mainUri: 'uri://test',
      } as Forms

      jest
        .spyOn(
          service['clientsService'].slovenskoSkApi,
          'apiIamIdentitiesSearchPost',
        )
        .mockResolvedValue({
          data: [
            {
              type: 'legal_entity',
              uri: 'uri://test',
              emails: [{ address: 'test@example.com' }],
              corporate_body: {
                name: 'Test Company',
                cin: '12345678',
              },
            },
          ],
        } as any)

      await service.createDocument(form, formDefinitionBase as any)

      expect(service['ginisApiService'].upsertContact).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GinContactType.LEGAL_ENTITY,
          uri: 'uri://test',
          email: 'test@example.com',
          name: 'Test Company',
          ico: '12345678',
        }),
      )
    })

    it('should merge contact params from externalId and mainUri', async () => {
      const form = {
        ...formBase,
        externalId: 'extId1',
        mainUri: 'uri://test',
      } as Forms

      jest
        .spyOn(
          service['clientsService'].cityAccountApi,
          // eslint-disable-next-line no-secrets/no-secrets
          'userIntegrationControllerGetContactAndIdInfoByExternalId',
        )
        .mockResolvedValue({
          data: {
            email: 'external@example.com',
            accountType: 'fo',
            firstName: 'External',
            lastName: 'User',
          },
        } as any)

      jest
        .spyOn(
          service['clientsService'].slovenskoSkApi,
          'apiIamIdentitiesSearchPost',
        )
        .mockResolvedValue({
          data: [
            {
              type: 'natural_person',
              uri: 'uri://test',
              emails: [{ address: 'uri@example.com' }],
              natural_person: {
                given_names: ['John'],
                family_names: [{ value: 'Doe', primary: true }],
              },
            },
          ],
        } as any)

      await service.createDocument(form, formDefinitionBase as any)

      expect(service['ginisApiService'].upsertContact).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GinContactType.PHYSICAL_ENTITY,
          email: 'external@example.com', // email from externalId should be kept
          firstName: 'John', // extracted from URI natural_person data
          lastName: 'Doe', // extracted from URI natural_person data
          uri: 'uri://test',
        }),
      )
    })

    it('should skip upsertContact when no contact information available', async () => {
      const form = {
        ...formBase,
        externalId: null,
        mainUri: null,
      } as Forms

      await service.createDocument(form, formDefinitionBase as any)

      expect(service['ginisApiService'].upsertContact).not.toHaveBeenCalled()
      expect(service['ginisApiService'].createDocument).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        undefined, // senderId should be undefined
      )
    })

    it('should not create a document second time if it already exists in ginis', async () => {
      const form = {
        ...formBase,
        ginisDocumentId: 'existingDocId',
      } as Forms

      await service.createDocument(form, formDefinitionBase as any)

      expect(service['ginisApiService'].createDocument).not.toHaveBeenCalled()
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ginisDocumentId: 'existingDocId',
          }),
        }),
      )
    })

    it('should assign reference number if not present', async () => {
      const form = formBase as Forms

      jest
        .spyOn(service['ginisApiService'], 'getDocumentDetail')
        .mockResolvedValue({
          'Wfl-dokument': {
            'Priznak-el-obrazu': SslWflDocumentElectronicSourceExistence.EXISTS, // skip uploading sopurce document,
          },
        } as any) // no 'Cj-dokumentu'

      jest
        .spyOn(service['ginisApiService'], 'assignReferenceNumber')
        .mockResolvedValue()

      await service.createDocument(form, formDefinitionBase as any)

      expect(
        service['ginisApiService'].assignReferenceNumber,
      ).toHaveBeenCalledWith('newDocId')
    })

    it('should set formId property when document not found by formId', async () => {
      const form = formBase as Forms

      jest
        .spyOn(service['ginisApiService'], 'findDocumentId')
        .mockResolvedValue('differentDocId') // different from created

      await service.createDocument(form, formDefinitionBase as any)

      expect(
        service['ginisApiService'].createFormIdProperty,
      ).toHaveBeenCalledWith('newDocId')
      expect(service['ginisApiService'].setFormIdProperty).toHaveBeenCalledWith(
        'newDocId',
        '1',
        'formId1',
      )
    })

    it('should not set formId property when it is already set and document can be found by formId', async () => {
      const form = formBase as Forms

      jest
        .spyOn(service['ginisApiService'], 'findDocumentId')
        .mockResolvedValue('newDocId') // same as created

      await service.createDocument(form, formDefinitionBase as any)

      expect(
        service['ginisApiService'].createFormIdProperty,
      ).not.toHaveBeenCalled()
      expect(
        service['ginisApiService'].setFormIdProperty,
      ).not.toHaveBeenCalled()
    })

    it('should throw error when mainUri is missing in extractContactParamsFromUri', async () => {
      const form = {
        ...formBase,
        externalId: null,
        mainUri: null,
      } as Forms

      // Access private method through type assertion
      const extractMethod = (service as any).extractContactParamsFromUri.bind(
        service,
      )

      await expect(extractMethod(form)).rejects.toThrow(
        'Form uri not found in form',
      )
    })

    it('should throw error when externalId is missing in extractContactParamsFromExternalId', async () => {
      const form = {
        ...formBase,
        externalId: null,
      } as Forms

      const extractMethod = (
        service as any
      ).extractContactParamsFromExternalId.bind(service)

      await expect(extractMethod(form)).rejects.toThrow(
        'External id not found in form',
      )
    })

    it('should throw error when contact not found in nases', async () => {
      const form = {
        ...formBase,
        externalId: null,
        mainUri: 'uri://test',
      } as Forms

      jest
        .spyOn(
          service['clientsService'].slovenskoSkApi,
          'apiIamIdentitiesSearchPost',
        )
        .mockResolvedValue({
          data: [],
        } as any)

      await expect(
        service.createDocument(form, formDefinitionBase as any),
      ).rejects.toThrow('Form uri not found in nases')
    })

    it('should throw error when multiple contacts found in nases', async () => {
      const form = {
        ...formBase,
        externalId: null,
        mainUri: 'uri://test',
      } as Forms

      jest
        .spyOn(
          service['clientsService'].slovenskoSkApi,
          'apiIamIdentitiesSearchPost',
        )
        .mockResolvedValue({
          data: [{ type: 'natural_person' }, { type: 'natural_person' }],
        } as any)

      await expect(
        service.createDocument(form, formDefinitionBase as any),
      ).rejects.toThrow('Multiple results found for form uri')
    })

    it('should throw error when contact info not found in city account', async () => {
      const form = {
        ...formBase,
        externalId: 'extId1',
        mainUri: null,
      } as Forms

      jest
        .spyOn(
          service['clientsService'].cityAccountApi,
          // eslint-disable-next-line no-secrets/no-secrets
          'userIntegrationControllerGetContactAndIdInfoByExternalId',
        )
        .mockResolvedValue({
          data: null,
        } as any)

      await expect(
        service.createDocument(form, formDefinitionBase as any),
      ).rejects.toThrow('Contact info not found in city account')
    })

    it('should handle legal entity from externalId', async () => {
      const form = {
        ...formBase,
        externalId: 'extId1',
        mainUri: null,
      } as Forms

      jest
        .spyOn(
          service['clientsService'].cityAccountApi,
          // eslint-disable-next-line no-secrets/no-secrets
          'userIntegrationControllerGetContactAndIdInfoByExternalId',
        )
        .mockResolvedValue({
          data: {
            email: 'test@example.com',
            accountType: 'po',
            name: 'Company Name',
            ico: '87654321',
          },
        } as any)

      await service.createDocument(form, formDefinitionBase as any)

      expect(service['ginisApiService'].upsertContact).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GinContactType.LEGAL_ENTITY,
          name: 'Company Name',
          ico: '87654321',
        }),
      )
    })

    it('should handle self-employed entity from externalId', async () => {
      const form = {
        ...formBase,
        externalId: 'extId1',
        mainUri: null,
      } as Forms

      jest
        .spyOn(
          service['clientsService'].cityAccountApi,
          // eslint-disable-next-line no-secrets/no-secrets
          'userIntegrationControllerGetContactAndIdInfoByExternalId',
        )
        .mockResolvedValue({
          data: {
            email: 'test@example.com',
            accountType: 'fo-p',
            name: 'Self Employed',
            ico: '11223344',
          },
        } as any)

      await service.createDocument(form, formDefinitionBase as any)

      expect(service['ginisApiService'].upsertContact).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GinContactType.SELF_EMPLOYED_ENTITY,
          name: 'Self Employed',
          ico: '11223344',
        }),
      )
    })

    it('should upload XML source file when electronic source does not exist', async () => {
      const { buildSlovenskoSkXml } = jest.requireMock(
        'forms-shared/slovensko-sk/xmlBuilder',
      )
      const form = formBase as Forms
      const mockXmlObject = { root: { data: 'test' } }
      // eslint-disable-next-line xss/no-mixed-html
      const mockXmlString =
        '<?xml version="1.0"?><root><data>test</data></root>'

      jest
        .spyOn(service['ginisApiService'], 'getDocumentDetail')
        .mockResolvedValue({
          'Cj-dokumentu': 'ref123',
          'Wfl-dokument': {
            'Priznak-el-obrazu':
              SslWflDocumentElectronicSourceExistence.DOES_NOT_EXIST,
          },
        } as any)

      jest
        .spyOn(service['convertService'], 'convertJsonToXmlObjectForForm')
        .mockResolvedValue(mockXmlObject)
      ;(buildSlovenskoSkXml as jest.Mock).mockReturnValue(mockXmlString)

      jest
        .spyOn(service['ginisApiService'], 'uploadFile')
        .mockResolvedValue({} as any)

      await service.createDocument(form, formDefinitionBase as any)

      expect(
        service['convertService'].convertJsonToXmlObjectForForm,
      ).toHaveBeenCalledWith(form)
      expect(buildSlovenskoSkXml).toHaveBeenCalledWith(mockXmlObject, {
        headless: false,
        pretty: false,
      })
      expect(service['ginisApiService'].uploadFile).toHaveBeenCalledWith(
        'newDocId',
        `source_form_${form.id}.xml`,
        expect.any(Readable),
        SslFileUploadType.SOURCE,
      )
    })

    it('should not upload XML source file when electronic source exists', async () => {
      const form = formBase as Forms

      jest
        .spyOn(service['ginisApiService'], 'getDocumentDetail')
        .mockResolvedValue({
          'Cj-dokumentu': 'ref123',
          'Wfl-dokument': {
            'Priznak-el-obrazu': SslWflDocumentElectronicSourceExistence.EXISTS,
          },
        } as any)

      jest
        .spyOn(service['convertService'], 'convertJsonToXmlObjectForForm')
        .mockResolvedValue({})

      jest
        .spyOn(service['ginisApiService'], 'uploadFile')
        .mockResolvedValue({} as any)

      await service.createDocument(form, formDefinitionBase as any)

      expect(
        service['convertService'].convertJsonToXmlObjectForForm,
      ).not.toHaveBeenCalled()
      expect(service['ginisApiService'].uploadFile).not.toHaveBeenCalled()
    })
  })
})
/* eslint-enable pii/no-email */
