import { ArrowRightIcon, ChevronRightIcon } from '@assets/ui-icons'
import cx from 'classnames'

type PaginationArrowBase = {
  orientation?: 'left' | 'right'
  onPress?: () => void
}

const PaginationArrow = ({ onPress, orientation = 'right' }: PaginationArrowBase) => {
  return (
    <div
      className={cx('group h-6 w-6 cursor-pointer text-gray-700', {
        'ml-0 md:ml-3': orientation === 'right',
        'mr-0 md:mr-3': orientation === 'left',
      })}
    >
      <span className="flex h-full items-center justify-center group-hover:hidden">
        <ChevronRightIcon className={cx('h-6 w-6', { 'rotate-180': orientation === 'left' })} />
      </span>
      <span className="hidden items-center justify-center text-gray-700 group-hover:flex">
        <ArrowRightIcon
          onClick={onPress}
          className={cx('h-6 w-6', { 'rotate-180': orientation === 'left' })}
        />
      </span>
    </div>
  )
}

export default PaginationArrow
