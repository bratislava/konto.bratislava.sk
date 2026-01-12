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
})
