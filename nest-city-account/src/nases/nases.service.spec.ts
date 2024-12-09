import { Test, TestingModule } from '@nestjs/testing'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { NasesService } from './nases.service'

// TODO missing all tests
describe('NasesService', () => {
  let service: NasesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NasesService, ThrowerErrorGuard],
    }).compile()

    service = module.get<NasesService>(NasesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
