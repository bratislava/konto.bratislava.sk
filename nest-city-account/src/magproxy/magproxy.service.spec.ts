import { Test, TestingModule } from '@nestjs/testing'
import ThrowerErrorGuard, { ErrorMessengerGuard } from '../utils/guards/errors.guard'
import { MagproxyService } from './magproxy.service'
import ClientsService from '../clients/clients.service'
import { createMock } from '@golevelup/ts-jest'

describe('MagproxyService', () => {
  let service: MagproxyService

  beforeAll(() => {
    process.env = {
      ...process.env,
      MAGPROXY_URL: 'https://mock-new-magproxy.bratislava.sk',
      MAGPROXY_AZURE_AD_URL:
        'https://mock-login.microsoftonline.com/mock-azure-ad-id/oauth2/v2.0/token',
      MAGPROXY_AZURE_CLIENT_ID: 'mock-magproxy-azure-client-id',
      MAGPROXY_AZURE_CLIENT_SECRET: 'mock-magproxy-azure-secret',
      MAGPROXY_AZURE_SCOPE: 'api://mock-azure-scope/.default',
    }
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MagproxyService,
        ThrowerErrorGuard,
        ErrorMessengerGuard,
        { provide: ClientsService, useValue: createMock<ClientsService>() },
      ],
    }).compile()

    service = module.get<MagproxyService>(MagproxyService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
