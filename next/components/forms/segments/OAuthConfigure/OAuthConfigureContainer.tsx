import React, { useEffect, useState } from 'react'

import { clearOAuthSessionStorage } from '../../../../frontend/utils/amplifyClient'
import { isProductionDeployment } from '../../../../frontend/utils/general'
import { useAmplifyClientOAuthContext } from '../../../../frontend/utils/useAmplifyClientOAuthContext'
import { AccountContainer } from '../AccountContainer/AccountContainer'

export const getOAuthClientName = (clientId: string) =>
  ({
    '3ei88tn1gkvhfqpfckkd6plopr': 'MPA',
    '536t828sp4o7gsn3cmg3fbks5i': 'start.dpb.sk',
  })[clientId] ?? null

const OAuthConfigureContainer = () => {
  const { isOAuthLogin, amplifyConfigureByClientId } = useAmplifyClientOAuthContext()

  const [currentClientId, setCurrentClientId] = useState<string | null>(null)

  const clientName = currentClientId ? getOAuthClientName(currentClientId) : null

  useEffect(() => {
    const userPoolClientId = amplifyConfigureByClientId()
    setCurrentClientId(userPoolClientId || null)

    clearOAuthSessionStorage()
  }, [amplifyConfigureByClientId])

  return isProductionDeployment() ? null : (
    <AccountContainer className="mb-0 whitespace-pre-wrap md:pt-6">
      isOAuthLogin: {String(isOAuthLogin)}
      <br />
      clientName: {clientName ?? 'nie je'}
      <br />
    </AccountContainer>
  )
}

export default OAuthConfigureContainer
