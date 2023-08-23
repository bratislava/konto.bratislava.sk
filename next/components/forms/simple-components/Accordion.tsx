import { ChevronDownIcon, ProfileIcon } from '@assets/ui-icons'
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
    'no-tap-highlight flex w-full cursor-pointer flex-col gap-4 rounded-xl bg-gray-0',
    className,
    {
      'px-4 py-3 lg:p-4': accordionSize === 'xs',
      'p-4 lg:p-5': accordionSize === 'sm',
      'p-4 lg:px-8 lg:py-6': accordionSize === 'md',
      'px-6 py-5 lg:px-10 lg:py-8': accordionSize === 'lg',
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
      <div className={cx('flex w-full gap-4', {})}>
        {icon && (
          <div
            className={cx('flex items-center justify-center', {
              'h-6 w-6': accordionSize === 'sm' || accordionSize === 'xs',
              'h-8 w-8': accordionSize === 'md',
              'h-10 w-10': accordionSize === 'lg',
            })}
          >
            <ProfileIcon
              className={cx('fill-main-700', {
                'h-6 w-6': accordionSize === 'sm' || accordionSize === 'xs',
                'h-8 w-8': accordionSize === 'md',
                'h-10 w-10': accordionSize === 'lg',
              })}
            />
          </div>
        )}
        <div className="flex w-full flex-col gap-2 lg:gap-4">
          <div className="flex w-full justify-between gap-4">
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
                'text-p-base lg:text-h-md': size === 'md',
                'text-h-lg': size === 'lg',
              })}
            >
              {secondTitle}
            </div>
            <ChevronDownIcon
              className={cx('flex items-center justify-center text-negative-700', {
                'h-8 w-8 min-w-[32px] lg:h-10 lg:w-10 lg:min-w-[40px]': accordionSize === 'lg',
                'h-6 w-6 min-w-[24px] lg:h-8 lg:w-8 lg:min-w-[32px]': accordionSize === 'md',
                'h-6 w-6 min-w-[24px]': accordionSize === 'sm' || accordionSize === 'xs',
                'rotate-180 transform': isActive,
                'rotate-0 transform': !isActive,
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
