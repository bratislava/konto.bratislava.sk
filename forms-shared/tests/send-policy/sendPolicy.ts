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
        send: {
          possible: true,
          allowedForUser: true,
          allowedForUserResult: SendAllowedForUserResult.Allowed,
        },
        eidSend: {
          possible: false,
        },
      },
    },
    {
      policy: FormSendPolicy.NotAuthenticated,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: true,
          allowedForUserResult: SendAllowedForUserResult.Allowed,
        },
        eidSend: {
          possible: false,
        },
      },
    },
    {
      policy: FormSendPolicy.NotAuthenticated,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: true,
          allowedForUserResult: SendAllowedForUserResult.Allowed,
        },
        eidSend: {
          possible: false,
        },
      },
    },
    {
      policy: FormSendPolicy.AuthenticatedNotVerified,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: false,
          allowedForUserResult: SendAllowedForUserResult.AuthenticationMissing,
        },
        eidSend: {
          possible: false,
        },
      },
    },
    {
      policy: FormSendPolicy.AuthenticatedNotVerified,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: true,
          allowedForUserResult: SendAllowedForUserResult.Allowed,
        },
        eidSend: {
          possible: false,
        },
      },
    },
    {
      policy: FormSendPolicy.AuthenticatedNotVerified,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: true,
          allowedForUserResult: SendAllowedForUserResult.Allowed,
        },
        eidSend: {
          possible: false,
        },
      },
    },
    {
      policy: FormSendPolicy.AuthenticatedVerified,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: false,
          allowedForUserResult: SendAllowedForUserResult.AuthenticationAndVerificationMissing,
        },
        eidSend: {
          possible: false,
        },
      },
    },
    {
      policy: FormSendPolicy.AuthenticatedVerified,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: false,
          allowedForUserResult: SendAllowedForUserResult.VerificationMissing,
        },
        eidSend: {
          possible: false,
        },
      },
    },
    {
      policy: FormSendPolicy.AuthenticatedVerified,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: true,
          allowedForUserResult: SendAllowedForUserResult.Allowed,
        },
        eidSend: {
          possible: false,
        },
      },
    },
    {
      policy: FormSendPolicy.EidOrNotAuthenticated,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: true,
          allowedForUserResult: SendAllowedForUserResult.Allowed,
        },
        eidSend: {
          possible: true,
        },
      },
    },
    {
      policy: FormSendPolicy.EidOrNotAuthenticated,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: true,
          allowedForUserResult: SendAllowedForUserResult.Allowed,
        },
        eidSend: {
          possible: true,
        },
      },
    },
    {
      policy: FormSendPolicy.EidOrNotAuthenticated,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: true,
          allowedForUserResult: SendAllowedForUserResult.Allowed,
        },
        eidSend: {
          possible: true,
        },
      },
    },
    {
      policy: FormSendPolicy.EidOrAuthenticatedNotVerified,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: false,
          allowedForUserResult: SendAllowedForUserResult.AuthenticationMissing,
        },
        eidSend: {
          possible: true,
        },
      },
    },
    {
      policy: FormSendPolicy.EidOrAuthenticatedNotVerified,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: true,
          allowedForUserResult: SendAllowedForUserResult.Allowed,
        },
        eidSend: {
          possible: true,
        },
      },
    },
    {
      policy: FormSendPolicy.EidOrAuthenticatedNotVerified,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: true,
          allowedForUserResult: SendAllowedForUserResult.Allowed,
        },
        eidSend: {
          possible: true,
        },
      },
    },
    {
      policy: FormSendPolicy.EidOrAuthenticatedVerified,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: false,
          allowedForUserResult: SendAllowedForUserResult.AuthenticationAndVerificationMissing,
        },
        eidSend: {
          possible: true,
        },
      },
    },
    {
      policy: FormSendPolicy.EidOrAuthenticatedVerified,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: false,
          allowedForUserResult: SendAllowedForUserResult.VerificationMissing,
        },
        eidSend: {
          possible: true,
        },
      },
    },
    {
      policy: FormSendPolicy.EidOrAuthenticatedVerified,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        send: {
          possible: true,
          allowedForUser: true,
          allowedForUserResult: SendAllowedForUserResult.Allowed,
        },
        eidSend: {
          possible: true,
        },
      },
    },
    {
      policy: FormSendPolicy.EidSigned,
      accountType: SendPolicyAccountType.NotAuthenticated,
      expectedResult: {
        send: {
          possible: false,
          allowedForUser: false,
          allowedForUserResult: SendAllowedForUserResult.NotPossible,
        },
        eidSend: {
          possible: true,
        },
      },
    },
    {
      policy: FormSendPolicy.EidSigned,
      accountType: SendPolicyAccountType.AuthenticatedNotVerified,
      expectedResult: {
        send: {
          possible: false,
          allowedForUser: false,
          allowedForUserResult: SendAllowedForUserResult.NotPossible,
        },
        eidSend: {
          possible: true,
        },
      },
    },
    {
      policy: FormSendPolicy.EidSigned,
      accountType: SendPolicyAccountType.AuthenticatedVerified,
      expectedResult: {
        send: {
          possible: false,
          allowedForUser: false,
          allowedForUserResult: SendAllowedForUserResult.NotPossible,
        },
        eidSend: {
          possible: true,
        },
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
