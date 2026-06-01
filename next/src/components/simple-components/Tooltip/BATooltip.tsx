import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'
import { OverlayArrow, Tooltip, TooltipProps, TooltipTrigger } from 'react-aria-components/Tooltip'

import Markdown from '@/src/components/formatting/Markdown'
import Icon from '@/src/components/icon-components/Icon'
import HorizontalArrowIcon from '@/src/components/simple-components/Tooltip/tooltip-horizontal-arrow.svg'
import VerticalArrowIcon from '@/src/components/simple-components/Tooltip/tooltip-vertical-arrow.svg'
import cn from '@/src/utils/cn'

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
      className="m-0 flex w-fit max-w-[230px] min-w-[118px] flex-row justify-center rounded-sm border-0 bg-gray-700 px-3 py-2 text-size-p-small-r wrap-break-word text-white sm:max-w-[280px] sm:px-4 sm:py-3 sm:text-size-p-small"
    >
      <OverlayArrow>
        {({ placement }) => {
          if (!placement) {
            return null
          }
          const ArrowIcon = iconComponentMap[placement]
          if (!ArrowIcon) {
            return null
          }

          return (
            <ArrowIcon
              className={cn({
                'rotate-180': placement === 'top' || placement === 'left',
              })}
            />
          )
        }}
      </OverlayArrow>
      <div className="w-max">
        <Markdown variant="small" content={children} />
      </div>
    </Tooltip>
  )
}

type BATooltipProps = Pick<TooltipProps, 'placement'> & { children: string }

const BATooltip = ({ placement, children }: BATooltipProps) => {
  const { t } = useTranslation('account')

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
        variant="icon-wrapped-negative-margin"
        // className="-m-1.5 flex cursor-pointer items-center justify-center rounded-lg p-1.5"
        aria-label={t('Tooltip.aria.tooltip')}
        icon={<Icon name="help" className="size-5 lg:size-6" />}
        // If the tooltip is open, and we click on it, it's first closed and then onPress is triggered, onPressStart
        // is triggered before the tooltip is closed, so it won't reopen again.
        onPressStart={() => {
          if (!isOpen) {
            setOpen(true)
          }
        }}
      />
      <InnerTooltip placement={placement} offset={8}>
        {children}
      </InnerTooltip>
    </TooltipTrigger>
  )
}

export default BATooltip
