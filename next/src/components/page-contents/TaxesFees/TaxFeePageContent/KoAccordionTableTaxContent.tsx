import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { ResponseCommunalWasteTaxItemizedAddressDto } from 'openapi-clients/tax'
import { PropsWithChildren, useRef } from 'react'

import { FormatCurrencyFromCents } from '@/src/components/formatting/formatCurrency'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
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

const TableHeader = () => {
  const { t } = useTranslation('account')

  const tableHeaderData = {
    containerVolume: t('tax_detail_section.ko_table.container_volume'),
    containerCount: t('tax_detail_section.ko_table.container_count'),
    numberOfDisposals: t('tax_detail_section.ko_table.number_of_disposals'),
    unitRate: t('tax_detail_section.ko_table.unit_rate'),
    fee: t('tax_detail_section.ko_table.fee'),
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

const KoAccordionTableTaxContent = ({
  title,
  secondTitle,
  data,
}: KoAccordionTableTaxContentProps) => {
  return (
    <DisclosureGroup className="py-2">
      <Disclosure>
        <DisclosureHeader className="px-4 py-2 ring-inset lg:px-6 lg:py-3">
          <div className="flex w-full justify-between pr-4">
            <Typography variant="h5">{title}</Typography>

            <Typography variant="h5" as="span" className="font-semibold">
              {secondTitle}
            </Typography>
          </div>
        </DisclosureHeader>
        <DisclosurePanel className="px-4 lg:px-6">
          <div className="flex size-full flex-col gap-6">
            <Table data={data} />
          </div>
        </DisclosurePanel>
      </Disclosure>
    </DisclosureGroup>
  )
}

export default KoAccordionTableTaxContent
