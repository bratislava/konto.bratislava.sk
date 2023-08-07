import cx from 'classnames'
import React, { useRef } from 'react'
import { useDateSegment } from 'react-aria'
import { DateFieldState, DateSegment } from 'react-stately'

type DateSegmentBase = {
  segment: DateSegment
  state: DateFieldState
}

const DateTimeSegment = ({ segment, state }: DateSegmentBase) => {
  const ref = useRef<HTMLDivElement>(null)
  const { segmentProps } = useDateSegment(segment, state, ref)

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={cx('text-16', { 'focus:bg-gray-100 focus:outline-none': segment.isEditable })}
    >
      <span
        className={cx('w-full text-center uppercase group-focus:text-white', {
          'text-gray-500': segment?.isPlaceholder,
        })}
        style={{
          opacity: segment?.isPlaceholder ? '1' : '0',
        }}
      >
        {segment?.isPlaceholder ? segment?.placeholder : ''}
      </span>
      {segment?.isPlaceholder ? '' : segment?.text}
    </div>
  )
}

export default DateTimeSegment
