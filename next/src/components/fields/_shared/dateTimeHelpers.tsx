import {
  DateInputRenderProps,
  type DateSegmentProps,
  type GroupRenderProps,
} from 'react-aria-components/DatePicker'

import cn from '@/src/utils/cn'

export const dateOrTimeContainerClassName = ({
  isFocusWithin,
  isDisabled,
  isInvalid,
}: DateInputRenderProps | GroupRenderProps) =>
  cn(
    'flex w-full items-center rounded-lg border bg-background-passive-base text-size-p-small-r text-content-passive-secondary outline-hidden lg:text-size-p-small',
    'px-3 py-2 lg:px-4 lg:py-3',
    {
      'border-border-active-default': !isInvalid && !isFocusWithin,
      'border-border-active-focused': !isInvalid && isFocusWithin,
      'border-border-error': isInvalid,
      'border-border-active-disabled bg-background-passive-tertiary': isDisabled,
      'hover:border-border-active-hover': !isDisabled && !isInvalid && !isFocusWithin,
    },
  )

const commonDateSegmentClassName: DateSegmentProps['className'] =
  'rounded-sm px-0.5 type-literal:p-0 whitespace-nowrap caret-transparent outline-hidden placeholder:text-content-passive-tertiary focus:bg-background-passive-secondary'

export const timeSegmentClassName = commonDateSegmentClassName

// Remove space before dots using negative margin
export const dateSegmentClassName = cn(
  commonDateSegmentClassName,
  'base-focus-ring type-literal:-ml-0.5',
)
