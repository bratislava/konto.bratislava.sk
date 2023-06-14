/** A react component with state provided through context
 * which shows a red status bar with white text on top of the page
 */
import cx from 'classnames'
import React, { createContext, useContext, useState } from 'react'

import ErrorIcon from '../icon-components/ErrorIcon'
import { SectionContainer } from '../segments/SectionContainer/SectionContainer'

type StatusBarVariantBase = 'warning' | 'error'

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

interface StatusBarProps {
  className?: string
}

export const StatusBar = ({ className }: StatusBarProps) => {
  const { statusBarConfiguration } = useStatusBarContext()
  return statusBarConfiguration.content ? (
    <div
      className={cx('w-full text-white', className, {
        'bg-negative-700': statusBarConfiguration.variant === 'error',
        'bg-warning-700': statusBarConfiguration.variant === 'warning',
      })}
    >
      <div className="container mx-auto h-full flex items-center justify-center">
        <SectionContainer>
          <div className="row flex items-center py-4">
            <span className="hidden md:flex mr-3">
              <ErrorIcon solid className="w-5 h-5" />
            </span>
            <div className="text-p2">{statusBarConfiguration.content}</div>
          </div>
        </SectionContainer>
      </div>
    </div>
  ) : null
}
