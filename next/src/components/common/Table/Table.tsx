import { Typography } from '@bratislava/component-library'
import { ReactNode } from 'react'
import { Fragment } from 'react/jsx-runtime'

import Markdown from '@/src/components/formatting/Markdown'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'

type Props = {
  rows: { label: string; value: string; isMarkdown?: boolean }[]
  notification?: ReactNode
}

/**
 * Inspired by PaymentSchedule: https://github.com/bratislava/konto.bratislava.sk/blob/master/next/src/components/simple-components/PaymentSchedule.tsx
 */

const Table = ({ rows, notification }: Props) => {
  return (
    <ul className="flex w-full flex-col rounded-lg border border-gray-200 px-5 pt-2 pb-6 lg:px-6">
      {rows.map((row, index) => {
        return (
          <Fragment key={index}>
            {index > 0 && <HorizontalDivider asListItem />}
            <li className="flex flex-col gap-2 py-3 lg:flex-row lg:gap-4 lg:py-4">
              <Typography variant="p-small" as="span" className="flex-1 text-left font-semibold">
                {row.label}
              </Typography>

              {row.isMarkdown ? (
                <Markdown content={row.value} className="flex-1 text-left" variant="small" />
              ) : (
                <Typography variant="p-small" as="span" className="flex-1 text-left">
                  {row.value}
                </Typography>
              )}
            </li>
          </Fragment>
        )
      })}

      {notification}
    </ul>
  )
}

export default Table
