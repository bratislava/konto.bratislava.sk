import { ChevronLeftIcon, ChevronRightIcon } from '@assets/ui-icons'
import { createCalendar } from '@internationalized/date'
import { useRef } from 'react'
import { useCalendar, useLocale } from 'react-aria'
import { useCalendarState } from 'react-stately'

import Button from '../../../simple-components/Button'
import CalendarGrid from './CalendarGrid'

type CalendarBase = {
  onConfirm?: () => void
  onReset?: () => void
}

const Calendar = ({ onConfirm, onReset, ...rest }: CalendarBase) => {
  const { locale } = useLocale()
  const state = useCalendarState({
    ...rest,
    locale,
    createCalendar,
  })
  const ref = useRef<HTMLDivElement>(null)
  const { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar({ ...rest }, state)

  const prevButtonPropsFixed = {
    ...prevButtonProps,
    children: undefined,
    href: undefined,
    target: undefined,
  }

  const nextButtonPropsFixed = {
    ...nextButtonProps,
    children: undefined,
    href: undefined,
    target: undefined,
  }

  // FIXME Translations
  // TODO Translations
  return (
    <div
      {...calendarProps}
      ref={ref}
      className="w-full max-w-xs rounded-lg border-2 border-gray-700 bg-white"
    >
      <div className="flex justify-between px-4 py-3">
        <Button
          {...prevButtonPropsFixed}
          variant="icon-wrapped-negative-margin"
          icon={<ChevronLeftIcon />}
          aria-label="Left"
        />
        <span className="text-p2-semibold">{title.charAt(0).toUpperCase() + title.slice(1)}</span>
        <Button
          {...nextButtonPropsFixed}
          variant="icon-wrapped-negative-margin"
          icon={<ChevronRightIcon />}
          aria-label="Right"
        />
      </div>
      <CalendarGrid state={state} />
      <div className="flex items-stretch justify-between border-t-2 border-gray-700 px-4 py-3">
        <Button onPress={onReset} variant="black-plain" size="small">
          Resetovať
        </Button>
        <Button onPress={onConfirm} variant="black-solid" size="small">
          Potvrdiť
        </Button>
      </div>
    </div>
  )
}

export default Calendar
