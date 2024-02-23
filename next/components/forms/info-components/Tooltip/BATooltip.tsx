import { HelpIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Button, OverlayArrow, Tooltip, TooltipProps, TooltipTrigger } from 'react-aria-components'

// eslint-disable-next-line import/no-cycle
import AccountMarkdown from '../../segments/AccountMarkdown/AccountMarkdown'
import HorizontalArrowIcon from './tooltip-horizontal-arrow.svg'
import VerticalArrowIcon from './tooltip-vertical-arrow.svg'

type InnerTooltipProps = Omit<TooltipProps, 'children'> & {
  children: string
}

const iconComponentMap = {
  top: VerticalArrowIcon,
  bottom: VerticalArrowIcon,
  left: HorizontalArrowIcon,
  right: HorizontalArrowIcon,
}

const InnerTooltip = ({ children, ...props }: InnerTooltipProps) => {
  return (
    <Tooltip
      {...props}
      className="text-p3 sm:text-p2 m-0 flex w-fit min-w-[118px] max-w-[230px] flex-row justify-center break-words rounded border-0 bg-gray-700 px-3 py-2 text-white sm:max-w-[280px] sm:px-4 sm:py-3"
    >
      <OverlayArrow>
        {({ placement }) => {
          const ArrowIcon = iconComponentMap[placement]
          if (!ArrowIcon) {
            return null
          }

          return (
            <ArrowIcon
              className={cx({
                'rotate-180': placement === 'top' || placement === 'left',
              })}
            />
          )
        }}
      </OverlayArrow>
      <div className="w-max">
        <AccountMarkdown content={children} variant="sm" uLinkVariant="primary" />
      </div>
    </Tooltip>
  )
}

type BATooltipProps = Pick<TooltipProps, 'placement'> & { children: string }

const BATooltip = ({ placement, children }: BATooltipProps) => {
  const { t } = useTranslation('account', { keyPrefix: 'Tooltip' })

  // According to documentation
  // >> Note: tooltips are not shown on touch screen interactions. Ensure that your UI is usable without tooltips, or use
  // >> an alternative component such as a Popover to show information in an adjacent element.
  // - https://react-spectrum.adobe.com/react-aria/Tooltip.html
  //
  // we shouldn't use tooltips on touch screens, but this is not possible for us, using the controlled state and
  // implementing onPressStart allows us to display the tooltip on click on touch screens. Using Popover is not a good
  // option because it doesn't act like tooltip (displayed on click, has focus trap, disables the rest of the page, etc.)

  const [isOpen, setOpen] = useState(false)

  return (
    <TooltipTrigger isOpen={isOpen} onOpenChange={setOpen} delay={0} closeDelay={0}>
      <Button
        className="-m-1.5 flex cursor-pointer items-center justify-center rounded-lg p-1.5"
        aria-label={t('aria.tooltip')}
        // If the tooltip is open, and we click on it, it's first closed and then onPress is triggered, onPressStart
        // is triggered before the tooltip is closed, so it won't reopen again.
        onPressStart={() => {
          if (!isOpen) {
            setOpen(true)
          }
        }}
      >
        <HelpIcon className="h-5 w-5 lg:h-6 lg:w-6" />
      </Button>
      <InnerTooltip placement={placement} offset={8}>
        {children}
      </InnerTooltip>
    </TooltipTrigger>
  )
}

export default BATooltip
