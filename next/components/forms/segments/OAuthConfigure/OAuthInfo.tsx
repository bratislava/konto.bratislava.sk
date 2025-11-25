import React from 'react'

import { isProductionDeployment } from '../../../../frontend/utils/general'
import {
  getOAuthClientInfo,
  useAmplifyClientOAuthContext,
} from '../../../../frontend/utils/useAmplifyClientOAuthContext'

// TODO OAuth: Replace by client info endpoint and logo
const OAuthInfo = () => {
  const { isOAuthLogin, currentClientId } = useAmplifyClientOAuthContext()

  const clientInfo = currentClientId ? getOAuthClientInfo(currentClientId) : null

  return isProductionDeployment() ? null : (
    <div className="shrink-0">
      isOAuthLogin: {String(isOAuthLogin)}
      <br />
      clientName: {clientInfo?.name ?? 'nie je'}
      <br />
    </div>
  )
}

export default OAuthInfo
