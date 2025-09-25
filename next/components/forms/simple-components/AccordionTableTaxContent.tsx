import { useTranslation } from 'next-i18next'
import {
  ResponseApartmentTaxDetailDto,
  ResponseConstructionTaxDetailDto,
  ResponseGroundTaxDetailDto,
} from 'openapi-clients/tax'
import React, { useRef } from 'react'

import cn from '../../../frontend/cn'
import { FormatCurrencyFromCents } from '../../../frontend/utils/formatCurrency'
import { useHorizontalScrollFade } from '../../../frontend/utils/useHorizontalScrollFade'
import AccordionV2 from './AccordionV2'

const tableHeaderData = {
  subject: <span>Predmet dane</span>,
  area: <span>Výmera</span>,
  baseMetric: <span>Základ dane</span>,
  baseMonetary: <span>Základ dane</span>,
  total: <span>Daň</span>,
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
  data:
    | ResponseGroundTaxDetailDto[]
    | ResponseConstructionTaxDetailDto[]
    | ResponseApartmentTaxDetailDto[]
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
    <thead className="self-stretch bg-gray-50">
      <tr className="lg:border-b-2">
        {headerData.map((header, index) => (
          <th
            key={index}
            className="p-4 text-left text-16 font-semibold not-first:text-center lg:px-6 lg:py-5"
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  )
}

const TableData = ({
  dataType,
  data,
}: {
  dataType: string
  data:
    | ResponseGroundTaxDetailDto[]
    | ResponseConstructionTaxDetailDto[]
    | ResponseApartmentTaxDetailDto[]
}) => {
  const { t } = useTranslation('account')

  return (
    <tbody>
      {data.map((taxDetail) => {
        return (
          <tr key={taxDetail.type} className="not-last:lg:border-b-2">
            <td className="h-max p-4 not-first:text-center not-first:text-20-semibold lg:px-6 lg:py-5">
              <div className="inline h-0 font-semibold">
                {t(`tax_detail_section.tax_type.${dataType}.ground_type.${taxDetail.type}.title`)}
              </div>
            </td>
            {dataType === 'GROUND' && (
              <td className="w-[15%] p-4 not-first:text-center not-first:text-16 lg:px-6 lg:py-5">
                {taxDetail.area} m<sup>2</sup>
              </td>
            )}
            <td className="w-[15%] p-4 not-first:text-center not-first:text-16 lg:px-6 lg:py-5">
              {typeof taxDetail.base === 'number'
                ? (taxDetail.base / 100).toFixed(2).replace('.', ',')
                : taxDetail.base}
            </td>
            {/* Buggy detection */}
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <td className="w-[15%] p-4 not-first:text-center not-first:text-16 lg:px-6 lg:py-5">
              <FormatCurrencyFromCents value={taxDetail.amount} />
            </td>
          </tr>
        )
      })}
    </tbody>
  )
}

const Table = ({
  dataType,
  data,
}: {
  dataType: string
  data:
    | ResponseGroundTaxDetailDto[]
    | ResponseConstructionTaxDetailDto[]
    | ResponseApartmentTaxDetailDto[]
}) => {
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const { scrollFadeClassNames } = useHorizontalScrollFade({ ref: tableWrapperRef })

  return (
    <div className="relative w-full">
      <div
        className={cn(
          'overflow-x-auto rounded-lg border-2 border-solid border-gray-200',
          scrollFadeClassNames,
        )}
        ref={tableWrapperRef}
      >
        <table className="w-max table-auto sm:w-full">
          <TableHeaderRow dataType={dataType} />
          <TableData dataType={dataType} data={data} />
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
      </div>
    </AccordionV2>
  )
}

export default AccordionTableTaxContent
