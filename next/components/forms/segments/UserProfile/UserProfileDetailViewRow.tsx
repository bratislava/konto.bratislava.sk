import * as React from 'react'

import BATooltip from '../../info-components/Tooltip/BATooltip'

interface UserProfileDetailViewRowProps {
  label: string
  value?: string | null
  tooltip?: string
}
const UserProfileDetailViewRow = ({ label, value, tooltip }: UserProfileDetailViewRowProps) => {
  return (
    <div
      className="flex w-full flex-col gap-2 md:flex-row"
      data-cy={`${label.replaceAll(' ', '-').toLowerCase()}-profile-row`}
    >
      <div className="flex flex-row items-center gap-3 md:w-1/2">
        <span className="text-p2-semibold">{label}</span>
        {tooltip && <BATooltip placement="top right">{tooltip}</BATooltip>}
      </div>
      <span className="text-p2 md:break-normal">{!value || value === '' ? '-' : value}</span>
    </div>
  )
}

export default UserProfileDetailViewRow
