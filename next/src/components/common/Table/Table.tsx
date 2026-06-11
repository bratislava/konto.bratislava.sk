import { Typography } from '@bratislava/component-library'
import { ReactNode } from 'react'
import { Fragment } from 'react/jsx-runtime'
import Markdown from 'src/components/formatting/Markdown'

import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'

type Props = {
  rows: { label: string; value: string }[]
  notification?: ReactNode
}

const Table = ({ rows, notification }: Props) => {
  return (
    <ul className="flex w-full flex-col rounded-lg border border-gray-200 px-5 py-2 lg:px-6">
      {rows.map((row, index) => {
        return (
          <Fragment key={index}>
            {index > 0 && <HorizontalDivider asListItem />}
            <li className="flex flex-col gap-2 py-3 lg:flex-row lg:gap-4 lg:py-4">
              <Typography variant="p-small" as="span" className="flex-1 text-left font-semibold">
                {row.label}
              </Typography>

              <Markdown content={row.value} className="flex-1 text-left" />
            </li>
          </Fragment>
        )
      })}

      {notification && <div className="pb-4">{notification}</div>}
    </ul>
  )
}

export default Table
