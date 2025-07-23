import { Test } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'

// import { Forms } from '@prisma/client'
import FormsHelper from './forms.helper'

describe('FormsHelper', () => {
  let helper: FormsHelper

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [FormsHelper],
    }).compile()

    helper = app.get<FormsHelper>(FormsHelper)
  })

  it('should be defined', () => {
    expect(helper).toBeDefined()
  })

  describe('isEditable', () => {
    it('should return true', () => {
      expect(
        FormsHelper.isEditable({ state: FormState.DRAFT } as Forms),
      ).toBeTruthy()
      expect(
        FormsHelper.isEditable({
          state: FormState.ERROR,
          error: FormError.INFECTED_FILES,
        } as Forms),
      ).toBeTruthy()
    })

    it('should return false', () => {
      expect(
        FormsHelper.isEditable({ state: FormState.PROCESSING } as Forms),
      ).toBeFalsy()
      expect(
        FormsHelper.isEditable({ state: FormState.FINISHED } as Forms),
      ).toBeFalsy()
      expect(
        FormsHelper.isEditable({ state: FormState.QUEUED } as Forms),
      ).toBeFalsy()
      expect(
        FormsHelper.isEditable({
          state: FormState.ERROR,
          error: FormError.NASES_SEND_ERROR,
        } as Forms),
      ).toBeFalsy()
    })
  })
})
