import { AccountType, Tier } from 'frontend/dtos/accountDto'
import { useContext } from 'react'

import { SsrAuthContext, SsrAuthContextType } from '../../components/logic/SsrAuthContext'

export const useSsrAuth = () => {
  const ssrAuthContext =
    useContext(SsrAuthContext) ??
    ({ userAttributes: null, isSignedIn: false } satisfies SsrAuthContextType)
  const { userAttributes } = ssrAuthContext
  const tier = userAttributes?.['custom:tier']
  return {
    ...ssrAuthContext,
    accountType: userAttributes?.['custom:account_type'],
    // helper, since we usually determine what to display this way, slightly convoluted because of ts rules & undefined vs boolean
    isLegalEntity: userAttributes?.['custom:account_type']
      ? [AccountType.FyzickaOsobaPodnikatel, AccountType.PravnickaOsoba].includes(
          userAttributes?.['custom:account_type'],
        )
      : false,
    tierStatus: {
      tier,
      isIdentityVerified: tier === Tier.IDENTITY_CARD || tier === Tier.EID,
      isIdentityVerificationNotYetAttempted: !tier || tier === Tier.NEW,
    },
  }
}
