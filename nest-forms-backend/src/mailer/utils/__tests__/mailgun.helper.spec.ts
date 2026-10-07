import { ErrorFactoryService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-jest'
import { Test } from '@nestjs/testing'
import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'
import Handlebars from 'handlebars'

import { expectStringContaining } from '../../../__tests__/jest-matchers'
import BaConfigService from '../../../config/ba-config.service'
import StrapiService from '../../../strapi/strapi.service'
import { SendEmailInputDto } from '../../../utils/global-dtos/mailgun.dto'
import {
  MailgunErrorsEnum,
  MailgunErrorsResponseEnum,
} from '../../../utils/global-enums/mailgun.errors.enum'
import MailgunHelper from '../mailgun.helper'

// Mock for IMailgunClient
const mockMailgunClient = {
  domains: {
    domainTemplates: {
      get: jest.fn(),
    },
  },
}

// Mock for Handlebars.compile
jest.mock('handlebars', () => ({
  compile: jest.fn(),
}))

// Mock for Mailgun
jest.mock('mailgun.js', () =>
  jest.fn().mockImplementation(() => ({
    client: jest.fn().mockReturnValue(mockMailgunClient),
  })),
)

describe('MailgunHelper', () => {
  let mailgunHelper: MailgunHelper
  let strapiService: StrapiService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MailgunHelper,
        {
          provide: BaConfigService,
          useValue: {
            mailgun: {
              apiKey: 'test-api-key',
              host: 'test-host',
              emailFrom: 'test@example.com',
              domain: 'test-domain',
            },
            frontend: { url: 'https://konto.bratislava.sk' },
            olo: { frontendUrl: 'https://olo.sk' },
          },
        },
        {
          provide: StrapiService,
          useValue: createMock<StrapiService>(),
        },
        {
          provide: ErrorFactoryService,
          useValue: {
            NotFoundException: jest
              .fn()
              .mockImplementation(
                ({
                  errorEnum,
                  message,
                }: {
                  errorEnum: string
                  message: string
                }) => {
                  throw new Error(`NotFound: ${errorEnum} - ${message}`)
                },
              ),
          },
        },
      ],
    }).compile()

    mailgunHelper = moduleRef.get<MailgunHelper>(MailgunHelper)
    strapiService = moduleRef.get<StrapiService>(StrapiService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should initialize mailgunClient correctly', () => {
      expect(mailgunHelper.mailgunClient).toBeDefined()
    })
  })

  describe('createEmailVariables', () => {
    const mockFormSentAt = new Date('2026-02-11T12:00:00.000Z')

    it('should process PARAMETER type variables correctly', async () => {
      const input: SendEmailInputDto = {
        to: 'user@example.com',
        template: MailgunTemplateEnum.GINIS_SENT,
        data: {
          formId: 'form-123',
          messageSubject: 'Test Application',
          firstName: 'John',
          slug: 'test-form',
          formSentAt: mockFormSentAt,
        },
      }

      const result = await mailgunHelper.createEmailVariables(input)

      expect(result.applicationName).toBe('Test Application')
      expect(result.firstName).toBe('John')
    })

    it('should process FEEDBACK_LINK type variables correctly', async () => {
      const feedbackLink = 'https://bravo.staffino.com/bratislava/id=WW1hkstR'
      jest
        .spyOn(strapiService, 'getFeedbackLink')
        .mockResolvedValue(feedbackLink)
      const input: SendEmailInputDto = {
        to: 'user@example.com',
        template: MailgunTemplateEnum.GINIS_SUCCESS,
        data: {
          formId: 'form-123',
          messageSubject: 'Test Application',
          firstName: 'John',
          slug: 'stanovisko-k-investicnemu-zameru',
          formSentAt: mockFormSentAt,
        },
      }

      const result = await mailgunHelper.createEmailVariables(input)

      expect(strapiService.getFeedbackLink).toHaveBeenCalledWith(
        'stanovisko-k-investicnemu-zameru',
      )
      expect(result.feedbackLink).toBe(feedbackLink)
    })

    it('should not set FEEDBACK_LINK type variables if the form has no feedback link', async () => {
      jest.spyOn(strapiService, 'getFeedbackLink').mockResolvedValue(null)
      const input: SendEmailInputDto = {
        to: 'user@example.com',
        template: MailgunTemplateEnum.GINIS_SUCCESS,
        data: {
          formId: 'form-123',
          messageSubject: 'Test Application',
          firstName: 'John',
          slug: 'non-existent-form',
          formSentAt: mockFormSentAt,
        },
      }

      const result = await mailgunHelper.createEmailVariables(input)

      expect(result.feedbackLink).toBeUndefined()
    })

    it('should throw if fetching the feedback link fails', async () => {
      const error = new Error('Strapi is down')
      jest.spyOn(strapiService, 'getFeedbackLink').mockRejectedValue(error)
      const input: SendEmailInputDto = {
        to: 'user@example.com',
        template: MailgunTemplateEnum.GINIS_SUCCESS,
        data: {
          formId: 'form-123',
          messageSubject: 'Test Application',
          firstName: 'John',
          slug: 'stanovisko-k-investicnemu-zameru',
          formSentAt: mockFormSentAt,
        },
      }

      await expect(mailgunHelper.createEmailVariables(input)).rejects.toBe(
        error,
      )
    })

    it('should not fetch the feedback link if the template has no FEEDBACK_LINK variable', async () => {
      const getFeedbackLinkSpy = jest.spyOn(strapiService, 'getFeedbackLink')
      const input: SendEmailInputDto = {
        to: 'user@example.com',
        template: MailgunTemplateEnum.GINIS_IN_PROGRESS,
        data: {
          formId: 'form-123',
          messageSubject: 'Test Application',
          firstName: 'John',
          slug: 'stanovisko-k-investicnemu-zameru',
          formSentAt: mockFormSentAt,
        },
      }

      const result = await mailgunHelper.createEmailVariables(input)

      expect(getFeedbackLinkSpy).not.toHaveBeenCalled()
      expect(result.feedbackLink).toBeUndefined()
    })

    it('should handle htmlData in OLO_NEW_SUBMISSION template', async () => {
      const input: SendEmailInputDto = {
        to: 'olo@example.com',
        template: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
        data: {
          formId: 'olo-form-123',
          messageSubject: 'OLO Test Application',
          firstName: null,
          slug: 'olo-form',
          htmlData: '<p>Form HTML data</p>',
          formSentAt: mockFormSentAt,
        },
      }

      const result = await mailgunHelper.createEmailVariables(input)

      expect(result.applicationName).toBe('OLO Test Application')
      expect(result.htmlData).toBe('<p>Form HTML data</p>')
    })

    it('should handle ATTACHMENT_VIRUS template correctly', async () => {
      const input: SendEmailInputDto = {
        to: 'user@example.com',
        template: MailgunTemplateEnum.ATTACHMENT_VIRUS,
        data: {
          formId: 'form-with-virus-123',
          messageSubject: 'Virus Detected',
          firstName: 'Jane',
          slug: 'form-with-virus',
          formSentAt: mockFormSentAt,
        },
      }

      const result = await mailgunHelper.createEmailVariables(input)

      expect(result.applicationName).toBe('Virus Detected')
      expect(result.firstName).toBe('Jane')
      expect(result.slug).toEqual(
        expectStringContaining('/form-with-virus/form-with-virus-123'),
      )
    })
  })

  describe('getFilledTemplate', () => {
    it('should retrieve template and compile it with provided variables', async () => {
      // Mock template response
      const mockTemplate =
        '<p>Hello {{firstName}}, your application {{applicationName}} is being processed.</p>'
      mockMailgunClient.domains.domainTemplates.get.mockResolvedValue({
        version: {
          template: mockTemplate,
        },
      })

      // Mock Handlebars.compile
      const mockCompiledTemplate = jest
        .fn()
        .mockReturnValue(
          '<p>Hello John, your application Test Application is being processed.</p>',
        )
      ;(Handlebars.compile as jest.Mock).mockReturnValue(mockCompiledTemplate)

      const variables = {
        firstName: 'John',
        applicationName: 'Test Application',
      }

      const result = await mailgunHelper.getFilledTemplate(
        'test-template',
        variables,
      )

      // Check if Mailgun client was called with correct parameters
      expect(
        mockMailgunClient.domains.domainTemplates.get,
      ).toHaveBeenCalledWith('test-domain', 'test-template', { active: 'yes' })

      // Check if Handlebars.compile was called with the template
      expect(Handlebars.compile).toHaveBeenCalledWith(mockTemplate)

      // Check if compiled template was called with variables
      expect(mockCompiledTemplate).toHaveBeenCalledWith(variables)

      // Check the result is as expected
      expect(result).toBe(
        '<p>Hello John, your application Test Application is being processed.</p>',
      )
    })

    it('should throw NotFoundException if template not found', async () => {
      // Mock empty template response
      mockMailgunClient.domains.domainTemplates.get.mockResolvedValue({
        version: null,
      })

      await expect(
        mailgunHelper.getFilledTemplate('missing-template', {}),
      ).rejects.toThrow(
        `NotFound: ${MailgunErrorsEnum.TEMPLATE_NOT_FOUND} - ${MailgunErrorsResponseEnum.TEMPLATE_NOT_FOUND}: missing-template`,
      )
    })
  })
})
