import { ServerSideAuthContext } from 'components/logic/ServerSideAuthProvider'
import { Tier } from 'frontend/dtos/accountDto'
import { useContext } from 'react'

export const useServerSideAuth = () => {
  const serverSideAuthContext = useContext(ServerSideAuthContext)
  const { userData } = serverSideAuthContext
  const tier = userData?.['custom:tier']
  return {
    ...serverSideAuthContext,
    isAuthenticated: !!userData,
    accountType: userData?.['custom:account_type'],
    tierStatus: {
      tier,
      isIdentityVerified: tier === Tier.IDENTITY_CARD || tier === Tier.EID,
      isIdentityVerificationNotYetAttempted: !tier || tier === Tier.NEW,
    },
  }
}
