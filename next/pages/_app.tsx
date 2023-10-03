/* eslint-disable @next/next/inline-script-id */
import './index.css'
// initialize faro - TODO might need to ensure faro is initialized by providing it through react context and hook
import '../frontend/utils/logger'
// configure Amplify
import '../frontend/utils/amplify'
import 'react-loading-skeleton/dist/skeleton.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBarProvider } from 'components/forms/info-components/StatusBar'
import CookieConsent from 'components/forms/segments/CookieConsent/CookieConsent'
import { GlobalStateProvider } from 'components/forms/states/GlobalState'
import { LoginRegisterRedirectProvider } from 'frontend/hooks/useLoginRegisterRedirect'
import { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { appWithTranslation } from 'next-i18next'
import PlausibleProvider from 'next-plausible'
import { NextAdapter } from 'next-query-params'
import SnackbarProvider from 'react-simple-snackbar'
import { QueryParamProvider } from 'use-query-params'

import { isProductionDeployment } from '../frontend/utils/general'

const queryClient = new QueryClient()

const inter = Inter({
  variable: '--inter-font',
  subsets: ['latin', 'latin-ext'],
})

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      {/* https://nextjs.org/docs/pages/building-your-application/optimizing/fonts#apply-the-font-in-head */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        body {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <Head>
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
      </Head>

      <QueryParamProvider adapter={NextAdapter}>
        <StatusBarProvider>
          <QueryClientProvider client={queryClient}>
            <SnackbarProvider>
              <PlausibleProvider
                domain={isProductionDeployment() ? 'konto.bratislava.sk' : 'testing.bratislava.sk'}
                taggedEvents
                // uncomment for local testing, needs to be run with `yarn build && yarn start`
                // trackLocalhost
              >
                <GlobalStateProvider>
                  <LoginRegisterRedirectProvider>
                    <Component {...pageProps} />
                    <CookieConsent />
                  </LoginRegisterRedirectProvider>
                </GlobalStateProvider>
              </PlausibleProvider>
            </SnackbarProvider>
          </QueryClientProvider>
        </StatusBarProvider>
      </QueryParamProvider>
    </>
  )
}

export default appWithTranslation(MyApp)
