import Script from 'next/script'
import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

import { InitialFormData } from '../../../frontend/types/initialFormData'

type FormSignerLoaderContextType = {
  isError: boolean
  isLoading: boolean
  isReady: boolean
  isNotSupported: boolean
}

const FormSignerLoaderContext = createContext<FormSignerLoaderContextType | undefined>(undefined)

type FormSignerLoaderProviderProps = PropsWithChildren<{
  initialFormData: InitialFormData
}>

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
export const FormSignerLoaderProvider = ({
  initialFormData,
  children,
}: FormSignerLoaderProviderProps) => {
  const { isSigned } = initialFormData
  const [loadingStatuses, setLoadingStatuses] = useState({
    config: LoadedStatus.False,
    common: LoadedStatus.False,
    signer: LoadedStatus.False,
  })
  const [isSupportedStatus, setIsSupportedStatus] = useState(SupportedStatus.Unknown)

  const handleScriptsLoaded = () => {
    ditec.dSigXadesBpJs.detectSupportedPlatforms(null, {
      onSuccess: (result) => {
        setIsSupportedStatus(
          // If the library returns an empty array, it means that the user has to install the signer locally.
          result.length > 0 ? SupportedStatus.Supported : SupportedStatus.NotSupported,
        )
      },
      onError: () => {
        setIsSupportedStatus(SupportedStatus.NotSupported)
      },
    })
  }

  const updateLoadingStatus = (key: keyof typeof loadingStatuses, value: LoadedStatus) => {
    setLoadingStatuses((prevStatuses) => {
      const newLoadingStatuses = { ...prevStatuses, [key]: value }
      const allLoaded = Object.values(newLoadingStatuses).every(
        (status) => status === LoadedStatus.True,
      )
      if (allLoaded) {
        handleScriptsLoaded()
      }
      return newLoadingStatuses
    })
  }

  const isError = Object.values(loadingStatuses).includes(LoadedStatus.Error)
  const isLoading = isSigned
    ? (Object.values(loadingStatuses).includes(LoadedStatus.False) ||
        isSupportedStatus === SupportedStatus.Unknown) &&
      !isError
    : false
  const isReady =
    Object.values(loadingStatuses).every((status) => status === LoadedStatus.True) &&
    isSupportedStatus === SupportedStatus.Supported
  const isNotSupported = isSupportedStatus === SupportedStatus.NotSupported

  return (
    <>
      {isSigned && (
        <>
          <Script
            src="https://slovensko.sk/static/zep/dbridge_js/v1.0/config.js"
            strategy="lazyOnload"
            onLoad={() => updateLoadingStatus('config', LoadedStatus.True)}
            onError={() => updateLoadingStatus('config', LoadedStatus.Error)}
          />
          {/* Scripts must be loaded one after another. Using `defer` is not enough. */}
          {loadingStatuses.config === LoadedStatus.True && (
            <Script
              src="https://slovensko.sk/static/zep/dbridge_js/v1.0/dCommon.min.js"
              strategy="lazyOnload"
              onLoad={() => updateLoadingStatus('common', LoadedStatus.True)}
              onError={() => updateLoadingStatus('common', LoadedStatus.Error)}
            />
          )}
          {loadingStatuses.config === LoadedStatus.True &&
            loadingStatuses.common === LoadedStatus.True && (
              <Script
                src="https://slovensko.sk/static/zep/dbridge_js/v1.0/dSigXadesBp.min.js"
                strategy="lazyOnload"
                onLoad={() => updateLoadingStatus('signer', LoadedStatus.True)}
                onError={() => updateLoadingStatus('signer', LoadedStatus.Error)}
              />
            )}
        </>
      )}
      <FormSignerLoaderContext.Provider value={{ isError, isLoading, isReady, isNotSupported }}>
        {children}
      </FormSignerLoaderContext.Provider>
    </>
  )
}

export const useFormSignerLoader = () => {
  const context = useContext(FormSignerLoaderContext)
  if (!context) {
    throw new Error('useFormSignerLoader must be used within a FormSignerLoaderProvider')
  }

  return context
}
