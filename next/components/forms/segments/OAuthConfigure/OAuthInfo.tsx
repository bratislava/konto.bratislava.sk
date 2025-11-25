import React from 'react'

import { isProductionDeployment } from '../../../../frontend/utils/general'
import { useAmplifyClientOAuthContext } from '../../../../frontend/utils/useAmplifyClientOAuthContext'

export const getOAuthClientName = (clientId: string) =>
  ({
    '3ei88tn1gkvhfqpfckkd6plopr': 'MPA',
    '536t828sp4o7gsn3cmg3fbks5i': 'start.dpb.sk',
  })[clientId] ?? null

// TODO OAuth: Replace by client info endpoint and logo
const OAuthInfo = () => {
  const { isOAuthLogin, currentClientId } = useAmplifyClientOAuthContext()

  const clientName = currentClientId ? getOAuthClientName(currentClientId) : null

  return isProductionDeployment() ? null : (
    <div className="shrink-0">
      isOAuthLogin: {String(isOAuthLogin)}
      <br />
      clientName: {clientName ?? 'nie je'}
      <br />
    </div>
  )
}

export default OAuthInfo
