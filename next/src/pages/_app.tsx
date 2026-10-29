import 'src/pages/globals.css'
// configure Amplify
import '@/src/frontend/utils/amplifyConfig'
import 'react-loading-skeleton/dist/skeleton.css'

import { ComponentLibraryProvider } from '@bratislava/component-library'
import { GoogleTagManager } from '@next/third-parties/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { appWithTranslation } from 'next-i18next/pages'
import PlausibleProvider from 'next-plausible'
import { NuqsAdapter } from 'nuqs/adapters/next/pages'
import { useState } from 'react'
import { I18nProvider } from 'react-aria/I18nProvider'

import { NavMenuContextProvider } from '@/src/components/segments/NavBar/navMenuContext'
import MLink from '@/src/components/simple-components/MLink'
import AppToastRegion from '@/src/components/simple-components/Toast/Toast'
import { environment } from '@/src/environment'
import AmplifyClientProvider from '@/src/frontend/utils/AmplifyClientProvider'
import { isProductionDeployment } from '@/src/frontend/utils/general'

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
              <ComponentLibraryProvider linkComponent={MLink}>
                <PlausibleProvider
                  domain={
                    isProductionDeployment() ? 'konto.bratislava.sk' : 'testing.bratislava.sk'
                  }
                  taggedEvents
                  // uncomment for local testing, needs to be run with `pnpm run build && pnpm run start`
                  // trackLocalhost
                >
                  <NavMenuContextProvider>
                    {/* This root div is used for locked body when mobile menu is open, see MobileNavMenu component */}
                    <div id="root">
                      <Component {...pageProps} />
                    </div>
                    <AppToastRegion />
                  </NavMenuContextProvider>
                </PlausibleProvider>
              </ComponentLibraryProvider>
            </QueryClientProvider>
          </I18nProvider>
        </NuqsAdapter>
      </AmplifyClientProvider>
    </>
  )
}

export default appWithTranslation(MyApp)
