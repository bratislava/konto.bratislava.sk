import { createMock } from '@golevelup/ts-jest'
import { HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Forms, FormState } from '@prisma/client'
import axios from 'axios'
import {
  FormDefinition,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import * as getFormDefinitionBySlug from 'forms-shared/definitions/getFormDefinitionBySlug'
import * as omitExtraData from 'forms-shared/form-utils/omitExtraData'

import prismaMock from '../../../../test/singleton'
import FormValidatorRegistryService from '../../../form-validator-registry/form-validator-registry.service'
import { FormsErrorsResponseEnum } from '../../../forms/forms.errors.enum'
import PrismaService from '../../../prisma/prisma.service'
import ThrowerErrorGuard from '../../../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { WebhookErrorsResponseEnum } from '../dtos/webhook.errors.enum'
import WebhookSubservice from '../webhook.subservice'

jest.mock('axios')
jest.mock('forms-shared/definitions/getFormDefinitionBySlug')
jest.mock('forms-shared/form-utils/omitExtraData')

describe('WebhookSubservice', () => {
  let service: WebhookSubservice

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookSubservice,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        ThrowerErrorGuard,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: FormValidatorRegistryService,
          useValue: createMock<FormValidatorRegistryService>(),
        },
      ],
    }).compile()

    service = module.get<WebhookSubservice>(WebhookSubservice)
    const mockLogger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as LineLoggerSubservice
    service['logger'] = mockLogger

    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendWebhook', () => {
    const mockFormId = 'test-form-id'

    it('should process a valid webhook form successfully', async () => {
      const mockForm = {
        id: 'test-form-id',
        formDefinitionSlug: 'test-slug',
        formDataJson: {},
      }
      const mockFormDefinition: FormDefinition = {
        type: FormDefinitionType.Webhook,
        webhookUrl: 'https://example.com/webhook',
        schema: {},
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
      await service.sendWebhook(mockFormId)
      expect(prismaMock.forms.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-form-id' },
        include: { files: true },
      })
      expect(axios.post).toHaveBeenCalledWith('https://example.com/webhook', {
        formId: 'test-form-id',
        slug: 'test-slug',
        data: {},
        files: {},
      })
      expect(prismaMock.forms.update).toHaveBeenCalledWith({
        where: { id: 'test-form-id' },
        data: { state: FormState.FINISHED },
      })
    })

    it('should throw NotFoundException when form is not found', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(null)
      await expect(service.sendWebhook(mockFormId)).rejects.toThrow(
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
      await expect(service.sendWebhook(mockFormId)).rejects.toThrow(
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
      await expect(service.sendWebhook(mockFormId)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(
            WebhookErrorsResponseEnum.NOT_WEBHOOK_FORM,
          ),
          status: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
      )
    })

    it('should throw UnprocessableEntityException when formDataJson is null', async () => {
      const mockForm = {
        id: 'test-form-id',
        formDefinitionSlug: 'test-slug',
        formDataJson: null,
      }
      const mockFormDefinition: FormDefinition = {
        type: FormDefinitionType.Webhook,
        webhookUrl: 'https://example.com/webhook',
        schema: {},
        slug: 'test-slug',
      } as FormDefinition

      prismaMock.forms.findUnique.mockResolvedValue(mockForm as Forms)
      ;(
        getFormDefinitionBySlug.getFormDefinitionBySlug as jest.Mock
      ).mockReturnValue(mockFormDefinition)

      await expect(service.sendWebhook(mockFormId)).rejects.toThrow(
        expect.objectContaining({
          message: FormsErrorsResponseEnum.EMPTY_FORM_DATA,
          status: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
      )
    })
  })
})
