/* eslint-disable pii/no-email */
import { createMock } from '@golevelup/ts-jest'
import { HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'
import * as getFormDefinitionBySlug from 'forms-shared/definitions/getFormDefinitionBySlug'
import * as omitExtraData from 'forms-shared/form-utils/omitExtraData'
import * as renderSummaryEmail from 'forms-shared/summary-email/renderSummaryEmail'

import prismaMock from '../../../../test/singleton'
import ConvertService from '../../../convert/convert.service'
import FormValidatorRegistryService from '../../../form-validator-registry/form-validator-registry.service'
import { FormsErrorsResponseEnum } from '../../../forms/forms.errors.enum'
import PrismaService from '../../../prisma/prisma.service'
import MailgunService from '../../../utils/global-services/mailgun/mailgun.service'
import ThrowerErrorGuard from '../../../utils/guards/thrower-error.guard'
import { EmailFormsErrorsResponseEnum } from '../dtos/email-forms.errors.enum'
import EmailFormsSubservice from '../email-forms.subservice'

jest.mock('forms-shared/definitions/getFormDefinitionBySlug')
jest.mock('forms-shared/summary-email/renderSummaryEmail')
jest.mock('forms-shared/form-utils/omitExtraData')
jest.mock('jsonwebtoken')

describe('EmailFormsSubservice', () => {
  let service: EmailFormsSubservice
  let mailgunService: jest.Mocked<MailgunService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailFormsSubservice,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: MailgunService,
          useValue: createMock<MailgunService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: ConvertService,
          useValue: createMock<ConvertService>(),
        },
        {
          provide: FormValidatorRegistryService,
          useValue: createMock<FormValidatorRegistryService>(),
        },
        ThrowerErrorGuard,
      ],
    }).compile()

    service = module.get<EmailFormsSubservice>(EmailFormsSubservice)
    mailgunService = module.get(MailgunService) as jest.Mocked<MailgunService>

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

  describe('sendEmailForm', () => {
    const mockFormId = 'test-form-id'

    it('should process a valid email form successfully', async () => {
      const mockForm = {
        id: 'test-form-id',
        formDefinitionSlug: 'test-slug',
        formDataJson: {},
        files: [],
        email: 'test@example.com',
        formSummary: {},
      }
      const mockFormDefinition = {
        type: 'Email',
        email: 'test@example.com',
        schema: {},
        slug: 'test-slug',
        userEmailPath: 'user.email',
      }

      prismaMock.forms.findUnique.mockResolvedValue(
        mockForm as unknown as Forms,
      )
      prismaMock.forms.update.mockResolvedValue(mockForm as unknown as Forms)
      ;(
        getFormDefinitionBySlug.getFormDefinitionBySlug as jest.Mock
      ).mockReturnValue(mockFormDefinition)
      ;(omitExtraData.omitExtraData as jest.Mock).mockReturnValue(
        mockForm.formDataJson,
      )
      // eslint-disable-next-line xss/no-mixed-html
      ;(renderSummaryEmail.renderSummaryEmail as jest.Mock).mockResolvedValue(
        '<html></html>',
      )

      await service.sendEmailForm(mockFormId, 'some@mail.com', null)

      expect(prismaMock.forms.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-form-id', archived: false },
        include: { files: true },
      })
      expect(mailgunService.sendOloEmail).toHaveBeenCalledTimes(2)
      expect(prismaMock.forms.update).toHaveBeenCalledWith({
        where: { id: 'test-form-id' },
        data: { state: FormState.FINISHED, error: FormError.NONE },
      })
    })

    it('should process a valid email form successfully even when email not provided in user data', async () => {
      const mockForm = {
        id: 'test-form-id',
        formDefinitionSlug: 'test-slug',
        formDataJson: {
          user: {
            email: 'test@example.com',
          },
        },
        files: [],
        email: null,
        formSummary: {},
      }
      const mockFormDefinition = {
        type: 'Email',
        email: 'test@example.com',
        schema: {},
        slug: 'test-slug',
        extractEmail: (formData: PrismaJson.FormDataJson) =>
          formData.user.email,
      }

      prismaMock.forms.findUnique.mockResolvedValue(
        mockForm as unknown as Forms,
      )
      prismaMock.forms.update.mockResolvedValue(mockForm as unknown as Forms)
      ;(
        getFormDefinitionBySlug.getFormDefinitionBySlug as jest.Mock
      ).mockReturnValue(mockFormDefinition)
      ;(omitExtraData.omitExtraData as jest.Mock).mockReturnValue(
        mockForm.formDataJson,
      )
      // eslint-disable-next-line xss/no-mixed-html
      ;(renderSummaryEmail.renderSummaryEmail as jest.Mock).mockResolvedValue(
        '<html></html>',
      )

      await service.sendEmailForm(mockFormId, null, null)

      expect(prismaMock.forms.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-form-id', archived: false },
        include: { files: true },
      })
      expect(mailgunService.sendOloEmail).toHaveBeenCalledTimes(2)
      expect(prismaMock.forms.update).toHaveBeenCalledWith({
        where: { id: 'test-form-id' },
        data: { state: FormState.FINISHED, error: FormError.NONE },
      })
    })

    it('should throw NotFoundException when form is not found', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(null)

      await expect(
        service.sendEmailForm(mockFormId, null, null),
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
      } as unknown as Forms)
      ;(
        getFormDefinitionBySlug.getFormDefinitionBySlug as jest.Mock
      ).mockReturnValue(null)

      await expect(
        service.sendEmailForm(mockFormId, null, null),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(
            FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND,
          ),
          status: HttpStatus.NOT_FOUND,
        }),
      )
    })

    it('should throw UnprocessableEntityException when form is not an email form', async () => {
      prismaMock.forms.findUnique.mockResolvedValue({
        formDefinitionSlug: 'test-slug',
      } as unknown as Forms)
      ;(
        getFormDefinitionBySlug.getFormDefinitionBySlug as jest.Mock
      ).mockReturnValue({ type: 'NotEmail' })

      await expect(
        service.sendEmailForm(mockFormId, null, null),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(
            EmailFormsErrorsResponseEnum.NOT_EMAIL_FORM,
          ),
          status: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
      )
    })
  })
})
/* eslint-enable pii/no-email */
