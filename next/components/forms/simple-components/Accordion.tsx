import ExpandMore from '@assets/images/new-icons/ui/expand.svg'
import PersonIcon from '@assets/images/new-icons/ui/profile.svg'
import cx from 'classnames'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import React, { useState } from 'react'

export type AccordionSizeType = 'xs' | 'sm' | 'md' | 'lg'

export type AccordionBase = {
  size: AccordionSizeType
  title: string
  secondTitle?: string
  content: string
  icon?: boolean
  shadow?: boolean
  className?: string
}
export const isAccordionSizeType = (size: string) =>
  ['xs', 'sm', 'md', 'lg'].includes(size) ? size : 'sm'

const Accordion = ({
  title,
  secondTitle,
  content,
  size = 'sm',
  icon = false,
  shadow = false,
  className,
}: AccordionBase) => {
  const [isActive, setIsActive] = useState(false)

  const accordionSize = isAccordionSizeType(size) as AccordionSizeType

  const accordionContainerStyle = cx(
    'no-tap-highlight flex flex-col gap-4 w-full rounded-xl bg-gray-0 cursor-pointer',
    className,
    {
      'px-4 py-3 lg:p-4': accordionSize === 'xs',
      'p-4 lg:p-5': accordionSize === 'sm',
      'p-4 lg:py-6 lg:px-8': accordionSize === 'md',
      'py-5 px-6 lg:py-8 lg:px-10': accordionSize === 'lg',
      'border-gray-200': !isActive && !shadow,
      'border-gray-700': isActive && !shadow,
      'border-2 border-solid hover:border-gray-500': !shadow,
      'border-2 border-solid hover:border-gray-700': !shadow && isActive,
      'hover:shadow-[0_8px_16px_0_rgba(0,0,0,0.08)]': shadow,
      'shadow-[0_0_16px_0_rgba(0,0,0,0.08)]': isActive && shadow,
      'shadow-[0_4px_16px_0_rgba(0,0,0,0.08)]': !isActive && shadow,
    },
  )

  return (
    <button
      type="button"
      onClick={() => setIsActive(!isActive)}
      className={accordionContainerStyle}
    >
      <div className={cx('w-full flex gap-4', {})}>
        {icon && (
          <div
            className={cx('flex items-center justify-center', {
              'w-6 h-6': accordionSize === 'sm' || accordionSize === 'xs',
              'w-8 h-8': accordionSize === 'md',
              'w-10 h-10': accordionSize === 'lg',
            })}
          >
            <PersonIcon
              className={cx('fill-main-700', {
                'w-6 h-6': accordionSize === 'sm' || accordionSize === 'xs',
                'w-8 h-8': accordionSize === 'md',
                'w-10 h-10': accordionSize === 'lg',
              })}
            />
          </div>
        )}
        <div className="flex w-full flex-col gap-2 lg:gap-4">
          <div className="w-full flex justify-between gap-4">
            <div
              className={cx('flex grow text-left', {
                'text-h6': accordionSize === 'xs',
                'text-h5': accordionSize === 'sm',
                'text-h4': accordionSize === 'md',
                'text-h3': accordionSize === 'lg',
              })}
            >
              {title}
            </div>
            <div
              className={cx('lg:font-semibold', {
                'text-p-base': size === 'xs',
                'text-h-base': size === 'sm',
                'lg:text-h-md text-p-base': size === 'md',
                'text-h-lg': size === 'lg',
              })}
            >
              {secondTitle}
            </div>
            <ExpandMore
              className={cx('flex items-center justify-center text-negative-700', {
                'lg:min-w-[40px] lg:w-10 lg:h-10 w-8 h-8 min-w-[32px]': accordionSize === 'lg',
                'lg:min-w-[32px] lg:w-8 lg:h-8 w-6 h-6 min-w-[24px]': accordionSize === 'md',
                'w-6 h-6 min-w-[24px]': accordionSize === 'sm' || accordionSize === 'xs',
                'transform rotate-180': isActive,
                'transform rotate-0': !isActive,
              })}
            />
          </div>
          {isActive && (
            <div
              className={cx('flex flex-col text-left font-normal', {
                'text-h6': accordionSize === 'sm' || accordionSize === 'xs',
                'text-20': accordionSize === 'lg' || accordionSize === 'md',
              })}
            >
              <AccountMarkdown content={content} className={className} />
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export default Accordion
