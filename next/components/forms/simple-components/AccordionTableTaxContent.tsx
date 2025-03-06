import { ResponseTaxDetailsDto } from '@clients/openapi-tax'
import { useTranslation } from 'next-i18next'
import React, { useRef } from 'react'

import cn from '../../../frontend/cn'
import { FormatCurrencyFromCents } from '../../../frontend/utils/formatCurrency'
import { useHorizontalScrollFade } from '../../../frontend/utils/useHorizontalScrollFade'
import AccordionV2 from './AccordionV2'

const tableHeaderData = {
  subject: <span>Predmet dane</span>,
  area: (
    <span>
      Výmera pozemku v m<sup>2</sup>
    </span>
  ),
  baseMetric: (
    <span>
      Základ dane m<sup>2</sup>
    </span>
  ),
  baseMonetary: <span>Základ dane v EUR</span>,
  total: <span>Daň v EUR</span>,
}

const matchHeader = {
  GROUND: [tableHeaderData.area, tableHeaderData.baseMonetary, tableHeaderData.total],
  CONSTRUCTION: [tableHeaderData.baseMetric, tableHeaderData.total],
  APARTMENT: [tableHeaderData.baseMetric, tableHeaderData.total],
}

type AccordionTableTaxContentProps = {
  title: string
  secondTitle?: string
  dataType: string
  data: ResponseTaxDetailsDto[]
}

const TableHeaderRow = ({ dataType }: { dataType: string }) => {
  // TODO types can be better if validated as they come from API
  const headerData = [
    <span>Predmet dane</span>,
    ...(Object.keys(matchHeader).includes(dataType)
      ? (matchHeader[dataType] as
          | typeof matchHeader.GROUND
          // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
          | typeof matchHeader.CONSTRUCTION
          // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
          | typeof matchHeader.APARTMENT)
      : matchHeader.APARTMENT),
  ]

  return (
    <thead className="self-stretch bg-gray-50 lg:bg-gray-0">
      <tr>
        {headerData.map((header, index) => (
          <th
            key={index}
            className="border-spacing-0 border-b-2 p-4 text-left text-16 not-first:text-center first:rounded-tl last:rounded-tr lg:p-0 lg:py-4"
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  )
}

const TableRow = ({ dataType, data }: { dataType: string; data: ResponseTaxDetailsDto[] }) => {
  const { t } = useTranslation('account')
  return (
    <tbody>
      {data.map((taxDetail) => {
        return (
          <tr key={taxDetail.id}>
            <td className="h-max border-r-2 p-4 not-first:text-center not-first:text-20-semibold last:border-r-0 lg:p-0 lg:py-4">
              <div className="inline h-0 font-semibold">
                {t(
                  `tax_detail_section.tax_type.${dataType}.ground_type.${taxDetail.areaType}.title`,
                )}
              </div>
              <br />
              {t(
                `tax_detail_section.tax_type.${dataType}.ground_type.${taxDetail.areaType}.description`,
              )}
            </td>
            {dataType === 'GROUND' && (
              <td className="w-[15%] border-r-2 p-4 not-first:text-center not-first:text-16-semibold last:border-r-0 lg:p-0 lg:py-4 lg:not-first:text-20-semibold">
                {taxDetail.area}
              </td>
            )}
            <td className="w-[15%] border-r-2 p-4 not-first:text-center not-first:text-16-semibold last:border-r-0 lg:p-0 lg:py-4 lg:not-first:text-20-semibold">
              {typeof taxDetail.base === 'number'
                ? (taxDetail.base / 100).toFixed(2).replace('.', ',')
                : taxDetail.base}
            </td>
            {/* Buggy detection */}
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <td className="w-[15%] border-r-2 p-4 not-first:text-center not-first:text-16-semibold last:border-r-0 lg:p-0 lg:py-4 lg:not-first:text-20-semibold">
              <FormatCurrencyFromCents value={taxDetail.amount} />
            </td>
          </tr>
        )
      })}
    </tbody>
  )
}

const Table = ({ dataType, data }: { dataType: string; data: ResponseTaxDetailsDto[] }) => {
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const { scrollFadeClassNames } = useHorizontalScrollFade({ ref: tableWrapperRef })

  return (
    <div className="relative w-full">
      <div className={cn('overflow-x-auto', scrollFadeClassNames)} ref={tableWrapperRef}>
        <table className="w-max table-auto border-separate border-spacing-0 rounded-lg border-2 border-solid border-gray-200 last:border-b-2 sm:w-full lg:rounded-none lg:border-0">
          <TableHeaderRow dataType={dataType} />
          <TableRow dataType={dataType} data={data} />
        </table>
      </div>
    </div>
  )
}
const AccordionTableTaxContent = ({
  title,
  secondTitle,
  dataType,
  data,
}: AccordionTableTaxContentProps) => {
  return (
    <AccordionV2
      title={
        <div className="flex min-w-0 grow justify-between text-h4 font-semibold">
          <h3>{title}</h3>
          <span>{secondTitle}</span>
        </div>
      }
      noTitleWrapper
    >
      <div className="flex size-full flex-col gap-6">
        <Table dataType={dataType} data={data} />
        <div className="flex rounded-lg bg-gray-100 p-4 lg:bg-gray-0 lg:p-0">
          <div className="grow text-h4-semibold">Celkom</div>
          <div className="text-h4-semibold">{secondTitle}</div>
        </div>
      </div>
    </AccordionV2>
  )
}

export default AccordionTableTaxContent
