import { Typography } from '@bratislava/component-library'

import Icon from '@/src/components/icon-components/Icon'

type LinkRowCardProps = {
  title: string
  link: string
}

const LinkRowCard = ({ title, link }: LinkRowCardProps) => {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      <li className="px-6">
        <div className="flex flex-row items-center justify-between gap-4 border-b border-gray-200 py-4">
          <div className="flex flex-row items-center gap-4">
            <Icon
              name="attachment"
              className="size-12 rounded-lg bg-background-passive-secondary p-3"
            />

            <div className="flex flex-col gap-1">
              <Typography variant="h6">{title}</Typography>

              <Typography variant="p-small">{link}</Typography>
            </div>
          </div>

          <div className="flex flex-row items-center gap-2">
            <Typography variant="p-small">Prejsť na dokument</Typography>

            <Icon name="arrow-right" />
          </div>
        </div>
      </li>
    </a>
  )
}

export default LinkRowCard
