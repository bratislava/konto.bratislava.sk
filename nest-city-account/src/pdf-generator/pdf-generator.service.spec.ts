import { Test, TestingModule } from '@nestjs/testing'
import { PdfGeneratorService } from './pdf-generator.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfGeneratorService, ThrowerErrorGuard],
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
