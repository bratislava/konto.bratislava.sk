/* eslint-disable @next/next/inline-script-id */
import './index.css'
// configure Amplify
import '../frontend/utils/amplifyConfig'
import 'react-loading-skeleton/dist/skeleton.css'

import { GoogleTagManager } from '@next/third-parties/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NavMenuContextProvider } from 'components/forms/segments/NavBar/navMenuContext'
import { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { appWithTranslation } from 'next-i18next'
import PlausibleProvider from 'next-plausible'
import { NuqsAdapter } from 'nuqs/adapters/next/pages'
import { useEffect, useState } from 'react'
import { I18nProvider } from 'react-aria'
import SnackbarProvider from 'react-simple-snackbar'

import { environment } from '../environment'
import { removeAllCookiesAndClearLocalStorage } from '../frontend/utils/amplifyClient'
import AmplifyClientProvider from '../frontend/utils/AmplifyClientProvider'
import { isProductionDeployment } from '../frontend/utils/general'
import logger from '../frontend/utils/logger'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
})

export type GlobalAppProps = {
  appProps?: {
    externallyEmbedded?: boolean
    amplifyResetCookies?: true
  }
}

/**
 * The session storage is used to prevent infinite cycle:
 * server triggers removal -> remove cookies -> reload -> server triggers removal (this won't happen twice)
 */
const amplifyCookiesRemovedSessionStorageKey = 'amplifyCookiesRemoved'

// Temporary fix for: https://github.com/aws-amplify/amplify-js/issues/14378
const AmplifyCookiesReset = () => {
  const router = useRouter()

  useEffect(() => {
    if (sessionStorage.getItem(amplifyCookiesRemovedSessionStorageKey)) {
      throw new Error(
        '[AUTH] Tried to remove Amplify cookies more than once, infinite loop detected.',
      )
    } else {
      logger.info(`[AUTH] Removing all Amplify cookies and clearing local storage`)
      sessionStorage.setItem(amplifyCookiesRemovedSessionStorageKey, 'true')
      removeAllCookiesAndClearLocalStorage()
      logger.info(`[AUTH] Reloading page after cookie cleanup`)
      router.reload()
    }
    // Rewritten from useEffectOnce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

const MyApp = ({ Component, pageProps }: AppProps<GlobalAppProps>) => {
  const [queryClient] = useState(() => new QueryClient())
  const allowCookies = !pageProps.appProps?.externallyEmbedded
  const amplifyResetCookies = pageProps.appProps?.amplifyResetCookies

  useEffect(() => {
    if (!amplifyResetCookies && sessionStorage.getItem(amplifyCookiesRemovedSessionStorageKey)) {
      logger.info(`[AUTH] Resetting Amplify cookies removal flag in session storage`)
      sessionStorage.removeItem(amplifyCookiesRemovedSessionStorageKey)
    }
    // Rewritten from useEffectOnce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (amplifyResetCookies) {
    return <AmplifyCookiesReset />
  }

  return (
    <>
      <Head>
        <title>Bratislavské konto</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#e46054" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        {/* Prevents automatic zooming on input fields on safari, which some users consider a bug. Source: https://stackoverflow.com/a/46254706 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style>{`
          :root {
            --inter-font: ${inter.style.fontFamily};
          }
        `}</style>
      </Head>
      {environment.gtmId && allowCookies ? (
        <GoogleTagManager
          gtmId={environment.gtmId}
          auth={environment.gtmAuth}
          preview={environment.gtmPreview}
        />
      ) : null}

      <AmplifyClientProvider>
        <NuqsAdapter>
          <I18nProvider locale="sk-SK">
            <QueryClientProvider client={queryClient}>
              <SnackbarProvider>
                <PlausibleProvider
                  domain={
                    isProductionDeployment() ? 'konto.bratislava.sk' : 'testing.bratislava.sk'
                  }
                  taggedEvents
                  // uncomment for local testing, needs to be run with `yarn build && yarn start`
                  // trackLocalhost
                >
                  <NavMenuContextProvider>
                    {/* This root div is used for locked body when mobile menu is open, see MobileNavMenu component */}
                    <div id="root">
                      <Component {...pageProps} />
                    </div>
                  </NavMenuContextProvider>
                </PlausibleProvider>
              </SnackbarProvider>
            </QueryClientProvider>
          </I18nProvider>
        </NuqsAdapter>
      </AmplifyClientProvider>
    </>
  )
}

export default appWithTranslation(MyApp)
