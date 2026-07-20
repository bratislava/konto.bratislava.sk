import { Test, TestingModule } from '@nestjs/testing'

import BaConfig from '../config/ba-config'
import BaConfigService from '../config/ba-config.service'
import EnvironmentVariables from '../config/environment-variables'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PdfGeneratorService } from './pdf-generator.service'

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfGeneratorService,
        ThrowerErrorGuard,
        {
          provide: BaConfigService,
          // Real BaConfig.pdfGenerator getter, seeded from the actual env var so
          // CI/Docker's system-installed Chromium (see Dockerfile) is picked up the
          // same way it is in production; falls back to Playwright's bundled
          // Chromium locally when the var is unset.
          useValue: new BaConfig({
            PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          } as EnvironmentVariables),
        },
      ],
    }).compile()

    service = module.get<PdfGeneratorService>(PdfGeneratorService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should generate a PDF buffer without throwing an error', async () => {
    const result = await service.generateFromTemplate(
      'delivery-method-set-to-notification',
      'test.pdf',
      { name: 'test', birthNumber: 'test', email: 'test', date: 'test' },
      'test'
    )

    expect(result).toBeDefined()
    expect(result.data.length).toBeGreaterThan(0)
  }, 30000)

  /**
   * TODO: Implement snapshot testing for generated PDFs.
   * This requires migrating the project to ESM (EcmaScript Modules) or using a
   * dynamic import for 'pdf-to-img', as it no longer supports CommonJS.
   */
})
