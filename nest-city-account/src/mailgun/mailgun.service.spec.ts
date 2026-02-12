import { Test, TestingModule } from '@nestjs/testing'
import { MailgunService } from './mailgun.service'
import { MailgunMessageBuilder } from './mailgun-message.builder'
import { noop } from 'lodash'

describe('MailgunService', () => {
  let service: MailgunService

  const ORIGINAL_ENV = process.env

  beforeAll(() => {
    process.env = { ...ORIGINAL_ENV }
    process.env.MAILGUN_API_KEY = 'test-mailgun-api-key'
    process.env.DEFAULT_MAILGUN_DOMAIN = 'test.example.com'
  })

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(noop)

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailgunService, MailgunMessageBuilder],
    }).compile()

    service = module.get<MailgunService>(MailgunService)
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // TODO tests
})
