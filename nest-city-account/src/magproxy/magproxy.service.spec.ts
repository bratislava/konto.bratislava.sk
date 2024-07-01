import { Test, TestingModule } from '@nestjs/testing';
import { ErrorMessengerGuard, ErrorThrowerGuard } from '../utils/guards/errors.guard';
import { MagproxyService } from './magproxy.service';

describe('MagproxyService', () => {
  let service: MagproxyService;

  beforeAll(() => {
    process.env = {
      ...process.env, 
      MAGPROXY_URL: "https://new-magproxy.bratislava.sk",
      MAGPROXY_AZURE_AD_URL: "https://login.microsoftonline.com/fe69e74e-1e66-4fcb-99c5-58e4a2d2a063/oauth2/v2.0/token",
      MAGPROXY_AZURE_CLIENT_ID: "ec200915-180f-448b-b135-1a24d5189953",
      MAGPROXY_AZURE_CLIENT_SECRET: "secret",
      MAGPROXY_AZURE_SCOPE: "api://ec200915-180f-448b-b135-1a24d5189953/.default"
    }
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MagproxyService, ErrorThrowerGuard, ErrorMessengerGuard],
    }).compile();

    service = module.get<MagproxyService>(MagproxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
