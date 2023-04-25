/* eslint-disable @next/next/inline-script-id */
import './index.css'
// initialize faro - TODO might need to ensure faro is initialized by providing it through react context and hook
import '@utils/logger'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AccountProvider } from '@utils/useAccount'
import { StatusBarProvider } from 'components/forms/info-components/StatusBar'
import CookieConsent from 'components/forms/segments/CookieConsent/CookieConsent'
import { appWithTranslation } from 'next-i18next'
import { NextAdapter } from 'next-query-params'
import { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { SSRProvider } from 'react-aria'
import SnackbarProvider from 'react-simple-snackbar'
import { QueryParamProvider } from 'use-query-params'

const queryClient = new QueryClient()

const inter = Inter({
  variable: '--inter-font',
  subsets: ['latin', 'latin-ext'],
})

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#e46054" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        {/* look for CookieConsent component for 3rd party scripts you'd expect to find here */}
      </Head>
      <QueryParamProvider adapter={NextAdapter}>
        <SSRProvider>
          <StatusBarProvider>
            <div className={`${inter.variable} font-sans`}>
              <QueryClientProvider client={queryClient}>
                <SnackbarProvider>
                  <AccountProvider>
                    <Component {...pageProps} />
                    <CookieConsent />
                  </AccountProvider>
                </SnackbarProvider>
              </QueryClientProvider>
            </div>
          </StatusBarProvider>
        </SSRProvider>
      </QueryParamProvider>
    </>
  )
}

export default appWithTranslation(MyApp)
