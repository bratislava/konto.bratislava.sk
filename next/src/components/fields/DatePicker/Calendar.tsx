import { Button } from '@bratislava/component-library'
import {
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
import cn from '@/src/utils/cn'

import ClearButton from './ClearButton'

const Calendar = (props: RACCalendarProps<DateValue>) => (
  <RACCalendar
    {...props}
    className="overflow-clip rounded-lg border border-border-active-primary-default bg-background-passive-base"
  >
    {/* Notes to arrow buttons */}
    {/*  - aria-labels - RAC adds proper aria-labels based on slots. Since our Button with icon prop has required aria-label, here we use icon in children */}
    {/*  - styling - plain variant is used for hover styles, size="small" + custom padding + negative margin is used similarly as ison-with-negative-margin */}
    <div className="flex items-center gap-2 border-b border-border-active-primary-default bg-background-passive-base p-4">
      <Button slot="previous" variant="plain" className="-m-2 p-2" size="small">
        <ChevronLeftIcon />
      </Button>
      {/* FIXME Typography */}
      <RACHeading
        level={2}
        className="flex-1 text-center text-p2-semibold first-letter:uppercase"
      />
      <Button slot="next" variant="plain" className="-m-2 p-2" size="small">
        <ChevronRightIcon />
      </Button>
    </div>

    <RACCalendarGrid className="w-full border-separate border-spacing-0">
      <RACCalendarGridHeader>
        {(day) => (
          <RACCalendarHeaderCell className="border-b border-border-active-primary-default bg-background-passive-primary p-3 text-p3-semibold text-content-passive-secondary">
            {day}
          </RACCalendarHeaderCell>
        )}
      </RACCalendarGridHeader>
      <RACCalendarGridBody>
        {/*  FIXME Typography */}
        {(date) => (
          <RACCalendarCell
            date={date}
            className={cn(
              'base-focus-ring ring-offset-2!', // Making ring-offset small to not overlap so much with the grid
              'grid size-10 cursor-pointer place-items-center rounded-lg text-center text-p2 outline-hidden',
              'hover:bg-background-active-primary-soft-hover disabled:cursor-not-allowed disabled:text-content-passive-tertiary',
              'unavailable:line-through outside-month:text-content-passive-tertiary',
              'selected:bg-background-active-primary-default selected:text-content-active-primary-inverted-default',
            )}
          />
        )}
      </RACCalendarGridBody>
    </RACCalendarGrid>

    <div className="flex justify-end border-t border-border-active-primary-default px-4 py-2">
      <ClearButton />
    </div>
  </RACCalendar>
)

export default Calendar
