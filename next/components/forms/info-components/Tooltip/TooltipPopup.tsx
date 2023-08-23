import cx from 'classnames'
import { TooltipPositionType } from 'components/forms/info-components/Tooltip/Tooltip'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'

import HorizontalArrowIcon from './tooltip-horizontal-arrow.svg'
import VerticalArrowIcon from './tooltip-vertical-arrow.svg'

type TooltipBase = {
  text?: string
  arrow?: boolean
  className?: string
  position?: TooltipPositionType
}

const TooltipPopup = ({ arrow = true, className, text, position = 'top-left' }: TooltipBase) => {
  const tooltipPopupStyle = cx('absolute z-20 w-fit', {
    '-left-3.5 bottom-8 sm:-left-3 sm:bottom-9': position === 'top-right',
    '-right-3.5 bottom-8 sm:-right-3 sm:bottom-9': position === 'top-left',
    '-left-3.5 top-8 sm:-left-3 sm:top-9': position === 'bottom-right',
    '-right-3.5 top-8 sm:-right-3 sm:top-9': position === 'bottom-left',

    '-top-3.5 left-8 sm:-top-3 sm:left-9': position === 'right-top',
    '-bottom-3.5 left-8 sm:-bottom-3 sm:left-9': position === 'right-bottom',
    '-top-3.5 right-8 sm:-top-3 sm:right-9': position === 'left-top',
    '-bottom-3.5 right-8 sm:-bottom-3 sm:right-9': position === 'left-bottom',
  })

  const tooltipArrowStyle = cx('absolute', {
    'left-4 h-2 w-4': position === 'top-right',
    'right-4 h-2 w-4': position === 'top-left',
    'left-4 top-[-7px] h-2 w-4': position === 'bottom-right',
    'right-4 top-[-7px] h-2 w-4': position === 'bottom-left',

    '-left-[7px] top-4 h-4 w-2': position === 'right-top',
    '-left-[7px] bottom-4 h-4 w-2': position === 'right-bottom',
    '-right-[7px] top-4 h-4 w-2': position === 'left-top',
    '-right-[7px] bottom-4 h-4 w-2': position === 'left-bottom',
  })

  return (
    <div className={tooltipPopupStyle}>
      <div
        className={cx(
          'text-p3 sm:text-p2 z-20 m-0 flex w-fit min-w-[118px] max-w-[230px] flex-row justify-center break-words rounded border-0 bg-gray-700 px-3 py-2 text-white sm:max-w-[280px] sm:px-4 sm:py-3',
          className,
        )}
      >
        <div className="w-max">
          <AccountMarkdown content={text} variant="sm" uLinkVariant="primary" />
        </div>
      </div>
      {arrow && (
        <span className={tooltipArrowStyle}>
          {(position === 'top-left' ||
            position === 'top-right' ||
            position === 'bottom-left' ||
            position === 'bottom-right') && (
            <VerticalArrowIcon
              className={cx({
                'rotate-180': position === 'top-right' || position === 'top-left',
                'rotate-0': position === 'bottom-right' || position === 'bottom-left',
              })}
            />
          )}
          {(position === 'right-top' ||
            position === 'right-bottom' ||
            position === 'left-top' ||
            position === 'left-bottom') && (
            <HorizontalArrowIcon
              className={cx({
                'rotate-0': position === 'right-top' || position === 'right-bottom',
                'rotate-180': position === 'left-top' || position === 'left-bottom',
              })}
            />
          )}
        </span>
      )}
    </div>
  )
}

export default TooltipPopup
