/** A react component with state provided through context
 * which shows a red status bar with white text on top of the page
 */
import cx from 'classnames'
import React, { createContext, useContext, useState } from 'react'

import ErrorIcon from '../icon-components/ErrorIcon'
import { SectionContainer } from '../segments/SectionContainer/SectionContainer'

type StatusBarVariantBase = 'warning' | 'error'

const StatusBarContext = createContext<{
  statusBarContent: React.ReactNode
  setStatusBarContent: React.Dispatch<React.SetStateAction<React.ReactNode>>
  statusBarVariant: React.ReactNode
  setStatusBarVariant: React.Dispatch<React.SetStateAction<StatusBarVariantBase>>
}>({
  statusBarContent: null,
  setStatusBarContent: () => {},
  statusBarVariant: 'warning',
  setStatusBarVariant: () => {},
})

interface StatusBarProviderProps {
  children?: React.ReactNode
}

export const StatusBarProvider: React.FC<StatusBarProviderProps> = ({ children }) => {
  const [statusBarContent, setStatusBarContent] = useState<React.ReactNode>(null)
  const [statusBarVariant, setStatusBarVariant] = useState<StatusBarVariantBase>('warning')
  return (
    <StatusBarContext.Provider
      value={{ statusBarContent, setStatusBarContent, statusBarVariant, setStatusBarVariant }}
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
  const { statusBarContent, statusBarVariant } = useStatusBarContext()
  return statusBarContent ? (
    <div
      className={cx('w-full text-white', className, {
        'bg-negative-700': statusBarVariant === 'error',
        'bg-warning-700': statusBarVariant === 'warning',
      })}
    >
      <div className="container mx-auto h-full flex items-center justify-center">
        <SectionContainer>
          <div className="row flex items-center py-4">
            <span className="hidden md:flex mr-3">
              <ErrorIcon solid className="w-5 h-5" />
            </span>
            <div className="text-p2">{statusBarContent}</div>
          </div>
        </SectionContainer>
      </div>
    </div>
  ) : null
}
