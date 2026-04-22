import {
  Button as RACButton,
  Calendar as RACCalendar,
  CalendarCell as RACCalendarCell,
  CalendarGrid as RACCalendarGrid,
  CalendarProps as RACCalendarProps,
  DateValue,
  Heading as RACHeading,
} from 'react-aria-components'

import { ChevronLeftIcon, ChevronRightIcon } from '@/src/assets/ui-icons'

import ClearButton from './ClearButton'

const Calendar = (props: RACCalendarProps<DateValue>) => (
  <RACCalendar
    {...props}
    className="w-full max-w-xs rounded-lg border border-border-active-default bg-background-passive-base"
  >
    <div className="flex items-center justify-between px-4 py-3">
      <RACButton
        slot="previous"
        className="flex size-6 items-center justify-center outline-hidden disabled:opacity-40"
      >
        <ChevronLeftIcon />
      </RACButton>
      <RACHeading
        level={2}
        className="text-p2-semibold first-letter:uppercase"
      />
      <RACButton
        slot="next"
        className="flex size-6 items-center justify-center outline-hidden disabled:opacity-40"
      >
        <ChevronRightIcon />
      </RACButton>
    </div>
    <RACCalendarGrid className="w-full border-separate border-spacing-y-1 px-4 pb-2">
      {(date) => (
        <RACCalendarCell
          date={date}
          className="data-[selected]:bg-background-active-primary-default data-[selected]:text-content-active-primary-inverted-default size-8 cursor-pointer rounded-sm text-center text-p2 outline-hidden data-disabled:cursor-not-allowed data-disabled:text-content-passive-tertiary data-focus-visible:ring-2 data-focus-visible:ring-border-active-focused data-hovered:bg-background-passive-tertiary data-outside-month:text-content-passive-tertiary data-unavailable:line-through"
        />
      )}
    </RACCalendarGrid>
    <div className="flex justify-end border-t border-border-active-default px-4 py-3">
      <ClearButton />
    </div>
  </RACCalendar>
)

export default Calendar
