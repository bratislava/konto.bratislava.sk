/** A react component with state provided through context
 * which shows a red status bar with white text on top of the page
 */
import React, { createContext, useContext, useState } from 'react'
import cx from 'classnames'
import SectionContainer from '../segments/SectionContainer/SectionContainer'
import ErrorIcon from '../icon-components/ErrorIcon'

const StatusBarContext = createContext<{
  StatusBarContent: React.ReactNode
  setStatusBarContent: React.Dispatch<React.SetStateAction<React.ReactNode>>
}>({
  StatusBarContent: false,
  setStatusBarContent: () => undefined,
})

interface StatusBarProviderProps {
  children?: React.ReactNode
}

export const StatusBarProvider: React.FC<StatusBarProviderProps> = ({ children }) => {
  const [StatusBarContent, setStatusBarContent] = useState<React.ReactNode>(null)
  return (
    <StatusBarContext.Provider value={{ StatusBarContent, setStatusBarContent }}>
      {children}
    </StatusBarContext.Provider>
  )
}

export const useStatusBarContext = () => useContext(StatusBarContext)

interface StatusBarProps {
  className?: string
}

export const StatusBar: React.FC<StatusBarProps> = ({ className }) => {
  const { StatusBarContent } = useStatusBarContext()

  return (
    StatusBarContent && (
      <div className={cx('w-full bg-negative-700 text-white', className)}>
        <div className="container mx-auto h-full flex items-center justify-center">
          <SectionContainer>
            <div className="row flex items-center py-4">
              <span className="hidden md:flex mr-3">
                <ErrorIcon solid className="w-5 h-5" />
              </span>
              <p className="text-p2">{StatusBarContent}</p>
            </div>
          </SectionContainer>
        </div>
      </div>
    )
  )
}
