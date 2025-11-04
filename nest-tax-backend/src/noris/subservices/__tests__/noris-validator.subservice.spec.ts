import { todo } from 'node:test'

import { Test, TestingModule } from '@nestjs/testing'

import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { NorisValidatorSubservice } from '../noris-validator.subservice'

describe('NorisValidatorSubservice', () => {
  let service: NorisValidatorSubservice

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NorisValidatorSubservice, ThrowerErrorGuard],
    }).compile()
    service = module.get<NorisValidatorSubservice>(NorisValidatorSubservice)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateNorisData', () => {
    todo('check if it alerts in grafana')
  })
})
