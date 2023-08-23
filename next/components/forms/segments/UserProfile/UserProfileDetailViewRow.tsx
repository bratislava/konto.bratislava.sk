import cx from 'classnames'
import Tooltip from 'components/forms/info-components/Tooltip/Tooltip'

interface UserProfileDetailViewRowProps {
  label: string
  value?: string | null
  tooltip?: string
}
const UserProfileDetailViewRow = ({ label, value, tooltip }: UserProfileDetailViewRowProps) => {
  return (
    <div className={cx('flex w-full flex-col gap-2', 'md:flex-row')}>
      <div className={cx('flex flex-row items-center gap-3', 'md:w-1/2')}>
        <span className="text-p2-semibold">{label}</span>
        {tooltip && <Tooltip position="top-right" text={tooltip} />}
      </div>
      <span className={cx('text-p2', 'md:break-normal')}>
        {!value || value === '' ? '-' : value}
      </span>
    </div>
  )
}

export default UserProfileDetailViewRow
