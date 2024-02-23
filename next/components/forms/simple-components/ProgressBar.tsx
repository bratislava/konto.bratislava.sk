import cx from 'classnames'
import { useId } from 'react'
import { useProgressBar } from 'react-aria'

type ProgressBarBase = {
  type?: 'success' | 'default'
  label?: string
  value: number
  minValue?: number
  maxValue?: number
  className?: string
}

const ProgressBar = ({
  type = 'default',
  label,
  value = 0,
  minValue = 0,
  maxValue = 100,
  className,
}: ProgressBarBase) => {
  const id = useId()
  const { progressBarProps, labelProps } = useProgressBar({
    value,
    minValue,
    maxValue,
    label: label ?? id,
  })

  const percentage = (value - minValue) / (maxValue - minValue)
  const barWidth = `${Math.round(percentage * 100)}%`

  const progressBarStyleContainer = cx(
    'flex h-6 w-full flex-row items-center gap-4 p-0',
    className,
    {},
  )
  return (
    <div className="flex w-full flex-col">
      {label && <span {...labelProps}>{label}</span>}
      <div {...progressBarProps} className={progressBarStyleContainer}>
        <div className={cx('flex-column flex h-2 w-full items-center rounded-full bg-gray-200')}>
          <div
            style={{ width: barWidth }}
            className={cx('h-2 rounded-full', {
              'bg-gray-700': type === 'default',
              'bg-success-700': type === 'success',
            })}
          />
        </div>

        {/* "before" creates space for percentage value, so the progressbar doesn't change width */}
        <div className='text-p2 text-right before:invisible before:block before:h-0 before:overflow-hidden before:content-["100%"]'>{`${value}%`}</div>
      </div>
    </div>
  )
}

export default ProgressBar
