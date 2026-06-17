import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'

import MessageModal from '@/src/components/widget-components/Modals/MessageModal'
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
 *
 * Cookiebot can also be blocked at runtime by adblock extensions (e.g. uBlock Origin).
 * In that case `window.Cookiebot` is undefined and we show a modal explaining the
 * likely cause instead of letting the click fail silently.
 */

const CookieConsentLink = () => {
  const { t } = useTranslation('account')
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false)

  const showCookiebotConsentBanner = () => {
    if (!isBrowser()) {
      return
    }

    if (typeof window.Cookiebot?.show === 'function') {
      window.Cookiebot.show()

      return
    }

    setIsMissingModalOpen(true)
  }

  return (
    <>
      <Button variant="link" className="font-normal" onPress={showCookiebotConsentBanner}>
        {t('CookieConsentButton.label')}
      </Button>
      <MessageModal
        type="warning"
        title={t('CookieConsentButton.missingScriptModal.title')}
        isOpen={isMissingModalOpen}
        onOpenChange={setIsMissingModalOpen}
        primaryButton={
          <Button variant="solid" onPress={() => setIsMissingModalOpen(false)}>
            {t('CookieConsentButton.missingScriptModal.close')}
          </Button>
        }
      >
        {t('CookieConsentButton.missingScriptModal.description')}
      </MessageModal>
    </>
  )
}

export default CookieConsentLink
