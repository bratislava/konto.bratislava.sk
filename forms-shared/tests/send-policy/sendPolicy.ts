import { describe, expect, test } from 'vitest'
import {
  evaluateFormSendPolicy,
  FormSendPolicy,
  SendAllowedForUserResult,
  SendPolicyAccountType,
} from '../../src/send-policy/sendPolicy'

describe('SendPolicy', () => {
  const testCases = [
    {
      policy: FormSendPolicy.NotAuthenticated,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: true,
        sendAllowedForUserResult: SendAllowedForUserResult.Allowed,
        eidSendPossible: false,
      },
    },
    {
      policy: FormSendPolicy.NotAuthenticated,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: true,
        sendAllowedForUserResult: SendAllowedForUserResult.Allowed,
        eidSendPossible: false,
      },
    },
    {
      policy: FormSendPolicy.NotAuthenticated,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: true,
        sendAllowedForUserResult: SendAllowedForUserResult.Allowed,
        eidSendPossible: false,
      },
    },
    {
      policy: FormSendPolicy.AuthenticatedNotVerified,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: false,
        sendAllowedForUserResult: SendAllowedForUserResult.AuthenticationMissing,
        eidSendPossible: false,
      },
    },
    {
      policy: FormSendPolicy.AuthenticatedNotVerified,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: true,
        sendAllowedForUserResult: SendAllowedForUserResult.Allowed,
        eidSendPossible: false,
      },
    },
    {
      policy: FormSendPolicy.AuthenticatedNotVerified,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: true,
        sendAllowedForUserResult: SendAllowedForUserResult.Allowed,
        eidSendPossible: false,
      },
    },
    {
      policy: FormSendPolicy.AuthenticatedVerified,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: false,
        sendAllowedForUserResult: SendAllowedForUserResult.AuthenticationAndVerificationMissing,
        eidSendPossible: false,
      },
    },
    {
      policy: FormSendPolicy.AuthenticatedVerified,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: false,
        sendAllowedForUserResult: SendAllowedForUserResult.VerificationMissing,
        eidSendPossible: false,
      },
    },
    {
      policy: FormSendPolicy.AuthenticatedVerified,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: true,
        sendAllowedForUserResult: SendAllowedForUserResult.Allowed,
        eidSendPossible: false,
      },
    },
    {
      policy: FormSendPolicy.EidOrNotAuthenticated,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: true,
        sendAllowedForUserResult: SendAllowedForUserResult.Allowed,
        eidSendPossible: true,
      },
    },
    {
      policy: FormSendPolicy.EidOrNotAuthenticated,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: true,
        sendAllowedForUserResult: SendAllowedForUserResult.Allowed,
        eidSendPossible: true,
      },
    },
    {
      policy: FormSendPolicy.EidOrNotAuthenticated,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: true,
        sendAllowedForUserResult: SendAllowedForUserResult.Allowed,
        eidSendPossible: true,
      },
    },
    {
      policy: FormSendPolicy.EidOrAuthenticatedNotVerified,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: false,
        sendAllowedForUserResult: SendAllowedForUserResult.AuthenticationMissing,
        eidSendPossible: true,
      },
    },
    {
      policy: FormSendPolicy.EidOrAuthenticatedNotVerified,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: true,
        sendAllowedForUserResult: SendAllowedForUserResult.Allowed,
        eidSendPossible: true,
      },
    },
    {
      policy: FormSendPolicy.EidOrAuthenticatedNotVerified,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: true,
        sendAllowedForUserResult: SendAllowedForUserResult.Allowed,
        eidSendPossible: true,
      },
    },
    {
      policy: FormSendPolicy.EidOrAuthenticatedVerified,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: false,
        sendAllowedForUserResult: SendAllowedForUserResult.AuthenticationAndVerificationMissing,
        eidSendPossible: true,
      },
    },
    {
      policy: FormSendPolicy.EidOrAuthenticatedVerified,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: false,
        sendAllowedForUserResult: SendAllowedForUserResult.VerificationMissing,
        eidSendPossible: true,
      },
    },
    {
      policy: FormSendPolicy.EidOrAuthenticatedVerified,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        sendPossible: true,
        sendAllowedForUser: true,
        sendAllowedForUserResult: SendAllowedForUserResult.Allowed,
        eidSendPossible: true,
      },
    },
    {
      policy: FormSendPolicy.EidSigned,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        sendPossible: false,
        sendAllowedForUser: false,
        sendAllowedForUserResult: SendAllowedForUserResult.NotPossible,
        eidSendPossible: true,
      },
    },
    {
      policy: FormSendPolicy.EidSigned,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        sendPossible: false,
        sendAllowedForUser: false,
        sendAllowedForUserResult: SendAllowedForUserResult.NotPossible,
        eidSendPossible: true,
      },
    },
    {
      policy: FormSendPolicy.EidSigned,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        sendPossible: false,
        sendAllowedForUser: false,
        sendAllowedForUserResult: SendAllowedForUserResult.NotPossible,
        eidSendPossible: true,
      },
    },
  ]

  testCases.forEach(({ policy, accountType, expectedResult }) => {
    test(`policy ${policy} with account ${accountType}`, () => {
      const result = evaluateFormSendPolicy(policy, accountType)

      expect(result).toEqual(expectedResult)
    })
  })

  test('All combinations of FormSendPolicy and SendPolicyAccountType should be covered in testcases', () => {
    const allCombinations = Object.values(FormSendPolicy).flatMap((policy) =>
      Object.values(SendPolicyAccountType).map((accountType) => ({
        policy,
        accountType,
      })),
    )

    const uncoveredCombinations = allCombinations.filter(
      (combo) =>
        !testCases.some(
          (testCase) =>
            testCase.policy === combo.policy && testCase.accountType === combo.accountType,
        ),
    )

    if (uncoveredCombinations.length > 0) {
      const uncoveredDetails = uncoveredCombinations
        .map(({ policy, accountType }) => `${policy} with ${accountType}`)
        .join(', ')

      throw new Error(`Some policy combinations are not covered in testcases: ${uncoveredDetails}`)
    }

    expect(uncoveredCombinations.length).toBe(0)
  })
})
