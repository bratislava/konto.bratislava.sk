import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { isBrowser } from '@/src/frontend/utils/general'

/**
 * Cookiebot docs: https://www.cookiebot.com/en/developer/
 * 
 * Cookiebot is injected via Google Tag Manager (GTM)
 * For local testing, you need to enable preview mode for localhost in GTM:
 * https://support.google.com/tagmanager/thread/347094327/localhost-testing?hl=en
 * Otherwise, Cookiebot script will not be injected.
 * 
 * Note that in GTM, we have a custom script adjusting Cookiebot behavior.
 * 
 * For additional info and access to Cookiebot and GMT, see our team docs.
 */

const showCookiebotConsentBanner = () => {
  if (isBrowser())
  { 
    window.Cookiebot?.show?.()
  }
}

const CookieConsentLink = () => {
  const { t } = useTranslation('account')

  return (
    <Button variant="link" className="font-normal" onPress={showCookiebotConsentBanner}>
      {t('CookieConsentButton.label')}
    </Button>
  )
}

export default CookieConsentLink
