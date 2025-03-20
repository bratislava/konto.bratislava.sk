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

  const getPolicyName = (policy: FormSendPolicy): string => {
    return FormSendPolicy[policy]
  }

  const getAccountTypeName = (accountType: SendPolicyAccountType): string => {
    return SendPolicyAccountType[accountType]
  }

  testCases.forEach(({ policy, accountType, expectedResult }) => {
    test(`${getPolicyName(policy)} policy with ${getAccountTypeName(accountType)} account`, () => {
      const result = evaluateFormSendPolicy(policy, accountType)

      expect(result).toEqual(expectedResult)
    })
  })

  test('All combinations of FormSendPolicy and SendPolicyAccountType should be covered in testcases', () => {
    const allPolicies = Object.values(FormSendPolicy).filter(
      (value): value is number => typeof value === 'number',
    )
    const allAccountTypes = Object.values(SendPolicyAccountType).filter(
      (value): value is number => typeof value === 'number',
    )
    const allCombinations = allPolicies.flatMap((policy) =>
      allAccountTypes.map((accountType) => ({
        policy,
        accountType,
      })),
    )

    const uncoveredCombinations = []

    for (const combo of allCombinations) {
      const isCovered = testCases.some(
        (testCase) =>
          testCase.policy === combo.policy && testCase.accountType === combo.accountType,
      )

      if (!isCovered) {
        uncoveredCombinations.push(combo)
      }
    }

    if (uncoveredCombinations.length > 0) {
      const uncoveredDetails = uncoveredCombinations
        .map(
          ({ policy, accountType }) =>
            `${FormSendPolicy[policy]} with ${SendPolicyAccountType[accountType]}`,
        )
        .join(', ')

      throw new Error(`Some policy combinations are not covered in testcases: ${uncoveredDetails}`)
    }

    expect(uncoveredCombinations.length).toBe(0)
  })
})
