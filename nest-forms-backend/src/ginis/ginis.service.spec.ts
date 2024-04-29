import { randomUUID } from 'node:crypto'

import { Test, TestingModule } from '@nestjs/testing'
import {
  Files,
  FormError,
  FormState,
  GinisState,
  SchemaVersion,
} from '@prisma/client'
import amqp from 'amqplib/callback_api'

import prismaMock from '../../test/singleton'
import PrismaService from '../prisma/prisma.service'
import MailgunService from '../utils/global-services/mailgun/mailgun.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { FormWithSchemaVersionAndFiles } from '../utils/types/prisma'
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

jest.mock('amqplib/callback_api')
jest.mock('./subservices/ginis.helper')
jest.mock('../utils/global-services/mailgun/mailgun.service')
jest.mock('../utils/handlers/text.handler')
jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}))

/* eslint-disable @typescript-eslint/no-unused-vars */
const getChannelImplementation = (
  message: amqp.Message | null,
  error2 = false,
): amqp.Channel =>
  ({
    assertQueue: jest
      .fn()
      .mockImplementation(
        (
          queue?: string,
          options?: amqp.Options.AssertQueue,
          callback?: (err: boolean, ok: amqp.Replies.AssertQueue) => void,
        ) => {
          if (callback) callback(error2, {} as amqp.Replies.AssertQueue)
        },
      ),
    consume: jest
      .fn()
      .mockImplementation(
        (
          queue: string,
          onMessage: (msg: amqp.Message | null) => void,
          options?: amqp.Options.Consume,
          callback?: (err: any, ok: amqp.Replies.Consume) => void,
        ) => {
          if (onMessage) onMessage(message)
        },
      ),
    sendToQueue: jest.fn(),
  }) as unknown as amqp.Channel

const getConnectionImplementation = (
  message: amqp.Message | null,
  error1 = false,
  error2 = false,
): amqp.Connection =>
  ({
    createChannel: jest
      .fn()
      .mockImplementation(
        (callback2: (err: boolean, channel: amqp.Channel) => void) => {
          callback2(error1, getChannelImplementation(message, error2))
        },
      ),
    close: jest.fn(),
  }) as unknown as amqp.Connection

const getAmqpImplementation = (
  message: amqp.Message | null,
  error0 = false,
  error1 = false,
  error2 = false,
): jest.Mock =>
  jest
    .fn()
    .mockImplementation(
      (
        url: string | amqp.Options.Connect,
        callback: (err: boolean, connection: amqp.Connection) => void,
      ): void => {
        callback(error0, getConnectionImplementation(message, error1, error2))
      },
    )

const createAmqpMessage = (msg: object): amqp.Message => ({
  content: Buffer.from(JSON.stringify(msg)),
  fields: {} as amqp.MessageFields,
  properties: {} as amqp.MessageProperties,
})

const createAmqpConsumeMessage = (msg: object): amqp.ConsumeMessage => ({
  content: Buffer.from(JSON.stringify(msg)),
  fields: {} as amqp.ConsumeMessageFields,
  properties: {} as amqp.MessageProperties,
})

/* eslint-enable @typescript-eslint/no-unused-vars */

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
      RABBIT_MQ_GINIS_USERNAME: 'test',
      RABBIT_MQ_GINIS_PASSWORD: 'test',
      RABBIT_MQ_GINIS_HOST: 'test',
      RABBIT_MQ_GINIS_PORT: 'test',
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
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<GinisService>(GinisService)

    Object.defineProperty(service, 'logger', {
      value: { error: jest.fn(), debug: jest.fn() },
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
      const msgAmqp: amqp.Message = createAmqpMessage(msg)

      const spy = jest.spyOn(prismaMock.forms, 'update')
      await service.consumeRegisterGinisMessage(msgAmqp)
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
      const msgAmqp: amqp.Message = createAmqpMessage(msg)

      const spy = jest.spyOn(prismaMock.forms, 'update')
      await service.consumeRegisterGinisMessage(msgAmqp)
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
      const msgAmqp: amqp.Message = createAmqpMessage(msg)

      const spy = jest.spyOn(prismaMock.files, 'update')
      await service.consumeGinisFileUploaded(msgAmqp)
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
      const msgAmqp: amqp.Message = createAmqpMessage(msg)

      const spy = jest.spyOn(prismaMock.files, 'update')
      await service.consumeGinisFileUploaded(msgAmqp)
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
      const msgAmqp: amqp.Message = createAmqpMessage(msg)

      const spy = jest.spyOn(prismaMock.forms, 'update')
      await service.consumeEditSubmission(msgAmqp)
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
      const msgAmqp: amqp.Message = createAmqpMessage(msg)

      const spy = jest.spyOn(prismaMock.forms, 'update')
      await service.consumeEditSubmission(msgAmqp)
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
      const msgAmqp: amqp.Message = createAmqpMessage(msg)

      const spy = jest.spyOn(prismaMock.forms, 'update')
      await service.consumeAssignSubmission(msgAmqp)
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
      const msgAmqp: amqp.Message = createAmqpMessage(msg)

      const spy = jest.spyOn(prismaMock.forms, 'update')
      await service.consumeAssignSubmission(msgAmqp)
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

    const formBase: FormWithSchemaVersionAndFiles = {
      schemaVersion: { pospID: 'pospId' } as SchemaVersion,
      files: [] as Files[],
      id: 'id1',
      ginisState: GinisState.CREATED,
      state: FormState.DELIVERED_NASES,
    } as FormWithSchemaVersionAndFiles

    it('should error when form does not exist', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(null)
      const result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )

      const spy = jest.spyOn(service['ginisHelper'], 'setFormToError')
      expect(result.requeue).toBeFalsy()
      expect(spy).toHaveBeenCalled()
    })

    it('should error when form has no pospId', async () => {
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        schemaVersion: {},
      } as FormWithSchemaVersionAndFiles)
      await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )

      const spy = jest.spyOn(service['ginisHelper'], 'setFormToError')
      // Do not check for requeue - this just logs the error
      expect(spy).toHaveBeenCalled()
    })

    it('should run register if not yet registered', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(formBase)

      const registerSpy = jest
        .spyOn(service, 'registerToGinis')
        .mockResolvedValue()
      let result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )

      expect(result.requeue).toBeTruthy()
      expect(registerSpy).toHaveBeenCalled()
      jest.resetAllMocks()

      // should just requeue if register is still running
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_REGISTER,
      })
      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(registerSpy).not.toHaveBeenCalled()
      expect(result.requeue).toBeTruthy()
      jest.resetAllMocks()

      // should regiser again if there was error
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.ERROR_REGISTER,
      })
      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(registerSpy).toHaveBeenCalled()
      expect(result.requeue).toBeTruthy()
    })

    it('should upload files', async () => {
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
      } as FormWithSchemaVersionAndFiles)
      const uploadSpy = jest
        .spyOn(service, 'uploadAttachments')
        .mockResolvedValue()

      // When upload for first time - just upload
      let result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(result.requeue).toBeTruthy()
      expect(uploadSpy).toHaveBeenCalled()
      jest.resetAllMocks()

      // When one error - requeue but do not upload
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
      } as FormWithSchemaVersionAndFiles)
      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(result.requeue).toBeTruthy()
      expect(uploadSpy).not.toHaveBeenCalled()
      jest.resetAllMocks()

      // When two errors, don't call upload just report error (TODO update behavior)
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
      } as FormWithSchemaVersionAndFiles)
      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(result.requeue).toBeTruthy()
      expect(uploadSpy).not.toHaveBeenCalled()
      jest.resetAllMocks()

      // When one still uploading, second uploaded, don't call upload just report error (TODO update behavior)
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
        files: [
          {
            ginisUploadedError: true,
            ginisUploaded: false,
          } as unknown as Files,
        ],
      } as FormWithSchemaVersionAndFiles)
      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(result.requeue).toBeTruthy()
      expect(uploadSpy).not.toHaveBeenCalled()
      jest.resetAllMocks()

      // When no more files, change to Attachments uploaded
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
        files: [],
      } as FormWithSchemaVersionAndFiles)
      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
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
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.REGISTERED,
      })

      const uploadSpy = jest
        .spyOn(service, 'uploadAttachments')
        .mockResolvedValue()
      const result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )

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
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.ATTACHMENTS_UPLOADED,
      })
      const editSpy = jest.spyOn(service, 'editSubmission').mockResolvedValue()

      let result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(result.requeue).toBeFalsy() // there is no ginisDocumentId
      expect(editSpy).not.toHaveBeenCalled()

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisDocumentId: 'ginis1',
        ginisState: GinisState.ATTACHMENTS_UPLOADED,
      })

      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(result.requeue).toBeTruthy()
      expect(editSpy).toHaveBeenCalled()
      jest.resetAllMocks()

      // The same should happen if the state is ERROR EDIT SUBMISSION
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.ERROR_EDIT_SUBMISSION,
      })

      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(result.requeue).toBeFalsy() // there is no ginisDocumentId
      expect(editSpy).not.toHaveBeenCalled()

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisDocumentId: 'ginis1',
        ginisState: GinisState.ERROR_EDIT_SUBMISSION,
      })

      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(result.requeue).toBeTruthy()
      expect(editSpy).toHaveBeenCalled()
    })

    it('should assign submission after edit', async () => {
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.SUBMISSION_EDITED,
      })
      const assignSpy = jest
        .spyOn(service, 'assignSubmission')
        .mockResolvedValue()

      let result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(result.requeue).toBeTruthy() // there is no ginisDocumentId
      expect(assignSpy).not.toHaveBeenCalled()

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisDocumentId: 'docId',
        ginisState: GinisState.SUBMISSION_EDITED,
      })
      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(result.requeue).toBeTruthy() // there is no ginisOrganizationName
      expect(assignSpy).not.toHaveBeenCalled()

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisDocumentId: 'docId',
        schemaVersion: {
          ...formBase.schemaVersion,
          ginisOrganizationName: 'orgName',
        } as SchemaVersion,
        ginisState: GinisState.SUBMISSION_EDITED,
      } as FormWithSchemaVersionAndFiles)
      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(result.requeue).toBeTruthy() // there is no ginisPersonName
      expect(assignSpy).not.toHaveBeenCalled()

      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisDocumentId: 'docId',
        schemaVersion: {
          ...formBase.schemaVersion,
          ginisOrganizationName: 'orgName',
          ginisPersonName: 'personName',
        } as SchemaVersion,
        ginisState: GinisState.SUBMISSION_EDITED,
      } as FormWithSchemaVersionAndFiles)
      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
      expect(result.requeue).toBeTruthy()
      expect(assignSpy).toHaveBeenCalledWith('docId', 'orgName', 'personName')
    })

    it('should mark as ready for processing', async () => {
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.SUBMISSION_ASSIGNED,
        schemaVersion: {
          ...formBase.schemaVersion,
          schema: {
            slug: 'slug',
          },
        },
      } as FormWithSchemaVersionAndFiles)

      const sendMailSpy = jest
        .spyOn(service['mailgunService'], 'sendEmail')
        .mockResolvedValue()

      let result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage({
          ...messageBase,
          userData: {
            firstName: 'first',
          },
        }),
      )
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

      jest.resetAllMocks()
      prismaMock.forms.findUnique.mockResolvedValue({
        ...formBase,
        ginisState: GinisState.SUBMISSION_ASSIGNED,
        schemaVersion: {
          ...formBase.schemaVersion,
          schema: {
            slug: 'slug',
          },
        },
      } as FormWithSchemaVersionAndFiles)
      result = await service.onQueueConsumption(
        null,
        createAmqpConsumeMessage(messageBase),
      )
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

    it('should log error', async () => {
      const errorLogSpy = jest.spyOn(service['logger'], 'error')

      amqp.connect = getAmqpImplementation(null, true)
      await service.registerToGinis('formId1', 'pospId1')
      expect(errorLogSpy).toHaveBeenCalled()
      jest.clearAllMocks()

      amqp.connect = getAmqpImplementation(null, false, true)
      await service.registerToGinis('formId1', 'pospId1')
      expect(errorLogSpy).toHaveBeenCalled()
      jest.clearAllMocks()

      amqp.connect = getAmqpImplementation(null, false, false, true)
      await service.registerToGinis('formId1', 'pospId1')
      expect(errorLogSpy).toHaveBeenCalled()
    })

    it('should consume if the correlation id matches', async () => {
      const consumeSpy = jest
        .spyOn(service, 'consumeRegisterGinisMessage')
        .mockResolvedValue()
      amqp.connect = getAmqpImplementation(
        {
          properties: { correlationId: 'fake-fake-fake-fake-fake' },
        } as amqp.Message,
        false,
        false,
        false,
      )
      await service.registerToGinis('form1', 'posp1')
      expect(consumeSpy).not.toHaveBeenCalled()

      amqp.connect = getAmqpImplementation(
        {
          properties: { correlationId: 'mock-mock-mock-mock-mock' },
        } as amqp.Message,
        false,
        false,
        false,
      )
      await service.registerToGinis('form1', 'posp1')
      expect(consumeSpy).toHaveBeenCalled()
    })

    it('should log error if consumer throws one', async () => {
      const errorLogSpy = jest.spyOn(service['logger'], 'error')
      expect(errorLogSpy).not.toHaveBeenCalled()

      jest
        .spyOn(service, 'consumeRegisterGinisMessage')
        .mockRejectedValue(new Error('Test'))
      amqp.connect = getAmqpImplementation(
        {
          properties: { correlationId: 'mock-mock-mock-mock-mock' },
        } as amqp.Message,
        false,
        false,
        false,
      )
      await service.registerToGinis('form1', 'posp1')
      expect(errorLogSpy).toHaveBeenCalled()
    })
  })

  describe('uploadAttachments', () => {
    const formMock = {
      schemaVersion: {},
      files: [{} as File, {} as File],
    } as unknown as FormWithSchemaVersionAndFiles

    it('should update file to RUNNING_UPLOAD_ATTACHMENTS', async () => {
      await service.uploadAttachments(formMock)
      expect(prismaMock.forms['update']).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
          },
        }),
      )
    })

    it('should log error for each error file', async () => {
      const errorLogSpy = jest.spyOn(service['logger'], 'error')

      amqp.connect = getAmqpImplementation(null, true)
      await service.uploadAttachments(formMock)
      expect(errorLogSpy).toHaveBeenCalledTimes(2)
      jest.clearAllMocks()

      amqp.connect = getAmqpImplementation(null, false, true)
      await service.uploadAttachments(formMock)
      expect(errorLogSpy).toHaveBeenCalledTimes(2)
      jest.clearAllMocks()

      amqp.connect = getAmqpImplementation(null, false, false, true)
      await service.uploadAttachments(formMock)
      expect(errorLogSpy).toHaveBeenCalledTimes(2)
    })

    it('should consume if the correlation id matches for each file', async () => {
      const consumeSpy = jest
        .spyOn(service, 'consumeGinisFileUploaded')
        .mockResolvedValue()
      amqp.connect = getAmqpImplementation(
        {
          properties: { correlationId: 'fake-fake-fake-fake-fake' },
        } as amqp.Message,
        false,
        false,
        false,
      )
      await service.uploadAttachments(formMock)
      expect(consumeSpy).not.toHaveBeenCalled()

      amqp.connect = getAmqpImplementation(
        {
          properties: { correlationId: 'mock-mock-mock-mock-mock' },
        } as amqp.Message,
        false,
        false,
        false,
      )
      await service.uploadAttachments(formMock)
      expect(consumeSpy).toHaveBeenCalled()
    })

    it('should log error if consumer throws one', async () => {
      const errorLogSpy = jest.spyOn(service['logger'], 'error')
      expect(errorLogSpy).not.toHaveBeenCalled()

      jest
        .spyOn(service, 'consumeGinisFileUploaded')
        .mockRejectedValue(new Error('Test'))
      amqp.connect = getAmqpImplementation(
        {
          properties: { correlationId: 'mock-mock-mock-mock-mock' },
        } as amqp.Message,
        false,
        false,
        false,
      )
      await service.uploadAttachments(formMock)
      expect(errorLogSpy).toHaveBeenCalled()
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

    it('should log error for each error file', async () => {
      const errorLogSpy = jest.spyOn(service['logger'], 'error')

      amqp.connect = getAmqpImplementation(null, true)
      await service.editSubmission('docId', 'newSubj')
      expect(errorLogSpy).toHaveBeenCalled()
      jest.clearAllMocks()

      amqp.connect = getAmqpImplementation(null, false, true)
      await service.editSubmission('docId', 'newSubj')
      expect(errorLogSpy).toHaveBeenCalled()
      jest.clearAllMocks()

      amqp.connect = getAmqpImplementation(null, false, false, true)
      await service.editSubmission('docId', 'newSubj')
      expect(errorLogSpy).toHaveBeenCalled()
    })

    it('should consume if the correlation id matches for each file', async () => {
      const consumeSpy = jest
        .spyOn(service, 'consumeEditSubmission')
        .mockResolvedValue()
      amqp.connect = getAmqpImplementation(
        {
          properties: { correlationId: 'fake-fake-fake-fake-fake' },
        } as amqp.Message,
        false,
        false,
        false,
      )
      await service.editSubmission('docId', 'newSubj')
      expect(consumeSpy).not.toHaveBeenCalled()

      amqp.connect = getAmqpImplementation(
        {
          properties: { correlationId: 'mock-mock-mock-mock-mock' },
        } as amqp.Message,
        false,
        false,
        false,
      )
      await service.editSubmission('docId', 'newSubj')
      expect(consumeSpy).toHaveBeenCalled()
    })

    it('should log error if consumer throws one', async () => {
      const errorLogSpy = jest.spyOn(service['logger'], 'error')
      expect(errorLogSpy).not.toHaveBeenCalled()

      jest
        .spyOn(service, 'consumeEditSubmission')
        .mockRejectedValue(new Error('Test'))
      amqp.connect = getAmqpImplementation(
        {
          properties: { correlationId: 'mock-mock-mock-mock-mock' },
        } as amqp.Message,
        false,
        false,
        false,
      )
      await service.editSubmission('docId', 'newSubj')
      expect(errorLogSpy).toHaveBeenCalled()
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

    it('should log error for each error file', async () => {
      const errorLogSpy = jest.spyOn(service['logger'], 'error')

      amqp.connect = getAmqpImplementation(null, true)
      await service.assignSubmission('docId', 'orgId', 'person')
      expect(errorLogSpy).toHaveBeenCalled()
      jest.clearAllMocks()

      amqp.connect = getAmqpImplementation(null, false, true)
      await service.assignSubmission('docId', 'orgId', 'person')
      expect(errorLogSpy).toHaveBeenCalled()
      jest.clearAllMocks()

      amqp.connect = getAmqpImplementation(null, false, false, true)
      await service.assignSubmission('docId', 'orgId', 'person')
      expect(errorLogSpy).toHaveBeenCalled()
    })

    it('should consume if the correlation id matches for each file', async () => {
      const consumeSpy = jest
        .spyOn(service, 'consumeAssignSubmission')
        .mockResolvedValue()
      amqp.connect = getAmqpImplementation(
        {
          properties: { correlationId: 'fake-fake-fake-fake-fake' },
        } as amqp.Message,
        false,
        false,
        false,
      )
      await service.assignSubmission('docId', 'orgId', 'person')
      expect(consumeSpy).not.toHaveBeenCalled()

      amqp.connect = getAmqpImplementation(
        {
          properties: { correlationId: 'mock-mock-mock-mock-mock' },
        } as amqp.Message,
        false,
        false,
        false,
      )
      await service.assignSubmission('docId', 'orgId', 'person')
      expect(consumeSpy).toHaveBeenCalled()
    })

    it('should log error if consumer throws one', async () => {
      const errorLogSpy = jest.spyOn(service['logger'], 'error')
      expect(errorLogSpy).not.toHaveBeenCalled()

      jest
        .spyOn(service, 'consumeAssignSubmission')
        .mockRejectedValue(new Error('Test'))
      amqp.connect = getAmqpImplementation(
        {
          properties: { correlationId: 'mock-mock-mock-mock-mock' },
        } as amqp.Message,
        false,
        false,
        false,
      )
      await service.assignSubmission('docId', 'orgId', 'person')
      expect(errorLogSpy).toHaveBeenCalled()
    })
  })
})
