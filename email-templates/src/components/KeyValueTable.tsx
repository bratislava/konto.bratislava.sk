import type { ReactNode } from 'react'

type KeyValueTableProps = {
  rows: Array<{ label: string; value: ReactNode }>
}

/** Labelled values, such as the details of a submission. A table in the plain-text version too. */
export const KeyValueTable = ({ rows }: KeyValueTableProps) => (
  <table
    role="presentation"
    width="100%"
    cellPadding={0}
    cellSpacing={0}
    border={0}
    className="mb-[16px]"
    data-text-format="dataTable"
  >
    <tbody>
      {rows.map((row) => (
        <tr key={row.label}>
          <td className="ba-text-secondary w-[35%] py-[6px] pr-[16px] align-top font-sans text-[14px] leading-[20px] text-ink-secondary">
            {row.label}
          </td>
          <td className="ba-text py-[6px] align-top font-sans text-[14px] leading-[20px] text-ink">
            {row.value}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)
