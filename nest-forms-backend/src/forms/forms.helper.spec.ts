import { Test } from '@nestjs/testing'
import { FormError, Forms, FormState } from '@prisma/client'

import { ResponseGdprDataDto } from '../nases/dtos/responses.dto'
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

  describe('userCanSendForm', () => {
    it('should return true when form is owned by company and ICO matches', () => {
      const form = { ico: '12345' } as Forms
      const userInfo = { ico: '12345' } as ResponseGdprDataDto
      expect(helper.userCanSendForm(form, false, userInfo)).toBe(true)
    })

    it('should return false when form is owned by company and ICO does not match', () => {
      const form = { ico: '12345' } as Forms
      const userInfo = { ico: '67890' } as ResponseGdprDataDto
      expect(helper.userCanSendForm(form, false, userInfo)).toBe(false)
    })

    it('should return true when form is owned by user and userSub matches', () => {
      const form = { userExternalId: 'user123' } as Forms
      expect(helper.userCanSendForm(form, false, undefined, 'user123')).toBe(
        true,
      )
    })

    it('should return false when form is owned by user and userSub does not match', () => {
      const form = { userExternalId: 'user123' } as Forms
      expect(helper.userCanSendForm(form, false, undefined, 'user456')).toBe(
        false,
      )
    })

    it('should return true when form is not owned and allowSendingByUnverifiedUsers is true', () => {
      const form = { ico: null, userExternalId: null } as Forms
      expect(helper.userCanSendForm(form, true)).toBe(true)
    })

    it('should return false when form is not owned and allowSendingByUnverifiedUsers is false', () => {
      const form = { ico: null, userExternalId: null } as Forms
      expect(helper.userCanSendForm(form, false)).toBe(false)
    })
  })
})
