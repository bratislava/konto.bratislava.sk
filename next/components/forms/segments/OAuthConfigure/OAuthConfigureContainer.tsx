import React, { useEffect, useState } from 'react'

import { useOAuthParams } from '../../../../frontend/hooks/useOAuthParams'
import { clearLocalStorage } from '../../../../frontend/utils/amplifyClient'
import { isProductionDeployment } from '../../../../frontend/utils/general'
import { AccountContainer } from '../AccountContainer/AccountContainer'

export const getOAuthClientName = (clientId: string) =>
  ({
    '3ei88tn1gkvhfqpfckkd6plopr': 'MPA',
    '536t828sp4o7gsn3cmg3fbks5i': 'start.dpb.sk',
  })[clientId] ?? null

const OAuthConfigureContainer = () => {
  const { isOAuthLogin, amplifyConfigure } = useOAuthParams()

  const [currentClientId, setCurrentClientId] = useState<string | null>(null)

  const clientName = currentClientId ? getOAuthClientName(currentClientId) : null

  useEffect(() => {
    const userPoolClientId = amplifyConfigure()
    setCurrentClientId(userPoolClientId || null)

    clearLocalStorage()
  }, [amplifyConfigure])

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
