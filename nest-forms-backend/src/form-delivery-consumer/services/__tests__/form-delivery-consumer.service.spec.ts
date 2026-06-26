import { Nack } from '@golevelup/nestjs-rabbitmq'
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'
import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'
import {
  FormDefinitionSlovenskoSk,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import * as formDataExtractors from 'forms-shared/form-utils/formDataExtractors'

import { createTestForm } from '../../../__tests__/factories/form.factory'
import ConvertPdfService from '../../../convert-pdf/convert-pdf.service'
import FormsService from '../../../forms/forms.service'
import GinisService from '../../../ginis/ginis.service'
import MailgunService from '../../../mailer/mailgun.service'
import PrismaService from '../../../prisma/prisma.service'
import RabbitmqClientService from '../../../rabbitmq-client/rabbitmq-client.service'
import ThrowerErrorGuard from '../../../utils/guards/thrower-error.guard'
import rabbitmqRequeueDelay from '../../../utils/handlers/rabbitmq.handlers'
import { FormWithFiles } from '../../../utils/types/prisma'
import EmailFormsService from '../email-forms.service'
import FormDeliveryConsumerService from '../form-delivery-consumer.service'
import WebhookService from '../webhook.service'

jest.mock('forms-shared/definitions/getFormDefinitionBySlug')
jest.mock('forms-shared/form-utils/formDataExtractors')

describe('FormDeliveryConsumerService', () => {
  let service: FormDeliveryConsumerService
  let formsService: FormsService
  let ginisService: GinisService

  beforeEach(async () => {
    jest.resetAllMocks()

    // TODO refactor to use imports
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        FormDeliveryConsumerService,
        {
          provide: RabbitmqClientService,
          useValue: createMock<RabbitmqClientService>(),
        },
        { provide: FormsService, useValue: createMock<FormsService>() },
        { provide: MailgunService, useValue: createMock<MailgunService>() },
        {
          provide: EmailFormsService,
          useValue: createMock<EmailFormsService>(),
        },
        {
          provide: WebhookService,
          useValue: createMock<WebhookService>(),
        },
        { provide: PrismaService, useValue: createMock<PrismaService>() },
        { provide: GinisService, useValue: createMock<GinisService>() },
        {
          provide: ConvertPdfService,
          useValue: createMock<ConvertPdfService>(),
        },
        {
          provide: ThrowerErrorGuard,
          useValue: createMock<ThrowerErrorGuard>(),
        },
      ],
    }).compile()

    service = app.get<FormDeliveryConsumerService>(FormDeliveryConsumerService)
    formsService = app.get<FormsService>(FormsService)
    ginisService = app.get<GinisService>(GinisService)
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
      const mockForm = createTestForm({
        formDefinitionSlug: 'test-slug',
        id: 'test-form-id',
      })
      jest.spyOn(formsService, 'getUniqueForm').mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.Email,
      })
      const createDocumentSpy = jest
        .spyOn(ginisService, 'createDocument')
        .mockResolvedValue()

      const result = await service.onQueueConsumption(mockRabbitPayloadDto)

      expect(result).toEqual(new Nack(false))
      expect(service['emailFormsService'].sendEmailForm).toHaveBeenCalledWith(
        mockForm.id,
        mockRabbitPayloadDto.userData.email,
        mockRabbitPayloadDto.userData.firstName,
      )
      expect(createDocumentSpy).not.toHaveBeenCalled()
    })

    it('should handle webhook form when form definition type is Webhook', async () => {
      const mockForm = createTestForm({
        formDefinitionSlug: 'test-slug',
        id: 'test-form-id',
      })
      jest.spyOn(formsService, 'getUniqueForm').mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue({
        type: FormDefinitionType.Webhook,
      })
      const createDocumentSpy = jest
        .spyOn(ginisService, 'createDocument')
        .mockResolvedValue()

      const result = await service.onQueueConsumption(mockRabbitPayloadDto)

      expect(result).toEqual(new Nack(false))
      expect(service['webhookService'].sendWebhook).toHaveBeenCalledWith(
        mockForm.id,
      )
      expect(createDocumentSpy).not.toHaveBeenCalled()
    })

    it('should send to Ginis and update state when all checks pass', async () => {
      const mockForm = createTestForm({
        formDefinitionSlug: 'test-slug',
        id: 'test-id',
      })
      jest.spyOn(formsService, 'getUniqueForm').mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      jest.spyOn(ginisService, 'createDocument').mockResolvedValue()
      ;(
        formDataExtractors.extractFormSubjectPlain as jest.Mock
      ).mockReturnValue('mock-subject')

      const result = await service.onQueueConsumption(mockRabbitPayloadDto)

      expect(result).toEqual(new Nack(false))
      expect(ginisService.createDocument).toHaveBeenCalledWith(
        mockForm,
        mockFormDefinition,
      )
      expect(service['mailgunService'].sendEmail).toHaveBeenCalledWith({
        data: {
          to: mockRabbitPayloadDto.userData.email,
          template: MailgunTemplateEnum.GINIS_SENT,
          data: {
            formId: mockForm.id,
            messageSubject: 'mock-subject',
            firstName: mockRabbitPayloadDto.userData.firstName,
            slug: mockForm.formDefinitionSlug,
            formSentAt: mockForm.formSentAt,
          },
        },
      })
    })

    it('should queue delayed form when send to Ginis fails and tries <= 2', async () => {
      const mockForm = createTestForm({
        formDefinitionSlug: 'test-slug',
        id: 'test-id',
      })
      jest.spyOn(formsService, 'getUniqueForm').mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      jest
        .spyOn(ginisService, 'createDocument')
        .mockRejectedValue(new Error('Ginis error'))

      const result = await service.onQueueConsumption(mockRabbitPayloadDto)

      expect(result).toEqual(new Nack(false))
      expect(service['formsService'].updateForm).toHaveBeenCalledWith(
        mockRabbitPayloadDto.formId,
        { state: FormState.QUEUED, error: FormError.GINIS_SEND_ERROR },
      )

      const expectedTries = mockRabbitPayloadDto.tries + 1
      expect(
        service['rabbitmqClientService'].publishDelay,
      ).toHaveBeenCalledWith(
        {
          formId: mockRabbitPayloadDto.formId,
          tries: expectedTries,
          userData: mockRabbitPayloadDto.userData,
        },
        rabbitmqRequeueDelay(expectedTries),
      )
    })

    it('should requeue with delay when send to Ginis fails and tries > 2', async () => {
      const mockPayload = { ...mockRabbitPayloadDto, tries: 3 }
      const mockForm = createTestForm({
        formDefinitionSlug: 'test-slug',
        id: 'test-id',
      })
      jest.spyOn(formsService, 'getUniqueForm').mockResolvedValue(mockForm)
      ;(getFormDefinitionBySlug as jest.Mock).mockReturnValue(
        mockFormDefinition,
      )
      jest
        .spyOn(ginisService, 'createDocument')
        .mockRejectedValue(new Error('Ginis error'))
      jest.spyOn(service, 'nackTrueWithWait').mockResolvedValue(new Nack(true))

      const result = await service.onQueueConsumption(mockPayload)

      expect(result).toEqual(new Nack(true))
      expect(service.nackTrueWithWait).toHaveBeenCalledWith(60_000)
    })
  })

  describe('handleEmailForm', () => {
    it('should send email and return Nack(false) when successful', async () => {
      const mockForm = createTestForm({ id: 'test-id' })
      jest
        .spyOn(service['emailFormsService'], 'sendEmailForm')
        .mockResolvedValue()

      const result = await service['handleEmailForm'](mockForm, null, null)

      expect(result).toEqual(new Nack(false))
    })

    it('should handle error when sending email fails', async () => {
      const mockForm = createTestForm({ id: 'test-id' })
      jest
        .spyOn(service['emailFormsService'], 'sendEmailForm')
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
      const mockForm = createTestForm({ id: 'test-id' })
      jest.spyOn(service['webhookService'], 'sendWebhook').mockResolvedValue()

      const result = await service['handleWebhookForm'](mockForm)

      expect(result).toEqual(new Nack(false))
    })

    it('should handle error when sending webhook fails', async () => {
      const mockForm = createTestForm({ id: 'test-id' })
      jest
        .spyOn(service['webhookService'], 'sendWebhook')
        .mockRejectedValue(new Error('Failed to send webhook'))
      jest.spyOn(service, 'nackTrueWithWait').mockResolvedValue(new Nack(true))

      const result = await service['handleWebhookForm'](mockForm)

      expect(result).toEqual(new Nack(true))
      expect(service.nackTrueWithWait).toHaveBeenCalled()
    })
  })

  describe('handleSlovenskoSkGenericForm', () => {
    let pdfServiceSpy: jest.SpyInstance

    beforeEach(() => {
      pdfServiceSpy = jest.spyOn(
        service['convertPdfService'],
        'createPdfImageInFormFiles',
      )
    })

    it('should requeue and send email if second try fails', async () => {
      const mockForm = createTestForm({
        id: 'test-id',
        formDefinitionSlug: 'slovensko-sk',
      })
      const mockRabbitPayloadDto = {
        formId: 'test-form-id',
        tries: 2,
        userData: {
          email: 'test@example.com',
          firstName: 'Test',
        },
      }
      const mockFormDefinition = {
        type: FormDefinitionType.SlovenskoSkGeneric,
        schema: {},
      } as FormDefinitionSlovenskoSkGeneric

      jest
        .spyOn(ginisService, 'createDocument')
        .mockRejectedValue(new Error('Ginis error'))
      ;(
        formDataExtractors.extractFormSubjectPlain as jest.Mock
      ).mockReturnValue('mock-subject')

      const result = await service['handleSlovenskoSkGenericForm'](
        mockForm,
        mockRabbitPayloadDto,
        mockFormDefinition,
      )

      expect(pdfServiceSpy).toHaveBeenCalled()
      expect(service['mailgunService'].sendEmail).toHaveBeenCalledWith({
        data: {
          to: mockRabbitPayloadDto.userData.email,
          template: MailgunTemplateEnum.GINIS_IN_PROGRESS,
          data: {
            formId: mockForm.id,
            messageSubject: 'mock-subject',
            firstName: mockRabbitPayloadDto.userData.firstName,
            slug: mockForm.formDefinitionSlug,
            formSentAt: mockForm.formSentAt,
          },
        },
      })

      const expectedTries = mockRabbitPayloadDto.tries + 1
      expect(
        service['rabbitmqClientService'].publishDelay,
      ).toHaveBeenCalledWith(
        {
          formId: mockRabbitPayloadDto.formId,
          tries: expectedTries,
          userData: mockRabbitPayloadDto.userData,
        },
        rabbitmqRequeueDelay(expectedTries),
      )
      expect(result.requeue).toBeFalsy() // It is requeued via queueDelayedForm
    })

    it('should requeue with no email if third try fails', async () => {
      const mockForm = createTestForm({
        id: 'test-id',
        formDefinitionSlug: 'slovensko-sk',
      })
      const mockRabbitPayloadDto = {
        formId: 'test-form-id',
        tries: 3,
        userData: {
          email: 'test@example.com',
          firstName: 'Test',
        },
      }
      const mockFormDefinition = {
        type: FormDefinitionType.SlovenskoSkGeneric,
        schema: {},
      } as FormDefinitionSlovenskoSkGeneric

      jest
        .spyOn(ginisService, 'createDocument')
        .mockRejectedValue(new Error('Ginis error'))
      jest.spyOn(service, 'nackTrueWithWait').mockResolvedValue(new Nack(true))

      const result = await service['handleSlovenskoSkGenericForm'](
        mockForm,
        mockRabbitPayloadDto,
        mockFormDefinition,
      )

      expect(pdfServiceSpy).toHaveBeenCalled()
      expect(service['mailgunService'].sendEmail).not.toHaveBeenCalled() // No email sent on third try
      expect(
        service['rabbitmqClientService'].publishDelay,
      ).not.toHaveBeenCalled()
      expect(result.requeue).toBeTruthy()
    })

    it('should publish to ginis if it is generic slovensko.sk form', async () => {
      const mockForm = createTestForm({
        id: 'test-id',
        formDefinitionSlug: 'slovensko-sk',
      })
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
      } as FormDefinitionSlovenskoSkGeneric

      const publishToGinisSpy = jest.spyOn(
        service['rabbitmqClientService'],
        'publishToGinis',
      )

      const result = await service['handleSlovenskoSkGenericForm'](
        mockForm,
        mockRabbitPayloadDto,
        mockFormDefinition,
      )

      expect(pdfServiceSpy).toHaveBeenCalled()
      expect(result.requeue).toBeFalsy()
      expect(publishToGinisSpy).toHaveBeenCalledWith({
        formId: mockRabbitPayloadDto.formId,
        tries: 0,
        userData: mockRabbitPayloadDto.userData,
      })
    })

    it('should send email if email is provided', async () => {
      const mockForm = createTestForm({
        id: 'test-id',
        formDefinitionSlug: 'slovensko-sk',
      })
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
      } as FormDefinitionSlovenskoSkGeneric
      ;(
        formDataExtractors.extractFormSubjectPlain as jest.Mock
      ).mockReturnValue('mock-subject')

      await service['handleSlovenskoSkGenericForm'](
        mockForm,
        mockRabbitPayloadDto,
        mockFormDefinition,
      )

      expect(service['mailgunService'].sendEmail).toHaveBeenCalledWith({
        data: {
          to: mockRabbitPayloadDto.userData.email,
          template: MailgunTemplateEnum.GINIS_SENT,
          data: {
            formId: mockForm.id,
            messageSubject: 'mock-subject',
            firstName: mockRabbitPayloadDto.userData.firstName,
            slug: mockForm.formDefinitionSlug,
            formSentAt: mockForm.formSentAt,
          },
        },
      })
    })

    it('should not send email if email is not provided', async () => {
      const mockForm = createTestForm({
        id: 'test-id',
        formDefinitionSlug: 'slovensko-sk',
      })
      const mockRabbitPayloadDto = {
        formId: 'test-form-id',
        tries: 1,
        userData: {
          email: '',
          firstName: 'Test',
        },
      }
      const mockFormDefinition = {
        type: FormDefinitionType.SlovenskoSkGeneric,
        schema: {},
      } as FormDefinitionSlovenskoSkGeneric

      await service['handleSlovenskoSkGenericForm'](
        mockForm,
        mockRabbitPayloadDto,
        mockFormDefinition,
      )

      expect(service['mailgunService'].sendEmail).not.toHaveBeenCalled()
    })
  })
})
