/* eslint-disable pii/no-email */
import { Nack } from '@golevelup/nestjs-rabbitmq'
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'
import {
  FormDefinitionSlovenskoSk,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import FormsService from '../forms/forms.service'
import NasesService from '../nases/nases.service'
import {
  SendMessageNasesSender,
  SendMessageNasesSenderType,
} from '../nases/types/send-message-nases-sender.type'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import MailgunService from '../utils/global-services/mailer/mailgun.service'
import rabbitmqRequeueDelay from '../utils/handlers/rabbitmq.handlers'
import { FormWithFiles } from '../utils/types/prisma'
import NasesConsumerService from './nases-consumer.service'
import EmailFormsSubservice from './subservices/email-forms.subservice'
import WebhookSubservice from './subservices/webhook.subservice'

jest.mock('forms-shared/definitions/getFormDefinitionBySlug')

describe('NasesConsumerService', () => {
  let service: NasesConsumerService
  let formsService: FormsService
  let nasesService: NasesService

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
      providers: [
        NasesConsumerService,
        {
          provide: NasesUtilsService,
          useValue: createMock<NasesUtilsService>(),
        },
        {
          provide: RabbitmqClientService,
          useValue: createMock<RabbitmqClientService>(),
        },
        { provide: FormsService, useValue: createMock<FormsService>() },
        { provide: MailgunService, useValue: createMock<MailgunService>() },
        {
          provide: EmailFormsSubservice,
          useValue: createMock<EmailFormsSubservice>(),
        },
        {
          provide: WebhookSubservice,
          useValue: createMock<WebhookSubservice>(),
        },
        { provide: PrismaService, useValue: createMock<PrismaService>() },
        { provide: NasesService, useValue: createMock<NasesService>() },
      ],
    }).compile()

    service = app.get<NasesConsumerService>(NasesConsumerService)
    formsService = app.get<FormsService>(FormsService)
    nasesService = app.get<NasesService>(NasesService)
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
  })

  describe('should be defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
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

  describe('onQueueConsumption', () => {
    const mockRabbitPayloadDto = {
      formId: 'test-form-id',
      tries: 1,
      userData: {
        email: 'test@example.com',
        firstName: 'Test',
      },
    }

    const mockFormDefinition = {
      type: FormDefinitionType.SlovenskoSkGeneric,
      schema: {},
    } as FormDefinitionSlovenskoSk

    const mockSender: SendMessageNasesSender = {
      type: SendMessageNasesSenderType.Self,
    }

    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('should return Nack(false) when form is not found', async () => {
      jest.spyOn(formsService, 'getUniqueForm').mockResolvedValue(null)

      const result = await service.onQueueConsumption(mockRabbitPayloadDto)

      expect(result).toEqual(new Nack(false))
      expect(service['logger'].error).toHaveBeenCalled()
    })

    it('should return Nack(false) when form is archived', async () => {
      jest
        .spyOn(formsService, 'getUniqueForm')
        .mockResolvedValue({ archived: true } as Forms)

      const result = await service.onQueueConsumption(mockRabbitPayloadDto)

      expect(result).toEqual(new Nack(false))
      expect(service['logger'].error).toHaveBeenCalled()
    })

    it('should return Nack(false) when form definition is not found', async () => {
      jest
        .spyOn(formsService, 'getUniqueForm')
        .mockResolvedValue({ formDefinitionSlug: 'test-slug' } as Forms)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(null)

      const result = await service.onQueueConsumption(mockRabbitPayloadDto)

      expect(result).toEqual(new Nack(false))
      expect(service['logger'].error).toHaveBeenCalled()
    })

    it('should handle email form when form definition type is Email', async () => {
      const mockForm = { formDefinitionSlug: 'test-slug' } as Forms
      jest.spyOn(formsService, 'getUniqueForm').mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.Email,
      })
      jest
        .spyOn(service as any, 'handleEmailForm')
        .mockResolvedValue(new Nack(false))
      const sendToNasesAndUpdateStateSpy = jest
        .spyOn(nasesService, 'sendToNasesAndUpdateState')
        .mockResolvedValue(true)

      const result = await service.onQueueConsumption(mockRabbitPayloadDto)

      expect(result).toEqual(new Nack(false))
      expect(service['handleEmailForm']).toHaveBeenCalledWith(
        mockForm,
        'test@example.com',
        'Test',
      )
      expect(sendToNasesAndUpdateStateSpy).not.toHaveBeenCalled()
    })

    it('should handle webhook form when form definition type is Webhook', async () => {
      const mockForm = { formDefinitionSlug: 'test-slug' } as Forms
      jest.spyOn(formsService, 'getUniqueForm').mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.Webhook,
      })
      jest
        .spyOn(service as any, 'handleWebhookForm')
        .mockResolvedValue(new Nack(false))
      const sendToNasesAndUpdateStateSpy = jest
        .spyOn(nasesService, 'sendToNasesAndUpdateState')
        .mockResolvedValue(true)

      const result = await service.onQueueConsumption(mockRabbitPayloadDto)

      expect(result).toEqual(new Nack(false))
      expect(service['handleWebhookForm']).toHaveBeenCalledWith(mockForm)
      expect(sendToNasesAndUpdateStateSpy).not.toHaveBeenCalled()
    })

    it('should send to NASES and update state when all checks pass', async () => {
      const mockForm = {
        formDefinitionSlug: 'test-slug',
        id: 'test-id',
      } as Forms
      jest.spyOn(formsService, 'getUniqueForm').mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      jest
        .spyOn(service['nasesUtilsService'], 'createTechnicalAccountJwtToken')
        .mockReturnValue('mock-jwt')
      jest
        .spyOn(nasesService, 'sendToNasesAndUpdateState')
        .mockResolvedValue(true)

      const result = await service.onQueueConsumption(mockRabbitPayloadDto)

      expect(result).toEqual(new Nack(false))
      expect(nasesService.sendToNasesAndUpdateState).toHaveBeenCalledWith(
        'mock-jwt',
        mockForm,
        mockRabbitPayloadDto,
        mockFormDefinition,
        mockSender,
      )
      expect(service['mailgunService'].sendEmail).toHaveBeenCalled()
    })

    it('should queue delayed form when send to NASES fails and tries <= 1', async () => {
      const mockForm = {
        formDefinitionSlug: 'test-slug',
        id: 'test-id',
      } as Forms
      jest.spyOn(formsService, 'getUniqueForm').mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      jest
        .spyOn(service['nasesUtilsService'], 'createTechnicalAccountJwtToken')
        .mockReturnValue('mock-jwt')
      jest
        .spyOn(nasesService, 'sendToNasesAndUpdateState')
        .mockResolvedValue(false)
      jest.spyOn(service as any, 'queueDelayedForm').mockResolvedValue(null)

      const result = await service.onQueueConsumption(mockRabbitPayloadDto)

      expect(result).toEqual(new Nack(false))
      expect(service['queueDelayedForm']).toHaveBeenCalledWith(
        mockRabbitPayloadDto.formId,
        mockRabbitPayloadDto.tries,
        FormError.NASES_SEND_ERROR,
        mockRabbitPayloadDto.userData,
        FormState.QUEUED,
      )
    })

    it('should requeue with delay when send to NASES fails and tries > 1', async () => {
      const mockPayload = { ...mockRabbitPayloadDto, tries: 2 }
      const mockForm = {
        formDefinitionSlug: 'test-slug',
        id: 'test-id',
      } as Forms
      jest.spyOn(formsService, 'getUniqueForm').mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      jest
        .spyOn(service['nasesUtilsService'], 'createTechnicalAccountJwtToken')
        .mockReturnValue('mock-jwt')
      jest
        .spyOn(nasesService, 'sendToNasesAndUpdateState')
        .mockResolvedValue(false)
      jest.spyOn(service, 'nackTrueWithWait').mockResolvedValue(new Nack(true))

      const result = await service.onQueueConsumption(mockPayload)

      expect(result).toEqual(new Nack(true))
      expect(service.nackTrueWithWait).toHaveBeenCalledWith(60_000)
    })
  })

  describe('handleEmailForm', () => {
    it('should send email and return Nack(false) when successful', async () => {
      const mockForm = { id: 'test-id' } as Forms
      jest
        .spyOn(service['emailFormsSubservice'], 'sendEmailForm')
        .mockResolvedValue()

      const result = await service['handleEmailForm'](mockForm, null, null)

      expect(result).toEqual(new Nack(false))
    })

    it('should handle error when sending email fails', async () => {
      const mockForm = { id: 'test-id' } as Forms
      jest
        .spyOn(service['emailFormsSubservice'], 'sendEmailForm')
        .mockRejectedValue(new Error('Failed to send email'))
      jest.spyOn(service, 'nackTrueWithWait').mockResolvedValue(new Nack(true))

      const result = await service['handleEmailForm'](mockForm, null, null)

      expect(result).toEqual(new Nack(true))
      expect(service['logger'].error).toHaveBeenCalled()
      expect(service.nackTrueWithWait).toHaveBeenCalled()
    })
  })

  describe('handleWebhookForm', () => {
    it('should send webhook and return Nack(false) when successful', async () => {
      const mockForm = { id: 'test-id' } as Forms
      jest
        .spyOn(service['webhookSubservice'], 'sendWebhook')
        .mockResolvedValue()

      const result = await service['handleWebhookForm'](mockForm)

      expect(result).toEqual(new Nack(false))
    })

    it('should handle error when sending webhook fails', async () => {
      const mockForm = { id: 'test-id' } as Forms
      jest
        .spyOn(service['webhookSubservice'], 'sendWebhook')
        .mockRejectedValue(new Error('Failed to send webhook'))
      jest.spyOn(service, 'nackTrueWithWait').mockResolvedValue(new Nack(true))

      const result = await service['handleWebhookForm'](mockForm)

      expect(result).toEqual(new Nack(true))
      expect(service.nackTrueWithWait).toHaveBeenCalled()
    })
  })
})
/* eslint-enable pii/no-email */
