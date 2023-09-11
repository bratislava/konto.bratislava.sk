import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { createContext, PropsWithChildren, useContext, useEffect, useRef } from 'react'
import { useBeforeunload } from 'react-beforeunload'

const useGetContext = () => {
  const { t } = useTranslation('forms')
  const router = useRouter()
  const enabledRef = useRef(false)
  useBeforeunload(() => (enabledRef.current ? t('info_messages.form_leave_protection') : null))

  const turnOffLeaveProtection = () => {
    enabledRef.current = false
  }

  const turnOnLeaveProtection = () => {
    enabledRef.current = true
  }

  // https://stackoverflow.com/a/73977517
  useEffect(() => {
    const handler = () => {
      // eslint-disable-next-line no-alert
      if (enabledRef.current && !window.confirm(t('info_messages.form_leave_protection'))) {
        router.events.emit('routeChangeError')
        // this happens when user changes their mind when prompted about leaving
        logger.info('routeChange aborted.')
      }
    }

    router.events.on('routeChangeStart', handler)

    return () => {
      router.events.off('routeChangeStart', handler)
    }
  }, [router, t])

  return { turnOffLeaveProtection, turnOnLeaveProtection }
}

const FormLeaveProtectionContext = createContext<ReturnType<typeof useGetContext> | undefined>(
  undefined,
)

export const FormLeaveProtectionProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return (
    <FormLeaveProtectionContext.Provider value={context}>
      {children}
    </FormLeaveProtectionContext.Provider>
  )
}

export const useFormLeaveProtection = () => {
  const context = useContext(FormLeaveProtectionContext)
  if (!context) {
    throw new Error('useFormLeaveProtection must be used within a FormLeaveProtectionProvider')
  }

  return context
}
