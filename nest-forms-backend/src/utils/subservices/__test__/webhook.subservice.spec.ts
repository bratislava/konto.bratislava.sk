import { HttpStatus, Logger } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'
import axios from 'axios'
import { Job } from 'bull'
import {
  FormDefinition,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import * as getFormDefinitionBySlug from 'forms-shared/definitions/getFormDefinitionBySlug'
import * as omitExtraData from 'forms-shared/form-utils/omitExtraData'

import prismaMock from '../../../../test/singleton'
import { FormsErrorsResponseEnum } from '../../../forms/forms.errors.enum'
import PrismaService from '../../../prisma/prisma.service'
import ThrowerErrorGuard from '../../guards/thrower-error.guard'
import { WebhookErrorsResponseEnum } from '../dtos/webhook.errors.enum'
import WebhookSubservice from '../webhook.subservice'

jest.mock('axios')
jest.mock('forms-shared/definitions/getFormDefinitionBySlug')
jest.mock('forms-shared/form-utils/omitExtraData')

describe('WebhookSubservice', () => {
  let service: WebhookSubservice
  let throwerErrorGuard: jest.Mocked<ThrowerErrorGuard>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookSubservice,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        ThrowerErrorGuard,
      ],
    }).compile()

    service = module.get<WebhookSubservice>(WebhookSubservice)
    const mockLogger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as Logger
    throwerErrorGuard = module.get(
      ThrowerErrorGuard,
    ) as jest.Mocked<ThrowerErrorGuard>

    throwerErrorGuard['logger'] = mockLogger
    service['logger'] = mockLogger
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendWebhook', () => {
    const mockJob: Partial<Job<{ formId: string }>> = {
      data: { formId: 'test-form-id' },
    }

    it('should process a valid webhook form successfully', async () => {
      const mockForm = {
        id: 'test-form-id',
        formDefinitionSlug: 'test-slug',
        formDataJson: {},
      }
      const mockFormDefinition: FormDefinition = {
        type: FormDefinitionType.Webhook,
        webhookUrl: 'https://example.com/webhook',
        schemas: { schema: {}, uiSchema: {} },
        slug: 'test-slug',
      } as FormDefinition

      prismaMock.forms.findUnique.mockResolvedValue(mockForm as Forms)
      prismaMock.forms.update.mockResolvedValue(mockForm as Forms)
      ;(
        getFormDefinitionBySlug.getFormDefinitionBySlug as jest.Mock
      ).mockReturnValue(mockFormDefinition)
      ;(omitExtraData.omitExtraData as jest.Mock).mockReturnValue(
        mockForm.formDataJson,
      )
      ;(axios.post as jest.Mock).mockResolvedValue({ status: 200 })

      await service.sendWebhook(mockJob as Job<{ formId: string }>)

      expect(prismaMock.forms.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-form-id' },
      })
      expect(axios.post).toHaveBeenCalledWith('https://example.com/webhook', {
        formData: {},
      })
      expect(prismaMock.forms.update).toHaveBeenCalledWith({
        where: { id: 'test-form-id' },
        data: { state: FormState.PROCESSING },
      })
    })

    it('should throw NotFoundException when form is not found', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(null)

      await expect(
        service.sendWebhook(mockJob as Job<{ formId: string }>),
      ).rejects.toThrow(
        expect.objectContaining({
          message: FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
          status: HttpStatus.NOT_FOUND,
        }),
      )
    })

    it('should throw NotFoundException when form definition is not found', async () => {
      prismaMock.forms.findUnique.mockResolvedValue({
        formDefinitionSlug: 'test-slug',
      } as any)
      ;(
        getFormDefinitionBySlug.getFormDefinitionBySlug as jest.Mock
      ).mockReturnValue(null)

      await expect(
        service.sendWebhook(mockJob as Job<{ formId: string }>),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(
            FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND,
          ),
          status: HttpStatus.NOT_FOUND,
        }),
      )
    })

    it('should throw UnprocessableEntityException when form is not a webhook form', async () => {
      prismaMock.forms.findUnique.mockResolvedValue({
        formDefinitionSlug: 'test-slug',
      } as any)
      ;(
        getFormDefinitionBySlug.getFormDefinitionBySlug as jest.Mock
      ).mockReturnValue({ type: 'NotWebhook' })

      await expect(
        service.sendWebhook(mockJob as Job<{ formId: string }>),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(
            WebhookErrorsResponseEnum.NOT_WEBHOOK_FORM,
          ),
          status: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
      )
    })
  })

  describe('onFailed', () => {
    it('should update form error state when job fails', async () => {
      const mockJob: Partial<Job<{ formId: string }>> = {
        data: { formId: 'test-form-id' },
      }
      const mockError = new Error('Test error')
      prismaMock.forms.update.mockResolvedValue({} as any)

      await service.onFailed(mockJob as Job, mockError)

      expect(prismaMock.forms.update).toHaveBeenCalledWith({
        where: { id: 'test-form-id' },
        data: { error: FormError.WEBHOOK_SEND_ERROR },
      })
    })
  })
})
