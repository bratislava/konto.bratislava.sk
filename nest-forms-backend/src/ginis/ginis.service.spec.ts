/* eslint-disable pii/no-email */
import { randomUUID } from 'node:crypto'

import { getQueueToken } from '@nestjs/bull'
import { Test, TestingModule } from '@nestjs/testing'
import { Files, FormError, FormState, GinisState } from '@prisma/client'
import { FormDefinitionType } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import prismaMock from '../../test/singleton'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import MailgunService from '../utils/global-services/mailgun/mailgun.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { FormWithFiles } from '../utils/types/prisma'
import {
  GinisAssignSubmissionResponseInfo,
  GinisAutomationResponse,
  GinisCheckNasesPayloadDto,
  GinisEditSubmissionResponseInfo,
  GinisRegisterSubmissionResponse,
  GinisRegisterSubmissionResponseInfo,
  GinisUploadFileResponse,
  GinisUploadFileResponseInfo,
} from './dtos/ginis.response.dto'
import GinisService from './ginis.service'
import GinisHelper from './subservices/ginis.helper'

jest.mock('forms-shared/definitions/getFormDefinitionBySlug', () => ({
  getFormDefinitionBySlug: jest.fn(),
}))
jest.mock('./subservices/ginis.helper')
jest.mock('../utils/global-services/mailgun/mailgun.service')
jest.mock('../utils/handlers/text.handler')
jest.mock('../rabbitmq-client/rabbitmq-client.service')
jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
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
        GinisHelper,
        MailgunService,
        ThrowerErrorGuard,
        RabbitmqClientService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: getQueueToken('sharepoint'), useValue: { add: jest.fn() } },
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

  describe('consumeRegisterGinisMessage', () => {
    it('should process failure', async () => {
      const msg: GinisAutomationResponse<
        GinisRegisterSubmissionResponse,
        GinisRegisterSubmissionResponseInfo
      > = { status: 'failure', info: { msg_id: 'id1' } }
      const spy = jest.spyOn(prismaMock.forms, 'update')
      await service.consumeRegisterGinisMessage(msg)
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            state: FormState.ERROR,
            error: FormError.GINIS_SEND_ERROR,
            ginisState: GinisState.ERROR_REGISTER,
          },
        }),
      )
    })

    it('should process success', async () => {
      const msg: GinisAutomationResponse<
        GinisRegisterSubmissionResponse,
        GinisRegisterSubmissionResponseInfo
      > = {
        status: 'success',
        info: { msg_id: 'id1' },
        result: { identifier: 'ginis1' },
      }

      const spy = jest.spyOn(prismaMock.forms, 'update')
      await service.consumeRegisterGinisMessage(msg)
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            state: FormState.DELIVERED_GINIS,
            ginisDocumentId: 'ginis1',
            error: FormError.NONE,
            ginisState: GinisState.REGISTERED,
          },
        }),
      )
    })
  })

  describe('consumeGinisFileUploaded', () => {
    it('should process failure', async () => {
      const msg: GinisAutomationResponse<
        GinisUploadFileResponse,
        GinisUploadFileResponseInfo
      > = { status: 'failure', info: { msg_id: 'id1', file_id: 'file1' } }
      const spy = jest.spyOn(prismaMock.files, 'update')
      await service.consumeGinisFileUploaded(msg)
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisUploadedError: true,
          },
        }),
      )
    })

    it('should process success', async () => {
      const msg: GinisAutomationResponse<
        GinisUploadFileResponse,
        GinisUploadFileResponseInfo
      > = {
        status: 'success',
        info: { msg_id: 'id1', file_id: 'file1' },
        result: { upload_info: { Poradie: 10 } },
      }

      const spy = jest.spyOn(prismaMock.files, 'update')
      await service.consumeGinisFileUploaded(msg)
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisOrder: 10,
            ginisUploaded: true,
          },
        }),
      )
    })
  })

  describe('consumeEditSubmission', () => {
    it('should process failure', async () => {
      const msg: GinisAutomationResponse<
        Record<string, never>,
        GinisEditSubmissionResponseInfo
      > = { status: 'failure', info: { doc_id: 'doc1', actions: {} } }

      const spy = jest.spyOn(prismaMock.forms, 'update')
      await service.consumeEditSubmission(msg)
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            state: FormState.ERROR,
            error: FormError.GINIS_SEND_ERROR,
            ginisState: GinisState.ERROR_EDIT_SUBMISSION,
          },
        }),
      )
    })

    it('should process success', async () => {
      const msg: GinisAutomationResponse<
        Record<string, never>,
        GinisEditSubmissionResponseInfo
      > = {
        status: 'success',
        info: { doc_id: 'doc1', actions: {} },
        result: {},
      }
      const spy = jest.spyOn(prismaMock.forms, 'update')
      await service.consumeEditSubmission(msg)
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.SUBMISSION_EDITED,
            error: FormError.NONE,
          },
        }),
      )
    })
  })

  describe('consumeAssignSubmission', () => {
    it('should process failure', async () => {
      const msg: GinisAutomationResponse<
        Record<string, never>,
        GinisAssignSubmissionResponseInfo
      > = { status: 'failure', info: { doc_id: 'doc1', msg_id: 'id1' } }

      const spy = jest.spyOn(prismaMock.forms, 'update')
      await service.consumeAssignSubmission(msg)
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            state: FormState.ERROR,
            error: FormError.GINIS_SEND_ERROR,
            ginisState: GinisState.ERROR_ASSIGN_SUBMISSION,
          },
        }),
      )
    })

    it('should process success', async () => {
      const msg: GinisAutomationResponse<
        Record<string, never>,
        GinisAssignSubmissionResponseInfo
      > = {
        status: 'success',
        info: { doc_id: 'doc1', msg_id: 'id1' },
        result: {},
      }

      const spy = jest.spyOn(prismaMock.forms, 'update')
      await service.consumeAssignSubmission(msg)
      expect(spy).toHaveBeenCalledWith(
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
        .spyOn(service, 'registerToGinis')
        .mockResolvedValue()
      let result = await service.onQueueConsumption(messageBase)

      expect(result.requeue).toBeTruthy()
      expect(registerSpy).toHaveBeenCalled()
      jest.resetAllMocks()

      // should just requeue if register is still running
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_REGISTER,
      })
      result = await service.onQueueConsumption(messageBase)
      expect(registerSpy).not.toHaveBeenCalled()
      expect(result.requeue).toBeTruthy()
      jest.resetAllMocks()

      // should regiser again if there was error
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.ERROR_REGISTER,
      })
      result = await service.onQueueConsumption(messageBase)
      expect(registerSpy).toHaveBeenCalled()
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
      jest.resetAllMocks()

      // When one error - requeue but do not upload
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
        files: [
          {
            ginisUploadedError: true,
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
      jest.resetAllMocks()

      // When two errors, don't call upload just report error (TODO update behavior)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
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
      jest.resetAllMocks()

      // When one still uploading, second uploaded, don't call upload just report error (TODO update behavior)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
        files: [
          {
            ginisUploadedError: true,
            ginisUploaded: false,
          } as unknown as Files,
        ],
      } as FormWithFiles)
      result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeTruthy()
      expect(uploadSpy).not.toHaveBeenCalled()
      jest.resetAllMocks()

      // When no more files, change to Attachments uploaded
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
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

    it('should edit submission if all files are uploaded', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.ATTACHMENTS_UPLOADED,
      })
      const editSpy = jest.spyOn(service, 'editSubmission').mockResolvedValue()

      let result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeFalsy() // there is no ginisDocumentId
      expect(editSpy).not.toHaveBeenCalled()

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisDocumentId: 'ginis1',
        ginisState: GinisState.ATTACHMENTS_UPLOADED,
      })

      result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeTruthy()
      expect(editSpy).toHaveBeenCalled()
      jest.resetAllMocks()

      // The same should happen if the state is ERROR EDIT SUBMISSION
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.ERROR_EDIT_SUBMISSION,
      })

      result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeFalsy() // there is no ginisDocumentId
      expect(editSpy).not.toHaveBeenCalled()

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisDocumentId: 'ginis1',
        ginisState: GinisState.ERROR_EDIT_SUBMISSION,
      })

      result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeTruthy()
      expect(editSpy).toHaveBeenCalled()
    })

    it('should assign submission after edit', async () => {
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
        ginisAssignment: {
          ginisOrganizationName: 'orgName',
          ginisPersonName: 'personName',
        },
      })
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.SUBMISSION_EDITED,
      })
      const assignSpy = jest
        .spyOn(service, 'assignSubmission')
        .mockResolvedValue()

      let result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeTruthy() // there is no ginisDocumentId
      expect(assignSpy).not.toHaveBeenCalled()

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisDocumentId: 'docId',
        ginisState: GinisState.SUBMISSION_EDITED,
      } as FormWithFiles)
      result = await service.onQueueConsumption(messageBase)
      expect(result.requeue).toBeTruthy()
      expect(assignSpy).toHaveBeenCalledWith('docId', 'orgName', 'personName')
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

      jest.resetAllMocks()
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
          tableName: 'test',
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

      jest.resetAllMocks()
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.SlovenskoSkGeneric,
        pospID: 'pospIdValue',
        sharepointData: {
          databaseName: 'test',
          tableName: 'test',
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
    it('should update file to RUNNING_REGISTER', async () => {
      await service.registerToGinis('formId1', 'pospId1')
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.RUNNING_REGISTER,
          },
        }),
      )
    })
  })

  describe('uploadAttachments', () => {
    const formMock = {
      files: [{} as File, {} as File],
    } as unknown as FormWithFiles

    it('should update file to RUNNING_UPLOAD_ATTACHMENTS', async () => {
      await service.uploadAttachments(formMock, 'mockPospID')
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
          },
        }),
      )
    })
  })

  describe('editSubmission', () => {
    it('should update file to RUNNING_EDIT_SUBMISSION', async () => {
      await service.editSubmission('docId', 'newSubj')
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.RUNNING_EDIT_SUBMISSION,
          },
        }),
      )
    })
  })

  describe('assignSubmission', () => {
    it('should update file to RUNNING_ASSIGN_SUBMISSION', async () => {
      await service.assignSubmission('docId', 'orgId', 'person')
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.RUNNING_ASSIGN_SUBMISSION,
          },
        }),
      )
    })
  })
})
/* eslint-enable pii/no-email */
