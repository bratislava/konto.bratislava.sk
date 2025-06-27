/* eslint-disable pii/no-email */
import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'

import { SslPridatSouborPridatSoubor } from '@bratislava/ginis-sdk'
import { createMock } from '@golevelup/ts-jest'
import { getQueueToken } from '@nestjs/bull'
import { Test, TestingModule } from '@nestjs/testing'
import { Files, FormError, FormState, GinisState } from '@prisma/client'
import { FormDefinitionType } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import prismaMock from '../../test/singleton'
import BaConfigService from '../config/ba-config.service'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import MailgunService from '../utils/global-services/mailer/mailgun.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import { FormWithFiles } from '../utils/types/prisma'
import { GinisCheckNasesPayloadDto } from './dtos/ginis.response.dto'
import GinisService from './ginis.service'
import GinisHelper from './subservices/ginis.helper'
import GinisAPIService from './subservices/ginis-api.service'

jest.mock('forms-shared/definitions/getFormDefinitionBySlug', () => ({
  getFormDefinitionBySlug: jest.fn(),
}))
jest.mock('./subservices/ginis.helper')
jest.mock('../rabbitmq-client/rabbitmq-client.service')
jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}))
jest.mock('forms-shared/form-utils/formDataExtractors', () => ({
  extractFormSubjectPlain: jest.fn(),
  extractFormSubjectTechnical: jest.fn(),
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
        { provide: MailgunService, useValue: createMock<MailgunService>() },
        {
          provide: MinioClientSubservice,
          useValue: {
            download: jest.fn(),
          },
        },
        ThrowerErrorGuard,
        RabbitmqClientService,
        { provide: PrismaService, useValue: prismaMock },
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
          },
        },
      ],
    }).compile()

    service = module.get<GinisService>(GinisService)

    Object.defineProperty(service, 'logger', {
      value: { error: jest.fn(), debug: jest.fn(), log: jest.fn() },
    })
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
      expect(result.requeue).toBeTruthy()
      expect(uploadSpy).toHaveBeenCalled()
      jest.clearAllMocks()

      // When one error - requeue, do not upload, report error
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
      expect(result.requeue).toBeTruthy()
      expect(uploadSpy).not.toHaveBeenCalled()
      jest.clearAllMocks()

      // When all errors - requeue, do not upload, report error (TODO update behavior)
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
      expect(result.requeue).toBeTruthy()
      expect(uploadSpy).not.toHaveBeenCalled()
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
      expect(result.requeue).toBeTruthy()
      expect(uploadSpy).not.toHaveBeenCalled()
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

      // The same should happen if the state is ERROR_ASSIGN_SUBMISSION

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
      expect(assignSpy).toHaveBeenCalledWith('docId', 'nodeId', 'functionId')
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
})
/* eslint-enable pii/no-email */
