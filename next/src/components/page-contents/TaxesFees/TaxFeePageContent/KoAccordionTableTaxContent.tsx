import { ResponseCommunalWasteTaxItemizedAddressDto } from 'openapi-clients/tax'
import React, { PropsWithChildren, useRef } from 'react'

import { FormatCurrencyFromCents } from '@/src/components/formatting/formatCurrency'
import AccordionV2 from '@/src/components/simple-components/AccordionV2'
import { isDefined } from '@/src/frontend/utils/general'
import cn from '@/src/utils/cn'
import { useHorizontalScrollFade } from '@/src/utils/useHorizontalScrollFade'

type TableDataType = ResponseCommunalWasteTaxItemizedAddressDto[]
type TableHeaderDataType = TableDataType[0]

type KoAccordionTableTaxContentProps = {
  title: string
  secondTitle?: string
  data: TableDataType
}

type TableDataProps = {
  data: TableDataType
}

const tableHeaderData = {
  containerVolume: 'Objem nádoby',
  containerCount: 'Počet nádob',
  numberOfDisposals: 'Počet odvozov',
  unitRate: 'Sadzba',
  fee: 'Poplatok',
  containerType: null,
} satisfies Record<keyof TableHeaderDataType, string | null>

const TableHeader = () => {
  const headerData = Object.values(tableHeaderData)
    .filter(isDefined)
    // TODO why wrapped in span?
    .map((headerItem) => <span>{headerItem}</span>)

  return (
    <thead className="self-stretch bg-gray-50">
      <tr className="lg:border-b">
        {headerData.map((header, index) => (
          <th key={index} className="p-4 text-left text-16 font-semibold lg:px-6 lg:py-5">
            {header}
          </th>
        ))}
      </tr>
    </thead>
  )
}

const TableCell = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return <td className={cn('w-[10%] p-4 lg:px-6 lg:py-5', className)}>{children}</td>
}

const TableRows = ({ data }: TableDataProps) => {
  return (
    <tbody>
      {data?.map((container, index) => {
        const { containerVolume, containerCount, numberOfDisposals, unitRate, fee } = container

        return (
          <tr key={index} className="not-last:lg:border-b">
            <TableCell>{`${containerVolume} L`}</TableCell>
            <TableCell>{`${containerCount} ks`}</TableCell>
            <TableCell>{numberOfDisposals}</TableCell>
            <TableCell>{unitRate}</TableCell>
            <TableCell>
              <FormatCurrencyFromCents value={fee} />
            </TableCell>
          </tr>
        )
      })}
    </tbody>
  )
}

const Table = ({ data }: TableDataProps) => {
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const { scrollFadeClassNames } = useHorizontalScrollFade({ ref: tableWrapperRef })

  return (
    <div className="relative w-full">
      <div
        className={cn(
          'overflow-x-auto rounded-lg border border-solid border-gray-200',
          scrollFadeClassNames,
        )}
        ref={tableWrapperRef}
      >
        <table className="w-max table-auto sm:w-full">
          <TableHeader />
          <TableRows data={data} />
        </table>
      </div>
    </div>
  )
}

const KoAccordionTableTaxContent = ({
  title,
  secondTitle,
  data,
}: KoAccordionTableTaxContentProps) => {
  return (
    <AccordionV2
      title={
        <div className="flex min-w-0 grow justify-between text-h5 font-semibold">
          <h5>{title}</h5>
          <span>{secondTitle}</span>
        </div>
      }
      noTitleWrapper
    >
      <div className="flex size-full flex-col gap-6">
        <Table data={data} />
      </div>
    </AccordionV2>
  )
}

export default KoAccordionTableTaxContent
