import {
  Button as RACButton,
  Calendar as RACCalendar,
  CalendarCell as RACCalendarCell,
  CalendarGrid as RACCalendarGrid,
  CalendarGridBody as RACCalendarGridBody,
  CalendarGridHeader as RACCalendarGridHeader,
  CalendarHeaderCell as RACCalendarHeaderCell,
  CalendarProps as RACCalendarProps,
  DateValue,
  Heading as RACHeading,
} from 'react-aria-components'

import { ChevronLeftIcon, ChevronRightIcon } from '@/src/assets/ui-icons'

import ClearButton from './ClearButton'

const Calendar = (props: RACCalendarProps<DateValue>) => (
  <RACCalendar
    {...props}
    className="w-[304px] overflow-clip rounded-lg border border-border-active-default bg-background-passive-base"
  >
    <div className="flex items-center gap-2 border-b-2 border-border-active-default bg-background-passive-base p-4">
      <RACButton
        slot="previous"
        className="flex size-6 items-center justify-center outline-hidden disabled:opacity-40"
      >
        <ChevronLeftIcon />
      </RACButton>
      <RACHeading
        level={2}
        className="flex-1 text-center text-p2-semibold first-letter:uppercase"
      />
      <RACButton
        slot="next"
        className="flex size-6 items-center justify-center outline-hidden disabled:opacity-40"
      >
        <ChevronRightIcon />
      </RACButton>
    </div>
    <RACCalendarGrid className="w-full border-separate border-spacing-0">
      <RACCalendarGridHeader>
        {(day) => (
          <RACCalendarHeaderCell className="border-b-2 border-border-active-default bg-background-passive-primary p-3 text-p3-medium text-content-passive-secondary">
            {day}
          </RACCalendarHeaderCell>
        )}
      </RACCalendarGridHeader>
      <RACCalendarGridBody>
        {(date) => (
          <RACCalendarCell
            date={date}
            className="size-10 cursor-pointer rounded-lg text-center text-p2 outline-hidden data-[selected]:bg-background-active-primary-default data-[selected]:text-content-active-primary-inverted-default data-disabled:cursor-not-allowed data-disabled:text-content-passive-tertiary data-focus-visible:ring-2 data-focus-visible:ring-border-active-focused data-hovered:bg-background-passive-tertiary data-outside-month:text-content-passive-tertiary data-unavailable:line-through"
          />
        )}
      </RACCalendarGridBody>
    </RACCalendarGrid>
    <div className="flex justify-end border-t-2 border-border-active-default px-4 py-3">
      <ClearButton />
    </div>
  </RACCalendar>
)

export default Calendar
