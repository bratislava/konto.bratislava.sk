/** A react component with state provided through context
 * which shows a red status bar with white text on top of the page
 */
import { CrossIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { createContext, forwardRef, ReactNode, useContext, useState } from 'react'
import { useEffectOnce, useLocalStorage } from 'usehooks-ts'

import { environment } from '../../../environment'
import WarningIcon from '../icon-components/WarningIcon'
import AccountMarkdown from '../segments/AccountMarkdown/AccountMarkdown'
import { SectionContainer } from '../segments/SectionContainer/SectionContainer'
import Button from '../simple-components/ButtonNew'

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
      variant: 'warning',
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
  const { t } = useTranslation('common')
  const [statusBarTextDissmissed, setStatusBarTextDissmissed] = useLocalStorage<null | ReactNode>(
    'StatusBarText',
    null,
  )

  const { statusBarConfiguration } = useStatusBarContext()

  const displayStatusBar =
    statusBarConfiguration.content &&
    statusBarTextDissmissed !== statusBarConfiguration.content &&
    !environment.featureToggles.hideStatusbar
  if (!displayStatusBar) {
    return null
  }

  return (
    <div
      ref={forwardedRef}
      className={cx('w-full text-white', {
        'bg-negative-700': statusBarConfiguration.variant === 'error',
        'bg-warning-700': statusBarConfiguration.variant === 'warning',
        'bg-gray-700': statusBarConfiguration.variant === 'info',
      })}
    >
      <SectionContainer>
        <div className="flex justify-between py-4">
          <div className="flex">
            <span className="mr-3">
              <WarningIcon solid className="size-5" />
            </span>
            <AccountMarkdown
              variant="statusBar"
              content={statusBarConfiguration.content as string}
            />
          </div>
          <Button
            className="h-fit shrink-0"
            icon={<CrossIcon />}
            aria-label={t('ariaCloseStatusBar') ?? ''}
            onPress={() => setStatusBarTextDissmissed(statusBarConfiguration.content || null)}
          />
        </div>
      </SectionContainer>
    </div>
  )
})
