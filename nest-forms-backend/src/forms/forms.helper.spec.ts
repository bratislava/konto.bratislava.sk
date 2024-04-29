import { Test } from '@nestjs/testing'

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

  // TODO update this

  // describe('userCanSendForm', () => {
  //   const formWithoutUriAndUser = {
  //     mainUri: null,
  //     actorUri: null,
  //     userExternalId: null,
  //     ico: null,
  //   } as Forms
  //   const form = {
  //     mainUri: 'uri',
  //     actorUri: 'actorUri',
  //     userExternalId: 'user',
  //     ico: null,
  //   } as Forms

  //   it('should be false if user is undefined', () => {
  //     expect(helper.userCanSendForm(form, { ico: '000000', birthNumber: '00000', createdAt: '2022' }, null)).toBeFalsy()
  //   })

  //   it('should be false if the form is not owned by anyone', () => {
  // eslint-disable-next-line no-secrets/no-secrets
  //     expect(helper.userCanSendForm(formWithoutUriAndUser, 'user')).toBeFalsy()
  //   })

  //   it('should be true if uri is set and the user matches', () => {
  //     expect(helper.userCanSendForm(form, null, 'user')).toBeTruthy()
  //   })
  // })
})
