import { AccountType, Tier } from 'frontend/dtos/accountDto'
import { useContext } from 'react'

import { SsrAuthContext, SsrAuthContextType } from '../../components/logic/SsrAuthContext'
import { environment } from '../../environment'

export const useSsrAuth = () => {
  const ssrAuthContext =
    useContext(SsrAuthContext) ??
    ({ userAttributes: null, isSignedIn: false } satisfies SsrAuthContextType)
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
      isIdentityVerified: tier === Tier.IDENTITY_CARD || tier === Tier.EID,
      isIdentityVerificationNotYetAttempted: !tier || tier === Tier.NEW,
      isInQueue: tier === Tier.QUEUE_IDENTITY_CARD,
    },
    // Temporary feature toggle for eID tax form
    eIdTaxFormAllowed:
      environment.featureToggles.eIdTaxWithoutBetaFlag ||
      userAttributes?.['custom:2024_tax_form_beta'] === 'true',
  }
}
