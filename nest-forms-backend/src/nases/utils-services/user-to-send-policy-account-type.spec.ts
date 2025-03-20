import { SendPolicyAccountType } from 'forms-shared/send-policy/sendPolicy'

import { CognitoGetUserData } from '../../auth/dtos/cognito.dto'
import { Tier } from '../../utils/global-enums/city-account.enum'
import userToSendPolicyAccountType from './user-to-send-policy-account-type'

describe('userToSendPolicyAccountType', () => {
  it('should return NotAuthenticated when user is undefined', () => {
    expect(userToSendPolicyAccountType()).toBe(
      SendPolicyAccountType.NotAuthenticated,
    )
  })

  it('should return NotAuthenticated when user has no idUser', () => {
    const user = {} as CognitoGetUserData
    expect(userToSendPolicyAccountType(user)).toBe(
      SendPolicyAccountType.NotAuthenticated,
    )
  })

  it('should return AuthenticatedVerified when user has IDENTITY_CARD tier', () => {
    const user = {
      idUser: 'test-id',
      'custom:tier': Tier.IDENTITY_CARD,
    } as CognitoGetUserData

    expect(userToSendPolicyAccountType(user)).toBe(
      SendPolicyAccountType.AuthenticatedVerified,
    )
  })

  it('should return AuthenticatedVerified when user has EID tier', () => {
    const user = {
      idUser: 'test-id',
      'custom:tier': Tier.EID,
    } as CognitoGetUserData

    expect(userToSendPolicyAccountType(user)).toBe(
      SendPolicyAccountType.AuthenticatedVerified,
    )
  })

  it('should return AuthenticatedNotVerified when user has other tier', () => {
    const user = {
      idUser: 'test-id',
      'custom:tier': Tier.NEW,
    } as CognitoGetUserData

    expect(userToSendPolicyAccountType(user)).toBe(
      SendPolicyAccountType.AuthenticatedNotVerified,
    )
  })

  it('should return AuthenticatedNotVerified when user has no tier', () => {
    const user = {
      idUser: 'test-id',
    } as CognitoGetUserData

    expect(userToSendPolicyAccountType(user)).toBe(
      SendPolicyAccountType.AuthenticatedNotVerified,
    )
  })
})
