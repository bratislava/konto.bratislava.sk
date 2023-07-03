import { ServerSideAuthContext } from 'components/logic/ServerSideAuthProvider'
import { Tier } from 'frontend/dtos/accountDto'
import { useContext } from 'react'

export const useServerSideAuth = () => useContext(ServerSideAuthContext)

export const useDerivedServerSideAuthState = () => {
  const { userData } = useServerSideAuth()
  const tier = userData?.['custom:tier']
  return {
    isAuthenticated: !!userData,
    isLegalEntity: userData?.['custom:account_type'] === 'po',
    tierStatus: {
      tier,
      isIdentityVerified: tier === Tier.IDENTITY_CARD || tier === Tier.EID,
      isIdentityVerificationNotYetAttempted: !tier || tier === Tier.NEW,
    },
  }
}
