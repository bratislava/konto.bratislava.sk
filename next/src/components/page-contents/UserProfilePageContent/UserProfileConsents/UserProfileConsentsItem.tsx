import { Typography } from '@bratislava/component-library'

import Markdown from '@/src/components/formatting/Markdown'
import Toggle from '@/src/components/simple-components/Toggle'

type Consent = {
  id: string
  title: string
  text: string
  isDisabled: boolean
  isSelected: boolean
}

type Props = {
  consent: Consent
  onChange: (isSelected: boolean) => void
}

const UserProfileConsentsItem = ({ consent, onChange }: Props) => {
  return (
    <div
      className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center"
      data-cy={`${consent.id.replaceAll('_', '-')}-consent`}
    >
      <div className="flex flex-col gap-2">
        <Typography variant="h5" as="h3">
          {consent.title}
        </Typography>
        <Markdown variant="small" content={consent.text} />
      </div>
      <Toggle
        id={consent.id}
        isSelected={consent.isSelected}
        isDisabled={consent.isDisabled}
        onChange={onChange}
      />
    </div>
  )
}

export default UserProfileConsentsItem
