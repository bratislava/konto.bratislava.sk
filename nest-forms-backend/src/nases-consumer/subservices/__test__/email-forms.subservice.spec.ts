/* eslint-disable pii/no-email */
import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'
import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'
import {
  FormDefinitionEmail,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import * as getFormDefinitionBySlug from 'forms-shared/definitions/getFormDefinitionBySlug'
import * as formDataExtractors from 'forms-shared/form-utils/formDataExtractors'
import * as omitExtraData from 'forms-shared/form-utils/omitExtraData'
import { FormSendPolicy } from 'forms-shared/send-policy/sendPolicy'
import { FormSummary } from 'forms-shared/summary/summary'
import * as renderSummaryEmail from 'forms-shared/summary-email/renderSummaryEmail'

import prismaMock from '../../../../test/singleton'
import ConvertService from '../../../convert/convert.service'
import FormValidatorRegistryService from '../../../form-validator-registry/form-validator-registry.service'
import { FormsErrorsResponseEnum } from '../../../forms/forms.errors.enum'
import PrismaService from '../../../prisma/prisma.service'
import MailgunService from '../../../utils/global-services/mailer/mailgun.service'
import OloMailerService from '../../../utils/global-services/mailer/olo-mailer.service'
import ThrowerErrorGuard from '../../../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { EmailFormsErrorsResponseEnum } from '../dtos/email-forms.errors.enum'
import EmailFormsSubservice from '../email-forms.subservice'

jest.mock('forms-shared/definitions/getFormDefinitionBySlug')
jest.mock('forms-shared/summary-email/renderSummaryEmail')
jest.mock('forms-shared/form-utils/omitExtraData')
jest.mock('forms-shared/form-utils/formDataExtractors')

const formId = 'test-form-id'
const userEmail = 'test@example.com'
const userFirstName = 'Test'
const mockExtractedSubject = 'Mock Extracted Subject'
const mockExtractedTechnicalSubject = 'Test technical Subject'
const mockExtractedEmail = 'extracted@example.com'
const mockExtractedName = 'Extracted Name'
const mockExtractedOloEmail = 'extracted-olo@example.com'
const mockExtractedOloName = 'Extracted OLO Name'

const mockForm = {
  id: formId,
  createdAt: new Date(),
  updatedAt: new Date(),
  externalId: null,
  userExternalId: '12345678-1234-1234-1234-123456789012',
  cognitoGuestIdentityId: null,
  email: 'form-email@example.com',
  mainUri: 'uri://test-main-uri',
  actorUri: 'uri://test-actor-uri',
  ownerType: null,
  ico: null,
  state: FormState.PROCESSING,
  error: FormError.NONE,
  jsonVersion: '1.0',
  formDataJson: { test: 'data' },
  formDataGinis: null,
  formSignature: null,
  ginisDocumentId: null,
  senderId: null,
  recipientId: null,
  finishSubmission: null,
  formDefinitionSlug: 'test-form-email',
  formSummary: { test: 'summary' } as unknown as FormSummary,
  files: [],
  archived: false,
  ginisState: 'CREATED',
  formDataBase64: null,
} as Forms

const mockFormWithOloDefinition = {
  ...mockForm,
  id: 'test-form-olo-id',
  formDefinitionSlug: 'test-form-olo',
} as Forms

const mockFormDefinitionWithSendEmail = {
  slug: 'test-form-email',
  type: FormDefinitionType.Email,
  title: 'Test Form Email',
  schema: {},
  jsonVersion: '1.0',
  sendPolicy: FormSendPolicy.NotAuthenticated,
  termsAndConditions: 'test-terms',
  email: {
    address: {
      prod: 'department@bratislava.sk',
      test: 'department-test@bratislava.sk',
    },
    fromAddress: undefined, // Tests the fallback to email
    mailer: 'mailgun',
    extractEmail: { type: 'schemaless', extractFn: () => mockExtractedEmail },
    extractName: { type: 'schemaless', extractFn: () => mockExtractedName },
    newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    userResponseTemplate: MailgunTemplateEnum.NASES_SENT,
    sendJsonDataAttachmentInTechnicalMail: true,
  },
} as FormDefinitionEmail

const mockFormDefinitionWithSendOloEmail = {
  slug: 'test-form-olo',
  type: FormDefinitionType.Email,
  title: 'Test Form Email',
  schema: {},
  jsonVersion: '1.0',
  sendPolicy: FormSendPolicy.NotAuthenticated,
  termsAndConditions: 'test-terms',
  email: {
    mailer: 'olo',
    newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    userResponseTemplate: MailgunTemplateEnum.NASES_SENT,
    extractEmail: {
      type: 'schemaless',
      extractFn: () => mockExtractedOloEmail,
    },
    extractName: { type: 'schemaless', extractFn: () => mockExtractedOloName },
    address: { prod: 'olo@bratislava.sk', test: 'olo-test@bratislava.sk' },
    fromAddress: {
      prod: 'from-olo@bratislava.sk',
      test: 'from-olo-test@bratislava.sk',
    }, // Test with specified emailFrom
    // No sendJsonDataAttachmentInTechnicalMail specified, to test undefined behavior
  },
} as FormDefinitionEmail

describe('EmailFormsSubservice', () => {
  let service: EmailFormsSubservice
  let mailgunService: jest.Mocked<MailgunService>
  let oloMailerService: jest.Mocked<OloMailerService>
  let configService: jest.Mocked<ConfigService>

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
          provide: OloMailerService,
          useValue: createMock<OloMailerService>(),
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
    oloMailerService = module.get(
      OloMailerService,
    ) as jest.Mocked<OloMailerService>
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>

    jest.spyOn(configService, 'get').mockReturnValue('production')

    service['logger'] = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as LineLoggerSubservice

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
    let extractEmailFormEmailSpy: jest.SpyInstance
    let extractEmailFormNameSpy: jest.SpyInstance
    let extractFormSubjectSpy: jest.SpyInstance

    beforeEach(() => {
      jest.clearAllMocks()
      prismaMock.forms.findUnique.mockResolvedValue(mockForm)
      prismaMock.forms.update.mockResolvedValue(mockForm)
      jest
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockImplementation((slug: string) => {
          if (slug === 'test-form-email') return mockFormDefinitionWithSendEmail
          if (slug === 'test-form-olo')
            return mockFormDefinitionWithSendOloEmail
          return null
        })
      // eslint-disable-next-line xss/no-mixed-html
      jest
        .spyOn(renderSummaryEmail, 'renderSummaryEmail')
        .mockResolvedValue('<html>Test Email Content</html>')
      jest
        .spyOn(omitExtraData, 'omitExtraData')
        .mockReturnValue({ test: 'data' })

      extractEmailFormEmailSpy = jest
        .spyOn(formDataExtractors, 'extractEmailFormEmail')
        .mockReturnValue(mockExtractedEmail)
      extractEmailFormNameSpy = jest
        .spyOn(formDataExtractors, 'extractEmailFormName')
        .mockReturnValue(mockExtractedName)
      extractFormSubjectSpy = jest
        .spyOn(formDataExtractors, 'extractFormSubjectPlain')
        .mockReturnValue(mockExtractedSubject)

      mailgunService.sendEmail.mockResolvedValue()
      oloMailerService.sendEmail.mockResolvedValue()
    })

    it('should successfully send emails using sendEmail function and update form state', async () => {
      await service.sendEmailForm(formId, userEmail, userFirstName)

      // Should look up the form in the database
      expect(prismaMock.forms.findUnique).toHaveBeenCalledWith({
        where: {
          id: formId,
          archived: false,
        },
        include: {
          files: true,
        },
      })

      // Should get form definition
      expect(
        getFormDefinitionBySlug.getFormDefinitionBySlug,
      ).toHaveBeenCalledWith(mockForm.formDefinitionSlug)

      // Check subject extraction
      expect(extractFormSubjectSpy).toHaveBeenCalledWith(
        mockFormDefinitionWithSendEmail,
        mockForm.formDataJson,
      )

      // Should send email to department
      expect(mailgunService.sendEmail).toHaveBeenCalledTimes(2)
      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(1, {
        data: expect.objectContaining({
          to: mockFormDefinitionWithSendEmail.email.address.prod,
          template: mockFormDefinitionWithSendEmail.email.newSubmissionTemplate,
          data: expect.objectContaining({
            formId: mockForm.id,
            slug: mockFormDefinitionWithSendEmail.slug,
            messageSubject: mockExtractedSubject,
          }),
        }),
        emailFrom: mockFormDefinitionWithSendEmail.email.address.prod,
        attachments: expect.arrayContaining([
          expect.objectContaining({
            filename: 'submission.json',
            content: expect.any(Buffer),
          }),
        ]),
        subject: undefined,
      })

      // Should send confirmation email to user
      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          to: userEmail,
          template: mockFormDefinitionWithSendEmail.email.userResponseTemplate,
          data: expect.objectContaining({
            formId: mockForm.id,
            firstName: userFirstName,
            slug: mockFormDefinitionWithSendEmail.slug,
            messageSubject: mockExtractedSubject,
          }),
        }),
        emailFrom: mockFormDefinitionWithSendEmail.email.address.prod,
        attachments: expect.arrayContaining([
          expect.objectContaining({
            filename: 'potvrdenie.pdf',
          }),
        ]),
      })

      // Should update the form state to FINISHED
      expect(prismaMock.forms.update).toHaveBeenCalledWith({
        where: {
          id: mockForm.id,
        },
        data: {
          state: FormState.FINISHED,
          error: FormError.NONE,
        },
      })
    })

    it('should successfully send emails using sendOloEmail function and update form state', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(mockFormWithOloDefinition)
      prismaMock.forms.update.mockResolvedValue(mockFormWithOloDefinition)
      extractEmailFormEmailSpy.mockReturnValue(mockExtractedOloEmail)
      extractEmailFormNameSpy.mockReturnValue(mockExtractedOloName)

      await service.sendEmailForm(
        mockFormWithOloDefinition.id,
        userEmail,
        userFirstName,
      )

      // Should look up the form in the database
      expect(prismaMock.forms.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockFormWithOloDefinition.id,
          archived: false,
        },
        include: {
          files: true,
        },
      })

      // Should get form definition
      expect(
        getFormDefinitionBySlug.getFormDefinitionBySlug,
      ).toHaveBeenCalledWith(mockFormWithOloDefinition.formDefinitionSlug)

      // Check subject extraction
      expect(extractFormSubjectSpy).toHaveBeenCalledWith(
        mockFormDefinitionWithSendOloEmail,
        mockFormWithOloDefinition.formDataJson,
      )

      // Should send email to department using sendOloEmail
      expect(oloMailerService.sendEmail).toHaveBeenCalledTimes(2)
      expect(oloMailerService.sendEmail).toHaveBeenNthCalledWith(1, {
        data: expect.objectContaining({
          to: mockFormDefinitionWithSendOloEmail.email.address.prod,
          template:
            mockFormDefinitionWithSendOloEmail.email.newSubmissionTemplate,
          data: expect.objectContaining({
            formId: mockFormWithOloDefinition.id,
            slug: mockFormDefinitionWithSendOloEmail.slug,
            messageSubject: mockExtractedSubject,
          }),
        }),
        emailFrom: mockFormDefinitionWithSendOloEmail.email.fromAddress?.prod,
        attachments: undefined,
        subject: undefined,
      })

      // Should send confirmation email to user using sendOloEmail
      expect(oloMailerService.sendEmail).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          to: userEmail,
          template:
            mockFormDefinitionWithSendOloEmail.email.userResponseTemplate,
          data: expect.objectContaining({
            formId: mockFormWithOloDefinition.id,
            firstName: userFirstName,
            slug: mockFormDefinitionWithSendOloEmail.slug,
            messageSubject: mockExtractedSubject,
          }),
        }),
        emailFrom: mockFormDefinitionWithSendOloEmail.email.fromAddress?.prod,
        attachments: expect.arrayContaining([
          expect.objectContaining({
            filename: 'potvrdenie.pdf',
          }),
        ]),
      })

      // Should update the form state to FINISHED
      expect(prismaMock.forms.update).toHaveBeenCalledWith({
        where: {
          id: mockFormWithOloDefinition.id,
        },
        data: {
          state: FormState.FINISHED,
          error: FormError.NONE,
        },
      })
    })

    it('should throw NotFoundException when form is not found', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(null)
      await expect(
        service.sendEmailForm(formId, userEmail, userFirstName),
      ).rejects.toThrow(FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR)
    })

    it('should throw NotFoundException when form definition is not found', async () => {
      jest
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockReturnValue(null)

      await expect(
        service.sendEmailForm(formId, userEmail, userFirstName),
      ).rejects.toThrow(FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND)
    })

    it('should throw UnprocessableEntityException when form is not an email form', async () => {
      const nonEmailFormDefinition = {
        ...mockFormDefinitionWithSendEmail,
        type: FormDefinitionType.SlovenskoSkGeneric,
      }
      jest
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockReturnValue(
          nonEmailFormDefinition as unknown as FormDefinitionSlovenskoSkGeneric,
        )

      await expect(
        service.sendEmailForm(formId, userEmail, userFirstName),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(
            EmailFormsErrorsResponseEnum.NOT_EMAIL_FORM,
          ),
        }),
      )
    })

    it('should throw UnprocessableEntityException when formDataJson is null', async () => {
      const formWithoutData = {
        ...mockForm,
        formDataJson: null,
      }
      prismaMock.forms.findUnique.mockResolvedValue(formWithoutData)

      await expect(
        service.sendEmailForm(formId, userEmail, userFirstName),
      ).rejects.toThrow(FormsErrorsResponseEnum.EMPTY_FORM_DATA)
    })

    it('should throw UnprocessableEntityException when formSummary is null', async () => {
      const formWithoutSummary = {
        ...mockForm,
        formSummary: null,
      }
      prismaMock.forms.findUnique.mockResolvedValue(formWithoutSummary)

      await expect(
        service.sendEmailForm(formId, userEmail, userFirstName),
      ).rejects.toThrow(FormsErrorsResponseEnum.EMPTY_FORM_SUMMARY)
    })

    it('should extract email from form data when userEmail is null', async () => {
      extractEmailFormEmailSpy.mockReturnValue(mockExtractedEmail)

      await service.sendEmailForm(formId, null, userFirstName)

      expect(extractEmailFormEmailSpy).toHaveBeenCalledWith(
        mockFormDefinitionWithSendEmail,
        mockForm.formDataJson,
      )
      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          to: mockExtractedEmail,
        }),
        emailFrom: mockFormDefinitionWithSendEmail.email.address.prod,
        attachments: expect.any(Array),
      })
    })

    it('should extract name from form data when userFirstName is null', async () => {
      extractEmailFormNameSpy.mockReturnValue(mockExtractedName)

      await service.sendEmailForm(formId, userEmail, null)

      expect(extractEmailFormNameSpy).toHaveBeenCalledWith(
        mockFormDefinitionWithSendEmail,
        mockForm.formDataJson,
      )
      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          data: expect.objectContaining({
            firstName: mockExtractedName,
          }),
        }),
        emailFrom: mockFormDefinitionWithSendEmail.email.address.prod,
        attachments: expect.any(Array),
      })
    })

    it('should log error but continue when sending confirmation email fails with sendEmail', async () => {
      mailgunService.sendEmail.mockResolvedValueOnce() // First call succeeds (department email)
      mailgunService.sendEmail.mockRejectedValueOnce(
        new Error('Email sending failed'),
      ) // Second call fails (user email)
      const errorSpy = jest.spyOn(service['logger'], 'error')

      await service.sendEmailForm(formId, userEmail, userFirstName)

      // Should still update form state despite email failure
      expect(prismaMock.forms.update).toHaveBeenCalled()
      expect(errorSpy).toHaveBeenCalled()
    })

    it('should log error but continue when sending confirmation email fails with sendOloEmail', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(mockFormWithOloDefinition)
      prismaMock.forms.update.mockResolvedValue(mockFormWithOloDefinition)
      const errorSpy = jest.spyOn(service['logger'], 'error')

      oloMailerService.sendEmail.mockResolvedValueOnce() // First call succeeds (department email)
      oloMailerService.sendEmail.mockRejectedValueOnce(
        new Error('OLO email sending failed'),
      ) // Second call fails (user email)

      await service.sendEmailForm(
        mockFormWithOloDefinition.id,
        userEmail,
        userFirstName,
      )

      // Should still update form state despite email failure
      expect(prismaMock.forms.update).toHaveBeenCalled()
      expect(errorSpy).toHaveBeenCalled()
    })

    it('should send JSON data as attachment when sendJsonDataAttachmentInTechnicalMail is true', async () => {
      await service.sendEmailForm(formId, userEmail, userFirstName)

      // First call (department email) should include JSON attachment
      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(1, {
        data: expect.anything(),
        emailFrom: expect.anything(),
        attachments: expect.arrayContaining([
          expect.objectContaining({
            filename: 'submission.json',
            content: expect.any(Buffer),
          }),
        ]),
        subject: undefined,
      })
    })

    it('should not send JSON data as attachment when sendJsonDataAttachmentInTechnicalMail is undefined', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(mockFormWithOloDefinition)
      prismaMock.forms.update.mockResolvedValue(mockFormWithOloDefinition)

      await service.sendEmailForm(
        mockFormWithOloDefinition.id,
        userEmail,
        userFirstName,
      )

      // First call (department email) should not include JSON attachment as sendJsonDataAttachmentInTechnicalMail is undefined
      expect(oloMailerService.sendEmail).toHaveBeenNthCalledWith(1, {
        data: expect.anything(),
        emailFrom: expect.anything(),
        attachments: undefined,
        subject: undefined,
      })
    })

    it('should not send JSON data as attachment when sendJsonDataAttachmentInTechnicalMail is false', async () => {
      // Temporarily set sendJsonDataAttachmentInTechnicalMail to false for this test
      const originalSendJsonData =
        mockFormDefinitionWithSendEmail.email
          .sendJsonDataAttachmentInTechnicalMail
      mockFormDefinitionWithSendEmail.email.sendJsonDataAttachmentInTechnicalMail = false

      await service.sendEmailForm(formId, userEmail, userFirstName)

      // First call (department email) should not include JSON attachment
      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(1, {
        data: expect.anything(),
        emailFrom: expect.anything(),
        attachments: undefined,
        subject: undefined,
      })

      // Restore original value
      mockFormDefinitionWithSendEmail.email.sendJsonDataAttachmentInTechnicalMail =
        originalSendJsonData
    })

    it('should log error but continue when updating form state fails', async () => {
      prismaMock.forms.update.mockRejectedValue(new Error('Database error'))
      const errorSpy = jest.spyOn(service['logger'], 'error')

      await service.sendEmailForm(formId, userEmail, userFirstName)

      expect(errorSpy).toHaveBeenCalled()
    })

    it('should take email based on CLUSTER_ENV', async () => {
      configService.get.mockReturnValue('production')

      await service.sendEmailForm(formId, null, null)

      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(1, {
        data: expect.objectContaining({
          to: 'department@bratislava.sk',
        }),
        emailFrom: 'department@bratislava.sk',
        attachments: expect.any(Array),
        subject: undefined,
      })
    })

    it('should take email based on CLUSTER_ENV and different emailFrom', async () => {
      configService.get.mockReturnValue('staging')
      prismaMock.forms.findUnique.mockResolvedValue(mockFormWithOloDefinition)

      await service.sendEmailForm(mockFormWithOloDefinition.id, null, null)

      expect(oloMailerService.sendEmail).toHaveBeenCalledWith({
        data: expect.objectContaining({
          to: 'olo-test@bratislava.sk',
        }),
        emailFrom: 'from-olo-test@bratislava.sk',
        attachments: undefined,
      })
    })

    it('should send both emails with parsed emailFrom', async () => {
      configService.get.mockReturnValue('production')
      prismaMock.forms.findUnique.mockResolvedValue(mockFormWithOloDefinition)

      await service.sendEmailForm(
        mockFormWithOloDefinition.id,
        'some@mail.com',
        'Name',
      )

      expect(oloMailerService.sendEmail).toHaveBeenNthCalledWith(1, {
        data: expect.objectContaining({
          to: 'olo@bratislava.sk',
        }),
        emailFrom: 'from-olo@bratislava.sk',
        attachments: undefined,
        subject: undefined,
      })
      expect(oloMailerService.sendEmail).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          to: 'some@mail.com',
        }),
        emailFrom: 'from-olo@bratislava.sk',
        attachments: expect.any(Array),
      })
    })

    it('should use subject from the form definition if there is one', async () => {
      const formDefinitionWithSubject = {
        ...mockFormDefinitionWithSendEmail,
        subject: {
          extractTechnical: {
            type: 'schemaless' as const,
            extractFn: () => mockExtractedTechnicalSubject,
          },
        },
      }
      jest
        .spyOn(formDataExtractors, 'extractFormSubjectTechnical')
        .mockReturnValue(mockExtractedTechnicalSubject)
      jest
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockReturnValue(formDefinitionWithSubject)
      await service.sendEmailForm(formId, userEmail, userFirstName)

      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(1, {
        data: expect.anything(),
        emailFrom: expect.anything(),
        attachments: expect.anything(),
        subject: mockExtractedTechnicalSubject,
      })
    })
  })

  describe('resolveAddress', () => {
    it('should return prod address when CLUSTER_ENV is production', () => {
      jest.spyOn(configService, 'get').mockReturnValue('production')
      const addressObject = {
        test: 'test@example.com',
        prod: 'prod@example.com',
      }
      const result = service['resolveAddress'](addressObject)
      expect(result).toBe(addressObject.prod)
      expect(configService.get).toHaveBeenCalledWith('CLUSTER_ENV')
    })

    it('should return test address when CLUSTER_ENV is staging', () => {
      configService.get.mockReturnValue('staging')
      const addressObject = {
        test: 'test@example.com',
        prod: 'prod@example.com',
      }
      const result = service['resolveAddress'](addressObject)
      expect(result).toBe(addressObject.test)
      expect(configService.get).toHaveBeenCalledWith('CLUSTER_ENV')
    })

    it('should return test address when CLUSTER_ENV is development', () => {
      configService.get.mockReturnValue('development')
      const addressObject = {
        test: 'test@example.com',
        prod: 'prod@example.com',
      }
      const result = service['resolveAddress'](addressObject)
      expect(result).toBe(addressObject.test)
      expect(configService.get).toHaveBeenCalledWith('CLUSTER_ENV')
    })

    it('should return test address when CLUSTER_ENV is undefined', () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      configService.get.mockReturnValue(undefined)
      const addressObject = {
        test: 'test@example.com',
        prod: 'prod@example.com',
      }
      const result = service['resolveAddress'](addressObject)
      expect(result).toBe(addressObject.test)
      expect(configService.get).toHaveBeenCalledWith('CLUSTER_ENV')
    })
  })
})
/* eslint-enable pii/no-email */
