import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

/**
 * Docs: https://www.cookiebot.com/en/developer/
 *
 * For local testing:
 * - Cookiebot - add localhost as a testing domain: https://admin.cookiebot.com/domain-groups/
 * - GTM - enable preview mode for localhost: https://support.google.com/tagmanager/thread/347094327/localhost-testing?hl=en
 */

const showCookiebotConsentBanner = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.Cookiebot?.show?.()
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
