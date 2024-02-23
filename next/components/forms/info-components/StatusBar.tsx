/** A react component with state provided through context
 * which shows a red status bar with white text on top of the page
 */
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { createContext, forwardRef, useContext, useState } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import WarningIcon from '../icon-components/WarningIcon'
import AccountMarkdown from '../segments/AccountMarkdown/AccountMarkdown'
import { SectionContainer } from '../segments/SectionContainer/SectionContainer'

type StatusBarVariantBase = 'warning' | 'error' | 'info'

type StatusBarConfigurationBase = {
  content: React.ReactNode
  variant: StatusBarVariantBase
}

const StatusBarContext = createContext<{
  statusBarConfiguration: StatusBarConfigurationBase
  setStatusBarConfiguration: React.Dispatch<React.SetStateAction<StatusBarConfigurationBase>>
}>({
  statusBarConfiguration: {
    content: null,
    variant: 'warning',
  },
  setStatusBarConfiguration: () => {},
})

interface StatusBarProviderProps {
  children?: React.ReactNode
}

export const StatusBarProvider: React.FC<StatusBarProviderProps> = ({ children }) => {
  const [statusBarConfiguration, setStatusBarConfiguration] = useState<StatusBarConfigurationBase>({
    content: null,
    variant: 'warning',
  })
  const { t } = useTranslation(['common'])
  useEffectOnce(() => {
    // this overrides the 'global' status notification (i.e. crashed servers), but since we don't have design for multiple, showing failed notification probably takes precedence
    // TODO rethink the status bar approach on product side
    // TODO here set to whatever is the 'global' error
    setStatusBarConfiguration({
      // If translation is empty, status bar will be hidden
      content: t('common:statusBarContent'),
      variant: 'info',
    })
  })

  return (
    <StatusBarContext.Provider
      value={{
        statusBarConfiguration,
        setStatusBarConfiguration,
      }}
    >
      {children}
    </StatusBarContext.Provider>
  )
}

export const useStatusBarContext = () => useContext(StatusBarContext)

export const StatusBar = forwardRef<HTMLDivElement>((props, forwardedRef) => {
  const { statusBarConfiguration } = useStatusBarContext()
  return statusBarConfiguration.content ? (
    <div
      ref={forwardedRef}
      className={cx('w-full text-white', {
        'bg-negative-700': statusBarConfiguration.variant === 'error',
        'bg-warning-700': statusBarConfiguration.variant === 'warning',
        'bg-gray-700': statusBarConfiguration.variant === 'info',
      })}
      data-cy="info-bar"
    >
      <div className="container mx-auto flex h-full items-center justify-center">
        <SectionContainer>
          <div className="flex items-center py-4">
            <span className="mr-3">
              <WarningIcon solid className="h-5 w-5" />
            </span>
            <AccountMarkdown
              variant="statusBar"
              content={statusBarConfiguration.content as string}
            />
          </div>
        </SectionContainer>
      </div>
    </div>
  ) : null
})
