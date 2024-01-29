import Script from 'next/script'
import React, { createContext, Fragment, PropsWithChildren, useContext, useState } from 'react'

import { useFormContext } from '../useFormContext'

type FormSignerLoaderContextType = {
  isError: boolean
  isLoading: boolean
  isReady: boolean
  isNotSupported: boolean
  retry: () => void
}

const FormSignerLoaderContext = createContext<FormSignerLoaderContextType | undefined>(undefined)

enum LoadedStatus {
  False,
  True,
  Error,
}

enum SupportedStatus {
  Unknown,
  Supported,
  NotSupported,
}

/**
 * This provider is responsible for loading the signer scripts and detecting whether the user's has installed all the
 * necessary parts for the signer to work.
 */
export const FormSignerLoaderProvider = ({ children }: PropsWithChildren) => {
  const { isSigned, isReadonly } = useFormContext()
  const [loadingStatuses, setLoadingStatuses] = useState({
    config: LoadedStatus.False,
    common: LoadedStatus.False,
    signer: LoadedStatus.False,
  })
  const [isSupportedStatus, setIsSupportedStatus] = useState(SupportedStatus.Unknown)
  const [retryTimestamp, setRetryTimestamp] = useState<number | null>(null)

  if (!isSigned || isReadonly) {
    return (
      <FormSignerLoaderContext.Provider
        value={{
          isError: false,
          isLoading: false,
          isReady: false,
          isNotSupported: false,
          retry: () => {},
        }}
      >
        {children}
      </FormSignerLoaderContext.Provider>
    )
  }

  const handleScriptsLoaded = () => {
    ditec.dSigXadesBpJs.detectSupportedPlatforms(null, {
      onSuccess: (result) => {
        setIsSupportedStatus(
          // If the library returns an empty array, it means that the platform is not supported (e.g. phone).
          result.length > 0 ? SupportedStatus.Supported : SupportedStatus.NotSupported,
        )
      },
      onError: () => {
        setIsSupportedStatus(SupportedStatus.NotSupported)
      },
    })
  }

  const updateLoadingStatus = (key: keyof typeof loadingStatuses, value: LoadedStatus) => {
    const newLoadingStatuses = { ...loadingStatuses, [key]: value }
    const allLoaded = Object.values(newLoadingStatuses).every(
      (status) => status === LoadedStatus.True,
    )
    if (allLoaded) {
      handleScriptsLoaded()
    }
    setLoadingStatuses(newLoadingStatuses)
  }

  const isError = Object.values(loadingStatuses).includes(LoadedStatus.Error)
  const isLoading =
    (Object.values(loadingStatuses).includes(LoadedStatus.False) ||
      isSupportedStatus === SupportedStatus.Unknown) &&
    !isError
  const isReady =
    Object.values(loadingStatuses).every((status) => status === LoadedStatus.True) &&
    isSupportedStatus === SupportedStatus.Supported
  const isNotSupported = isSupportedStatus === SupportedStatus.NotSupported

  const retry = () => {
    setRetryTimestamp(Date.now())
    setIsSupportedStatus(SupportedStatus.Unknown)
    setLoadingStatuses({
      config: LoadedStatus.False,
      common: LoadedStatus.False,
      signer: LoadedStatus.False,
    })
  }

  // Postfixing the URL is a reliable way to force the browser to reload the script.
  const getUrl = (path: string) => (retryTimestamp ? `${path}?${retryTimestamp}` : path)

  return (
    <FormSignerLoaderContext.Provider
      value={{ isError, isLoading, isReady, isNotSupported, retry }}
    >
      {/* Also a custom fragment key is needed to retry the library load. */}
      <Fragment key={retryTimestamp}>
        <Script
          src={getUrl('https://slovensko.sk/static/zep/dbridge_js/v1.0/config.js')}
          strategy="lazyOnload"
          onLoad={() => updateLoadingStatus('config', LoadedStatus.True)}
          onError={() => updateLoadingStatus('config', LoadedStatus.Error)}
        />
        {/* Scripts must be loaded one after another. Using `defer` is not enough. */}
        {loadingStatuses.config === LoadedStatus.True && (
          <Script
            src={getUrl('https://slovensko.sk/static/zep/dbridge_js/v1.0/dCommon.min.js')}
            strategy="lazyOnload"
            onLoad={() => updateLoadingStatus('common', LoadedStatus.True)}
            onError={() => updateLoadingStatus('common', LoadedStatus.Error)}
          />
        )}
        {loadingStatuses.config === LoadedStatus.True &&
          loadingStatuses.common === LoadedStatus.True && (
            <Script
              src={getUrl('https://slovensko.sk/static/zep/dbridge_js/v1.0/dSigXadesBp.min.js')}
              strategy="lazyOnload"
              onLoad={() => updateLoadingStatus('signer', LoadedStatus.True)}
              onError={() => updateLoadingStatus('signer', LoadedStatus.Error)}
            />
          )}
      </Fragment>
      {children}
    </FormSignerLoaderContext.Provider>
  )
}

export const useFormSignerLoader = () => {
  const context = useContext(FormSignerLoaderContext)
  if (!context) {
    throw new Error('useFormSignerLoader must be used within a FormSignerLoaderProvider')
  }

  return context
}
