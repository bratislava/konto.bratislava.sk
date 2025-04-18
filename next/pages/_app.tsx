/* eslint-disable @next/next/inline-script-id */
import './index.css'
// initialize faro - TODO might need to ensure faro is initialized by providing it through react context and hook
import '../frontend/utils/logger'
// configure Amplify
import '../frontend/utils/amplifyConfig'
import 'react-loading-skeleton/dist/skeleton.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBarProvider } from 'components/forms/info-components/StatusBar'
import CookieConsent from 'components/forms/segments/CookieConsent/CookieConsent'
import { NavMenuContextProvider } from 'components/forms/segments/NavBar/navMenuContext'
import { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { appWithTranslation } from 'next-i18next'
import PlausibleProvider from 'next-plausible'
import { NuqsAdapter } from 'nuqs/adapters/next/pages'
import { useState } from 'react'
import { I18nProvider } from 'react-aria'
import SnackbarProvider from 'react-simple-snackbar'

import AmplifyClientProvider from '../frontend/utils/AmplifyClientProvider'
import { isProductionDeployment } from '../frontend/utils/general'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
})

export type GlobalAppProps = {
  appProps?: {
    externallyEmbedded?: boolean
  }
}

const MyApp = ({ Component, pageProps }: AppProps<GlobalAppProps>) => {
  const [queryClient] = useState(() => new QueryClient())
  const allowCookies = !pageProps.appProps?.externallyEmbedded

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
        {/* look for CookieConsent component for 3rd party scripts you'd expect to find here */}
        <style>{`
          :root {
            --inter-font: ${inter.style.fontFamily};
          }
        `}</style>
      </Head>

      <AmplifyClientProvider>
        <I18nProvider locale="sk-SK">
          <StatusBarProvider>
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
                    <NuqsAdapter>
                      {/* used to lock body with overflow: hidden when mobile menu is open, look for useLockedBody */}
                      <div id="root">
                        <Component {...pageProps} />
                      </div>
                      {allowCookies ? <CookieConsent /> : null}
                    </NuqsAdapter>
                  </NavMenuContextProvider>
                </PlausibleProvider>
              </SnackbarProvider>
            </QueryClientProvider>
          </StatusBarProvider>
        </I18nProvider>
      </AmplifyClientProvider>
    </>
  )
}

export default appWithTranslation(MyApp)
