import Button from 'components/forms/simple-components/Button'
import Cookies from 'js-cookie'
import { mapValues, pick } from 'lodash'
import Script from 'next/script'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useEffect, useState } from 'react'

import { isBrowser, isProductionDeployment } from '../../../../frontend/utils/general'
import logger from '../../../../frontend/utils/logger'

interface CookieOptions {
  expires?: number | Date
  path?: string
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

interface CookiesHandler {
  get(name: string): string | undefined
  set(name: string, value: string, options?: CookieOptions): void
  remove(name: string, options?: CookieOptions): void
}

const cookiesHandler: CookiesHandler = Cookies as unknown as CookiesHandler

const availableConsents = ['statistics']
const pickConsents = (consents: any) => mapValues(pick(consents, availableConsents), Boolean)

// taken from bratislava.sk without much of a change
// also takes care of loading all the consented 3rd parties - TODO consider better component name ?
export const CookiesAndTracking = () => {
  const [consents, setConsentsState] = useState<Record<string, any> | null>(null)
  // defaults to true so that it does not flash into being in the beginning
  const [bannerDismissed, setBannerDismissed] = useState(true)
  const shouldShowBanner = !bannerDismissed && !consents

  const refresh = useCallback(async () => {
    try {
      const consentValue = cookiesHandler.get('gdpr-consents')
      if (!consentValue || typeof consentValue !== 'string') {
        setBannerDismissed(false)
        return
      }
      const parsedConsent = await JSON.parse(consentValue)
      if (typeof parsedConsent === 'object') {
        setConsentsState(pickConsents(parsedConsent))
      }
    } catch (error) {
      logger.error(error)
    }
    setBannerDismissed(false)
  }, [])

  useEffect(() => {
    if (isBrowser()) {
      refresh().catch((error_) => logger.error('Refresh failed', error_))
    }
  }, [refresh])

  const setConsents = useCallback(
    (value) => {
      if (typeof value !== 'object') return
      const consentValue = pickConsents(value)
      const mergedConsents = { ...consents, ...consentValue }
      cookiesHandler.set('gdpr-consents', JSON.stringify(mergedConsents), { expires: 365 })
      setConsentsState(mergedConsents)
    },
    [consents],
  )

  const { t } = useTranslation(['common'])

  return (
    <>
      {/* all 3rd party scrips loading here */}
      {/* don't use any of the analytics/tracking in staging/dev - change this if you need testing */}
      {isProductionDeployment() ? (
        <>
          {consents?.statistics ? (
            <Script
              id="hotjar"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(h,o,t,j,a,r){
                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                    h._hjSettings={hjid:3427495,hjsv:6};
                    a=o.getElementsByTagName('head')[0];
                    r=o.createElement('script');r.async=1;
                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                    a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
              }}
            />
          ) : null}
        </>
      ) : null}

      {shouldShowBanner ? (
        <div className="fixed inset-x-0 bottom-6 z-50 px-6">
          <div className="mx-auto max-w-[1110px] rounded-lg bg-white px-6 py-8 shadow md:px-10">
            <h6 className="text-20-semibold mb-4"> {t('cookie_consent_modal_content_title')} </h6>
            <p className="text-p2 mb-8">
              {' '}
              {t('cookie_consent_body')}{' '}
              <a
                href={t('cookie_consent_privacy_policy_link')}
                className="cursor-pointer font-semibold underline"
              >
                {' '}
                {t('cookie_consent_privacy_policy')}{' '}
              </a>
            </p>
            <div className="flex flex-col gap-2 md:flex-row">
              <Button
                className="text-16-medium h-12 px-6"
                variant="category"
                onPress={() => setConsents({ statistics: true })}
                text={t('cookie_consent_accept')}
              />
              <Button
                className="text-16-medium h-12 px-6"
                variant="category-outline"
                onPress={() => setConsents({ statistics: false })}
                text={t('cookie_consent_reject')}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default CookiesAndTracking
