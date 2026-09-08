import { useTranslation } from 'next-i18next/pages'
import { ResponseCommunalWasteTaxItemizedAddressDto } from 'openapi-clients/tax'
import { PropsWithChildren, useRef } from 'react'

import { FormatCurrencyFromCents } from '@/src/components/formatting/formatCurrency'
import TaxDisclosure from '@/src/components/page-contents/TaxesPageContent/TaxPageContent/TaxAccordions/TaxDisclosure'
import { isDefined } from '@/src/frontend/utils/general'
import cn from '@/src/utils/cn'
import { useHorizontalScrollFade } from '@/src/utils/useHorizontalScrollFade'

type TableDataType = ResponseCommunalWasteTaxItemizedAddressDto[]
type TableHeaderDataType = TableDataType[0]

type Props = {
  title: string
  secondTitle?: string
  data: TableDataType
}

type TableDataProps = {
  data: TableDataType
}

const TableHeader = () => {
  const { t } = useTranslation()

  const tableHeaderData = {
    containerVolume: t('KoAccordionContent.containerVolume'),
    containerCount: t('KoAccordionContent.containerCount'),
    numberOfDisposals: t('KoAccordionContent.numberOfDisposals'),
    unitRate: t('KoAccordionContent.unitRate'),
    fee: t('KoAccordionContent.fee'),
    containerType: null,
  } satisfies Record<keyof TableHeaderDataType, string | null>

  const headerData = Object.values(tableHeaderData).filter(isDefined)

  return (
    <thead className="self-stretch bg-gray-50">
      <tr className="lg:border-b">
        {headerData.map((header, index) => (
          <th
            key={index}
            className="p-4 text-left text-size-p-small-r font-semibold lg:px-6 lg:py-5 lg:text-size-p-small"
          >
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
        <table className="w-max table-auto lg:w-full">
          <TableHeader />
          <TableRows data={data} />
        </table>
      </div>
    </div>
  )
}

const KoAccordionContent = ({ title, secondTitle, data }: Props) => {
  return (
    <TaxDisclosure title={title} secondTitle={secondTitle}>
      <Table data={data} />
    </TaxDisclosure>
  )
}

export default KoAccordionContent
