import React from 'react'

import { DpbLogoSvg, PaasMpaLogoSvg } from '@/src/components/segments/OAuthLogo/logos'
import { useAmplifyClientOAuthContext } from '@/src/frontend/hooks/useAmplifyClientOAuthContext'

const OAuthClientLogo = ({ clientName }: { clientName: string }) => {
  switch (clientName) {
    case 'DPB':
      return <DpbLogoSvg className="h-full w-auto" />
    case 'PAAS_MPA':
      return <PaasMpaLogoSvg className="h-full w-auto" />
    default:
      return null
  }
}

const OAuthLogo = () => {
  const { isOAuthLogin, clientInfo } = useAmplifyClientOAuthContext()

  return isOAuthLogin && clientInfo?.clientName ? (
    <div className="relative h-full shrink-0 py-2.5">
      <OAuthClientLogo clientName={clientInfo.clientName} />
    </div>
  ) : null
}

export default OAuthLogo
