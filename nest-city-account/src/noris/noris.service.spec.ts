import { Test, TestingModule } from '@nestjs/testing'
import { NorisService } from './noris.service'

describe('NorisService', () => {
  let service: NorisService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NorisService],
    }).compile()

    service = module.get<NorisService>(NorisService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
