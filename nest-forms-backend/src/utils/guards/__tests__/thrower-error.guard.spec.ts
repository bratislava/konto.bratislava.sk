import { Test, TestingModule } from '@nestjs/testing'

import { ErrorsEnum } from '../../global-enums/errors.enum'
import { ErrorSymbols, ResponseErrorDto } from '../dtos/error.dto'
import ThrowerErrorGuard from '../thrower-error.guard'

describe('ThrowerErrorGuard', () => {
  let guard: ThrowerErrorGuard

  beforeEach(async () => {
    jest.resetAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      providers: [ThrowerErrorGuard],
    }).compile()

    guard = app.get<ThrowerErrorGuard>(ThrowerErrorGuard)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  describe('alerting', () => {
    it('should alert', () => {
      const result = guard
        .BadRequestException(ErrorsEnum.DATABASE_ERROR, 'Some message')
        .getResponse() as ResponseErrorDto

      expect(result[ErrorSymbols.alert]).toBe(1)
    })

    it('should not alert', () => {
      const result = guard
        .BadRequestException(ErrorsEnum.NOT_FOUND_ERROR, 'Some message')
        .getResponse() as ResponseErrorDto

      expect(result[ErrorSymbols.alert]).toBe(0)
    })
  })
})
