/* eslint-disable pii/no-email */
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'
import Handlebars from 'handlebars'

import { SendEmailInputDto } from '../../../../global-dtos/mailgun.dto'
import {
  MailgunErrorsEnum,
  MailgunErrorsResponseEnum,
} from '../../../../global-enums/mailgun.errors.enum'
import ThrowerErrorGuard from '../../../../guards/thrower-error.guard'
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
  let configService: ConfigService
  let throwerErrorGuard: ThrowerErrorGuard

  beforeEach(async () => {
    // Set environment variables needed for constructor
    process.env.MAILGUN_API_KEY = 'test-api-key'
    process.env.MAILGUN_HOST = 'test-host'
    process.env.MAILGUN_EMAIL_FROM = 'test@example.com'
    process.env.MAILGUN_DOMAIN = 'test-domain'

    process.env.FRONTEND_URL = 'https://konto.test.sk'

    const moduleRef = await Test.createTestingModule({
      providers: [
        MailgunHelper,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const values = {
                MAILGUN_API_KEY: 'test-api-key',
                MAILGUN_HOST: 'test-host',
                MAILGUN_EMAIL_FROM: 'test@example.com',
                MAILGUN_DOMAIN: 'test-domain',
                FRONTEND_URL: 'https://konto.test.sk',
              }
              if (!values[key as keyof typeof values]) {
                throw new Error(`Missing env: ${key}`)
              }
              return values[key as keyof typeof values]
            }),
          },
        },
        {
          provide: ThrowerErrorGuard,
          useValue: {
            NotFoundException: jest
              .fn()
              .mockImplementation((enum1, message) => {
                throw new Error(`NotFound: ${enum1} - ${message}`)
              }),
          },
        },
      ],
    }).compile()

    mailgunHelper = moduleRef.get<MailgunHelper>(MailgunHelper)
    configService = moduleRef.get<ConfigService>(ConfigService)
    throwerErrorGuard = moduleRef.get<ThrowerErrorGuard>(ThrowerErrorGuard)
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete process.env.MAILGUN_API_KEY
    delete process.env.MAILGUN_HOST
    delete process.env.MAILGUN_EMAIL_FROM
    delete process.env.MAILGUN_DOMAIN
    delete process.env.FRONTEND_URL
  })

  describe('constructor', () => {
    it('should throw error if environment variables are missing', () => {
      delete process.env.MAILGUN_API_KEY
      expect(() => new MailgunHelper(throwerErrorGuard, configService)).toThrow(
        'Missing mailgun env, one of: MAILGUN_API_KEY, MAILGUN_HOST, MAILGUN_EMAIL_FROM, MAILGUN_DOMAIN',
      )
    })

    it('should initialize mailgunClient correctly', () => {
      expect(mailgunHelper.mailgunClient).toBeDefined()
    })
  })

  describe('createEmailVariables', () => {
    const mockFormSentAt = new Date('2026-02-11T12:00:00.000Z')

    it('should process PARAMETER type variables correctly', () => {
      const input: SendEmailInputDto = {
        to: 'user@example.com',
        template: MailgunTemplateEnum.NASES_SENT,
        data: {
          formId: 'form-123',
          messageSubject: 'Test Application',
          firstName: 'John',
          slug: 'test-form',
          formSentAt: mockFormSentAt,
        },
      }

      const result = MailgunHelper.createEmailVariables(input)

      expect(result.applicationName).toBe('Test Application')
      expect(result.firstName).toBe('John')
    })

    it('should process SELECT type variables correctly', () => {
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

      const result = MailgunHelper.createEmailVariables(input)

      expect(result.feedbackLink).toBe(
        'https://bravo.staffino.com/bratislava/id=WW1hkstR',
      )
    })

    it('should not set SELECT type variables if slug does not match', () => {
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

      const result = MailgunHelper.createEmailVariables(input)

      expect(result.feedbackLink).toBeUndefined()
    })

    it('should handle htmlData in OLO_NEW_SUBMISSION template', () => {
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

      const result = MailgunHelper.createEmailVariables(input)

      expect(result.applicationName).toBe('OLO Test Application')
      // eslint-disable-next-line xss/no-mixed-html
      expect(result.htmlData).toBe('<p>Form HTML data</p>')
    })

    it('should handle ATTACHMENT_VIRUS template correctly', () => {
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

      const result = MailgunHelper.createEmailVariables(input)

      expect(result.applicationName).toBe('Virus Detected')
      expect(result.firstName).toBe('Jane')
      expect(result.slug).toEqual(
        expect.stringContaining('/form-with-virus/form-with-virus-123'),
      )
    })
  })

  describe('getFilledTemplate', () => {
    it('should retrieve template and compile it with provided variables', async () => {
      // Mock template response
      // eslint-disable-next-line xss/no-mixed-html
      const mockTemplate =
        '<p>Hello {{firstName}}, your application {{applicationName}} is being processed.</p>'
      mockMailgunClient.domains.domainTemplates.get.mockResolvedValue({
        version: {
          template: mockTemplate,
        },
      })

      // Mock Handlebars.compile
      // eslint-disable-next-line xss/no-mixed-html
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
      // eslint-disable-next-line xss/no-mixed-html
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
/* eslint-enable pii/no-email */
