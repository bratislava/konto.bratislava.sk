import { Button, Typography } from '@bratislava/component-library'
import { createCalendar } from '@internationalized/date'
import { useTranslation } from 'next-i18next/pages'
import { useRef } from 'react'
import { useLocale } from 'react-aria/I18nProvider'
import { useCalendar } from 'react-aria/useCalendar'
import { useCalendarState } from 'react-stately/useCalendarState'

import Icon from '@/src/components/icon-components/Icon'

import CalendarGrid from './CalendarGrid'

type CalendarBase = {
  onConfirm?: () => void
  onReset?: () => void
}

const Calendar = ({ onConfirm, onReset, ...rest }: CalendarBase) => {
  const { t } = useTranslation('account')
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

  return (
    <div
      {...calendarProps}
      ref={ref}
      className="w-full max-w-xs rounded-lg border border-gray-700 bg-white"
    >
      <div className="flex justify-between px-4 py-3">
        <Button
          {...prevButtonPropsFixed}
          variant="icon-wrapped-negative-margin"
          icon={<Icon name="chevron-left" />}
          aria-label={t('DatePicker.aria.previousMonth')}
        />
        <Typography variant="p-small" as="span" className="font-semibold">
          {title.charAt(0).toUpperCase() + title.slice(1)}
        </Typography>
        <Button
          {...nextButtonPropsFixed}
          variant="icon-wrapped-negative-margin"
          icon={<Icon name="chevron-right" />}
          aria-label={t('DatePicker.aria.nextMonth')}
        />
      </div>
      <CalendarGrid state={state} />
      <div className="flex items-stretch justify-between border-t border-gray-700 px-4 py-3">
        <Button onPress={onReset} variant="plain" size="small">
          {t('DatePicker.reset')}
        </Button>
        <Button onPress={onConfirm} variant="solid" size="small">
          {t('DatePicker.confirm')}
        </Button>
      </div>
    </div>
  )
}

export default Calendar
