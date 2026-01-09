import { AccountType, Tier } from 'frontend/dtos/accountDto'
import { useContext } from 'react'

import { SsrAuthContext } from '../../components/logic/SsrAuthContext'

export const useSsrAuth = () => {
  const ssrAuthContext = useContext(SsrAuthContext)
  if (!ssrAuthContext) {
    throw new Error('useSsrAuth must be used within a SsrAuthProviderHOC')
  }

  const { userAttributes } = ssrAuthContext
  const tier = userAttributes?.['custom:tier']
  const accountType = userAttributes?.['custom:account_type']

  return {
    ...ssrAuthContext,
    accountType,
    isLegalEntity:
      accountType === AccountType.FyzickaOsobaPodnikatel ||
      accountType === AccountType.PravnickaOsoba,
    tierStatus: {
      tier,
      isIdentityVerificationNotYetAttempted: !tier || tier === Tier.NEW,
      isInQueue: tier === Tier.QUEUE_IDENTITY_CARD,
      isNotVerifiedIdentityCard: tier === Tier.NOT_VERIFIED_IDENTITY_CARD,
      isIdentityVerified: tier === Tier.IDENTITY_CARD || tier === Tier.EID,
    },
  }
}
