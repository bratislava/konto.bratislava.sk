import React, { useEffect, useState } from 'react'

import { useOAuthParams } from '../../../../frontend/hooks/useOAuthParams'
import { AccountContainer } from '../AccountContainer/AccountContainer'

export const getOAuthClientName = (clientId: string | null) => {
  if (clientId === '3ei88tn1gkvhfqpfckkd6plopr') {
    return 'MPA'
  }

  return clientId
}

const OAuthConfigureContainer = () => {
  const { isOAuthLogin, amplifyConfigure } = useOAuthParams()

  const [currentClientId, setCurrentClientId] = useState<string | null>(null)

  useEffect(() => {
    const userPoolClientId = amplifyConfigure()
    setCurrentClientId(userPoolClientId || null)
  }, [amplifyConfigure])

  return (
    <AccountContainer className="mb-0 whitespace-pre-wrap md:pt-6">
      isOAuthLogin: {String(isOAuthLogin)}
      <br />
      clientName: {getOAuthClientName(currentClientId)}
      <br />
    </AccountContainer>
  )
}

export default OAuthConfigureContainer
