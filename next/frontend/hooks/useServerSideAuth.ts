import { ServerSideAuthContext } from 'components/logic/ServerSideAuthProvider'
import { AccountType, Tier } from 'frontend/dtos/accountDto'
import { useContext } from 'react'

export const useServerSideAuth = () => {
  const serverSideAuthContext = useContext(ServerSideAuthContext)
  const { userData } = serverSideAuthContext
  const tier = userData?.['custom:tier']
  return {
    ...serverSideAuthContext,
    isAuthenticated: !!userData,
    accountType: userData?.['custom:account_type'],
    // helper, since we usually determine what to display this way, slightly convoluted because of ts rules & undefined vs boolean
    isLegalEntity: userData?.['custom:account_type']
      ? [AccountType.FyzickaOsobaPodnikatel, AccountType.PravnickaOsoba].includes(
          userData?.['custom:account_type'],
        )
      : false,
    tierStatus: {
      tier,
      isIdentityVerified: tier === Tier.IDENTITY_CARD || tier === Tier.EID,
      isIdentityVerificationNotYetAttempted: !tier || tier === Tier.NEW,
    },
  }
}
