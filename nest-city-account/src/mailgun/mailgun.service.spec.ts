import { Test, TestingModule } from '@nestjs/testing'
import { MailgunService } from './mailgun.service'
import { MailgunMessageBuilder } from './mailgun-message-builder'
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module'

describe('MailgunService', () => {
  let service: MailgunService

  const ORIGINAL_ENV = process.env

  beforeAll(() => {
    process.env = { ...ORIGINAL_ENV }
    process.env.MAILGUN_API_KEY = 'test-mailgun-api-key'
    process.env.DEFAULT_MAILGUN_DOMAIN = 'test.example.com'
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailgunService, MailgunMessageBuilder],
      imports: [PdfGeneratorModule],
    }).compile()

    service = module.get<MailgunService>(MailgunService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // TODO tests
})
