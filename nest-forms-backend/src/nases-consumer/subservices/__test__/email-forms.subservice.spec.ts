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
import * as omitExtraData from 'forms-shared/form-utils/omitExtraData'
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

const formId = 'test-form-id'
const userEmail = 'test@example.com'
const userFirstName = 'Test'

const mockForm = {
  id: formId,
  createdAt: new Date(),
  updatedAt: new Date(),
  externalId: null,
  userExternalId: '12345678-1234-1234-1234-123456789012',
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
  schema: {
    uiOptions: {},
  },
  jsonVersion: '1.0',
  termsAndConditions: 'test-terms',
  messageSubjectDefault: 'Test Subject',
  email: {
    address: {
      prod: 'department@bratislava.sk',
      test: 'department-test@bratislava.sk',
    },
    fromAddress: undefined, // Tests the fallback to email
    mailer: 'mailgun',
    extractEmail: jest.fn().mockReturnValue('extracted@example.com'),
    extractName: jest.fn().mockReturnValue('Extracted Name'),
    newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    userResponseTemplate: MailgunTemplateEnum.NASES_SENT,
    sendJsonDataAttachmentInTechnicalMail: true,
  },
} as FormDefinitionEmail

const mockFormDefinitionWithSendOloEmail = {
  slug: 'test-form-olo',
  type: FormDefinitionType.Email,
  title: 'Test Form Email',
  schema: {
    uiOptions: {},
  },
  jsonVersion: '1.0',
  termsAndConditions: 'test-terms',
  messageSubjectDefault: 'Test Subject',
  email: {
    mailer: 'olo',
    newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    userResponseTemplate: MailgunTemplateEnum.NASES_SENT,
    extractEmail: jest.fn().mockReturnValue('extracted-olo@example.com'),
    extractName: jest.fn().mockReturnValue('Extracted OLO Name'),
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
  let throwerErrorGuard: jest.Mocked<ThrowerErrorGuard>
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
    throwerErrorGuard = module.get(
      ThrowerErrorGuard,
    ) as jest.Mocked<ThrowerErrorGuard>
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>

    jest.spyOn(configService, 'get').mockReturnValue('production')

    throwerErrorGuard['logger'] = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as LineLoggerSubservice

    service['logger'] = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as LineLoggerSubservice
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendEmailForm', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      prismaMock.forms.findUnique.mockResolvedValue(mockForm)
      prismaMock.forms.update.mockResolvedValue(mockForm)
      jest
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockImplementation((slug) => {
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

      // Should send email to department
      expect(mailgunService.sendEmail).toHaveBeenCalledTimes(2)
      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(1, {
        data: expect.objectContaining({
          to: mockFormDefinitionWithSendEmail.email.address.prod,
          template: mockFormDefinitionWithSendEmail.email.newSubmissionTemplate,
          data: expect.objectContaining({
            formId: mockForm.id,
            slug: mockFormDefinitionWithSendEmail.slug,
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
      await service.sendEmailForm(formId, null, userFirstName)

      expect(
        mockFormDefinitionWithSendEmail.email.extractEmail,
      ).toHaveBeenCalledWith(mockForm.formDataJson)
      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          to: 'extracted@example.com',
        }),
        emailFrom: mockFormDefinitionWithSendEmail.email.address.prod,
        attachments: expect.any(Array),
      })
    })

    it('should extract name from form data when userFirstName is null', async () => {
      await service.sendEmailForm(formId, userEmail, null)

      expect(
        mockFormDefinitionWithSendEmail.email.extractName,
      ).toHaveBeenCalledWith(mockForm.formDataJson)
      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          data: expect.objectContaining({
            firstName: 'Extracted Name',
          }),
        }),
        emailFrom: mockFormDefinitionWithSendEmail.email.address.prod,
        attachments: expect.any(Array),
      })
    })

    it('should use null for firstName when both userFirstName and extractName are not available', async () => {
      mockFormDefinitionWithSendEmail.email.extractName = undefined
      await service.sendEmailForm(formId, userEmail, null)

      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          data: expect.objectContaining({
            firstName: null,
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

    it('should log warning when no user email is available with sendEmail', async () => {
      jest
        .spyOn(mockFormDefinitionWithSendEmail.email, 'extractEmail')
        // eslint-disable-next-line unicorn/no-useless-undefined
        .mockImplementation(() => undefined)
      const errorSpy = jest.spyOn(service['logger'], 'error')

      await service.sendEmailForm(formId, null, userFirstName)

      // Should only send one email (to department)
      expect(mailgunService.sendEmail).toHaveBeenCalledTimes(1)
      expect(errorSpy).toHaveBeenCalled()
      // Should still update form state
      expect(prismaMock.forms.update).toHaveBeenCalled()
    })

    it('should log warning when no user email is available with sendOloEmail', async () => {
      prismaMock.forms.findUnique.mockResolvedValue(mockFormWithOloDefinition)
      prismaMock.forms.update.mockResolvedValue(mockFormWithOloDefinition)
      jest
        .spyOn(mockFormDefinitionWithSendOloEmail.email, 'extractEmail')
        // eslint-disable-next-line unicorn/no-useless-undefined
        .mockImplementation(() => undefined)
      const errorSpy = jest.spyOn(service['logger'], 'error')

      await service.sendEmailForm(
        mockFormWithOloDefinition.id,
        null,
        userFirstName,
      )

      // Should only send one email (to department)
      expect(oloMailerService.sendEmail).toHaveBeenCalledTimes(1)
      expect(errorSpy).toHaveBeenCalled()
      // Should still update form state
      expect(prismaMock.forms.update).toHaveBeenCalled()
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
      mockFormDefinitionWithSendEmail.email.sendJsonDataAttachmentInTechnicalMail =
        false

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
        email: {
          ...mockFormDefinitionWithSendEmail.email,
          technicalEmailSubject: 'Test technical Subject',
        },
      }
      jest
        .spyOn(getFormDefinitionBySlug, 'getFormDefinitionBySlug')
        .mockReturnValue(formDefinitionWithSubject)
      await service.sendEmailForm(formId, userEmail, userFirstName)

      expect(mailgunService.sendEmail).toHaveBeenNthCalledWith(1, {
        data: expect.anything(),
        emailFrom: expect.anything(),
        attachments: expect.anything(),
        subject: 'Test technical Subject',
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
