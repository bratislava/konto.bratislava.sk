import { LoginClientEnum } from '@clients/city-account'
import React from 'react'

import { isProductionDeployment } from '../../../../frontend/utils/general'
import { useAmplifyClientOAuthContext } from '../../../../frontend/utils/useAmplifyClientOAuthContext'
import { DpbLogoSvg, PaasMpaLogoSvg } from './logos'

const OAuthClientLogo = ({ clientName }: { clientName: LoginClientEnum }) => {
  switch (clientName) {
    case 'DPB':
      return <DpbLogoSvg className="size-full" />
    case 'PAAS_MPA':
      return <PaasMpaLogoSvg className="size-full" />
    default:
      return null
  }
}

const OAuthInfo = () => {
  const { isOAuthLogin, clientInfo } = useAmplifyClientOAuthContext()

  return isProductionDeployment() ? null : isOAuthLogin && clientInfo?.name ? (
    <div className="relative h-full shrink-0 py-3">
      <OAuthClientLogo clientName={clientInfo.name} />
    </div>
  ) : null
}

export default OAuthInfo
