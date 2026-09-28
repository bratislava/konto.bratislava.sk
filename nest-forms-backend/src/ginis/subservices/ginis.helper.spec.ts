import { HttpException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import FormsService from '../../forms/forms.service'
import { Forms } from '../../generated/prisma/client'
import GinisHelper from './ginis.helper'

vi.mock('../../forms/forms.service')

describe('GinisHelper', () => {
  let helper: GinisHelper
  const { console } = global

  beforeEach(async () => {
    vi.resetAllMocks()

    global.console = {
      ...console,
      log: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [GinisHelper, FormsService],
    }).compile()

    helper = module.get<GinisHelper>(GinisHelper)

    Object.defineProperty(helper, 'logger', {
      value: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    })
  })

  afterEach(() => {
    global.console = console
  })

  it('should be defined', () => {
    expect(helper).toBeDefined()
  })

  describe('setFormToError', () => {
    it('should just call update form', async () => {
      const spy = vi
        .spyOn(helper['formsService'], 'updateForm')
        .mockImplementation(async () => Promise.resolve({} as Forms))
      await helper.setFormToError('sss')

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should be okay even if update form fails because of nonexistent id', async () => {
      const spy = vi
        .spyOn(helper['formsService'], 'updateForm')
        .mockRejectedValue(new HttpException('response', 500))
      await helper.setFormToError('sss')
      // No exception here - the result is ignored, just logged

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})
