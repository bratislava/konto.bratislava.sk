import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { Interfaces } from 'mailgun.js/definitions'

import { cognitoUserDataFactory } from '../__tests__/factories/cognitoUserData.factory'
import { expectAny, expectObjectContaining } from '../__tests__/jest-matchers'
import BaConfigService from '../config/ba-config.service'
import { PdfGeneratorService } from '../pdf-generator/pdf-generator.service'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { MailgunService } from './mailgun.service'
import { MailgunMessageBuilder } from './mailgun-message.builder'

describe('MailgunService', () => {
  let service: MailgunService
  let cognitoSubservice: CognitoSubservice
  let pdfGeneratorService: PdfGeneratorService

  const mockCreate = jest.fn()

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
  })

  beforeEach(async () => {
    jest.clearAllMocks()
    mockCreate.mockResolvedValue({ id: 'mock-message-id', message: 'Queued' })

    jest.spyOn(console, 'log').mockImplementation(jest.fn())

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailgunService,
        MailgunMessageBuilder,
        { provide: CognitoSubservice, useValue: createMock<CognitoSubservice>() },
        { provide: PdfGeneratorService, useValue: createMock<PdfGeneratorService>() },
        {
          provide: BaConfigService,
          useValue: {
            mailgun: { apiKey: 'test-mailgun-api-key', defaultDomain: 'test.example.com' },
          },
        },
      ],
    }).compile()

    service = module.get<MailgunService>(MailgunService)
    cognitoSubservice = module.get<CognitoSubservice>(CognitoSubservice)
    pdfGeneratorService = module.get<PdfGeneratorService>(PdfGeneratorService)

    // Mock the Mailgun client
    const mgMock = createMock<Interfaces.IMailgunClient>({
      messages: {
        create: mockCreate,
      },
    })
    service['mg'] = mgMock
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendEmail', () => {
    it('should send registration successful email', async () => {
      const options = {
        to: 'test@example.com',
        variables: {
          firstName: 'John',
        },
      }

      await service.sendEmail('2023-registration-successful', options)

      expect(mockCreate).toHaveBeenCalledWith('test.example.com', {
        from: expectAny<string>(String),
        to: 'test@example.com',
        subject: 'Vitajte v Bratislavskom konte',
        template: '2023-registration-successful',
        'h:X-Mailgun-Variables': JSON.stringify(options.variables),
      })
    })

    it('should send identity check successful email', async () => {
      const options = {
        to: 'test@example.com',
        variables: {
          firstName: 'Jane',
        },
      }

      await service.sendEmail('2023-identity-check-successful', options)

      expect(mockCreate).toHaveBeenCalledWith('test.example.com', {
        from: expectAny<string>(String),
        to: 'test@example.com',
        subject: 'Vaša identita v Bratislavskom konte bola overená',
        template: '2023-identity-check-successful',
        'h:X-Mailgun-Variables': JSON.stringify(options.variables),
      })
    })

    it('should send identity check rejected email', async () => {
      const options = {
        to: 'test@example.com',
        variables: {
          firstName: 'Bob',
        },
      }

      await service.sendEmail('2023-identity-check-rejected', options)

      expect(mockCreate).toHaveBeenCalledWith('test.example.com', {
        from: expectAny<string>(String),
        to: 'test@example.com',
        subject: 'Vašu identitu sa v Bratislavskom konte nepodarilo overiť',
        template: '2023-identity-check-rejected',
        'h:X-Mailgun-Variables': JSON.stringify(options.variables),
      })
    })

    it('should handle null firstName gracefully', async () => {
      const options = {
        to: 'test@example.com',
        variables: {
          firstName: null,
        },
      }

      await service.sendEmail('2023-registration-successful', options)

      expect(mockCreate).toHaveBeenCalledWith('test.example.com', {
        from: expectAny<string>(String),
        to: 'test@example.com',
        subject: 'Vitajte v Bratislavskom konte',
        template: '2023-registration-successful',
        'h:X-Mailgun-Variables': JSON.stringify({ firstName: null }),
      })
    })

    it('should not throw error when email sending fails', async () => {
      mockCreate.mockRejectedValue(new Error('Mailgun API error'))

      const options = {
        to: 'test@example.com',
        variables: {
          firstName: 'Test',
        },
      }

      await expect(
        service.sendEmail('2023-registration-successful', options)
      ).resolves.not.toThrow()
    })
  })

  describe('sendEmail with 2025-delivery-method-changed-from-user-data template', () => {
    it('should send eDesk delivery method message without attachment', async () => {
      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue(
        cognitoUserDataFactory({
          given_name: 'John',
          family_name: 'Doe',
        })
      )

      await service.sendEmail('2025-delivery-method-changed-from-user-data', {
        userEmail: 'test@example.com',
        externalId: 'ext-123',
        deliveryMethod: 'edesk',
      })

      expect(cognitoSubservice.getDataFromCognito).toHaveBeenCalledWith('ext-123')
      expect(pdfGeneratorService.generateFromTemplate).not.toHaveBeenCalled()

      expect(mockCreate).toHaveBeenCalledWith('test.example.com', {
        from: expectAny<string>(String),
        to: 'test@example.com',
        subject: 'Váš spôsob doručenia v Bratislavskom konte sa zmenil',
        template: '2025-delivery-method-changed-notify',
        'h:X-Mailgun-Variables': JSON.stringify({
          firstName: 'John',
          year: new Date().getFullYear().toString(),
          deliveryMethod: 'edesk',
        }),
      })
    })

    it('should send postal delivery method message without attachment', async () => {
      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue(
        cognitoUserDataFactory({
          given_name: 'Jane',
          family_name: 'Smith',
        })
      )

      await service.sendEmail('2025-delivery-method-changed-from-user-data', {
        userEmail: 'jane@example.com',
        externalId: 'ext-456',
        deliveryMethod: 'postal',
      })

      expect(pdfGeneratorService.generateFromTemplate).not.toHaveBeenCalled()

      expect(mockCreate).toHaveBeenCalledWith('test.example.com', {
        from: expectAny<string>(String),
        to: 'jane@example.com',
        subject: 'Váš spôsob doručenia v Bratislavskom konte sa zmenil',
        template: '2025-delivery-method-changed-notify',
        'h:X-Mailgun-Variables': JSON.stringify({
          firstName: 'Jane',
          year: new Date().getFullYear().toString(),
          deliveryMethod: 'postal',
        }),
      })
    })

    it('should send email delivery method message with PDF attachment', async () => {
      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue(
        cognitoUserDataFactory({
          given_name: 'Alice',
          family_name: 'Johnson',
        })
      )

      const mockPdf = {
        data: Buffer.from('mock-pdf-content'),
        filename: 'oznamenie.pdf',
        contentType: 'application/pdf',
      }

      jest.spyOn(pdfGeneratorService, 'generateFromTemplate').mockResolvedValue(mockPdf)

      await service.sendEmail('2025-delivery-method-changed-from-user-data', {
        userEmail: 'alice@example.com',
        externalId: 'ext-789',
        birthNumber: '1234567890',
        deliveryMethod: 'email',
      })

      expect(pdfGeneratorService.generateFromTemplate).toHaveBeenCalledWith(
        'delivery-method-set-to-notification',
        'oznamenie.pdf',
        {
          email: 'alice@example.com',
          name: 'Alice Johnson',
          birthNumber: '1234567890',
          date: expectAny<string>(String),
        },
        '1234567890'
      )

      expect(mockCreate).toHaveBeenCalledWith('test.example.com', {
        from: expectAny<string>(String),
        to: 'alice@example.com',
        subject: 'Váš spôsob doručenia v Bratislavskom konte sa zmenil',
        template: '2025-delivery-method-changed-notify',
        'h:X-Mailgun-Variables': JSON.stringify({
          firstName: 'Alice',
          year: new Date().getFullYear().toString(),
          deliveryMethod: 'email',
        }),
        attachment: mockPdf,
      })
    })

    it('should send email delivery method message without PDF when birthNumber is missing', async () => {
      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue(
        cognitoUserDataFactory({
          given_name: 'Bob',
          family_name: 'Brown',
        })
      )

      await service.sendEmail('2025-delivery-method-changed-from-user-data', {
        userEmail: 'bob@example.com',
        externalId: 'ext-999',
        deliveryMethod: 'email',
      })

      expect(pdfGeneratorService.generateFromTemplate).not.toHaveBeenCalled()

      expect(mockCreate).toHaveBeenCalledWith('test.example.com', {
        from: expectAny<string>(String),
        to: 'bob@example.com',
        subject: 'Váš spôsob doručenia v Bratislavskom konte sa zmenil',
        template: '2025-delivery-method-changed-notify',
        'h:X-Mailgun-Variables': JSON.stringify({
          firstName: 'Bob',
          year: new Date().getFullYear().toString(),
          deliveryMethod: 'email',
        }),
      })
    })

    it('should handle null firstName from Cognito', async () => {
      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue(
        cognitoUserDataFactory({
          given_name: undefined,
          family_name: 'Doe',
        })
      )

      await service.sendEmail('2025-delivery-method-changed-from-user-data', {
        userEmail: 'test@example.com',
        externalId: 'ext-000',
        deliveryMethod: 'edesk',
      })

      expect(mockCreate).toHaveBeenCalledWith(
        'test.example.com',
        expectObjectContaining({
          'h:X-Mailgun-Variables': JSON.stringify({
            firstName: null,
            year: new Date().getFullYear().toString(),
            deliveryMethod: 'edesk',
          }),
        })
      )
    })
  })
})
