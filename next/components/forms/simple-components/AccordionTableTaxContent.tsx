import { ResponseTaxDetailsDto } from '@clients/openapi-tax'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatCurrency } from '../../../frontend/utils/general'
import AccountMarkdown from '../segments/AccountMarkdown/AccountMarkdown'
import AccordionV2 from './AccordionV2'

const tableHeaderData = {
  subject: 'Predmet dane',
  area: 'Výmera pozemku v m<sup>2</sup>',
  base: 'Základ dane m<sup>2</sup>',
  total: 'Daň v EUR',
}

const matchHeader = {
  GROUND: [tableHeaderData.area, tableHeaderData.base, tableHeaderData.total],
  CONSTRUCTION: [tableHeaderData.base, tableHeaderData.total],
  APARTMENT: [tableHeaderData.base, tableHeaderData.total],
}

export type AccordionBase = {
  title: string
  secondTitle?: string
  dataType: string
  data: ResponseTaxDetailsDto[]
}
const TableHeaderRow = ({ dataType }: { dataType: string }) => {
  // TODO types can be better if validated as they come from API
  const headerData = Object.keys(matchHeader).includes(dataType)
    ? (matchHeader[dataType] as
        | typeof matchHeader.GROUND
        // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
        | typeof matchHeader.CONSTRUCTION
        // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
        | typeof matchHeader.APARTMENT)
    : matchHeader.APARTMENT

  return (
    <thead className="self-stretch bg-gray-200 lg:bg-gray-0">
      <tr>
        <th className="text-16 border-spacing-0 border-b-2 p-4 text-left first:rounded-tl last:rounded-tr lg:p-0 lg:py-4 [&:not(:first-child)]:text-center">
          Predmet dane
        </th>
        {headerData?.map((header) => {
          return (
            // False positive
            // eslint-disable-next-line jsx-a11y/control-has-associated-label
            <th
              className="text-16 border-spacing-0 border-b-2 p-4 text-left first:rounded-tl last:rounded-tr lg:p-0 lg:py-4 [&:not(:first-child)]:text-center"
              key={header}
            >
              <AccountMarkdown content={`<div class="text-16 p-2">${header}</div>`} />
            </th>
          )
        })}
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
            <td className="[&:not(:first-child)]:text-20-semibold h-max border-r-2 p-4 last:border-r-0 lg:p-0 lg:py-4 [&:not(:first-child)]:text-center">
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
              <td className="lg:[&:not(:first-child)]:text-20-semibold [&:not(:first-child)]:text-16-semibold w-[15%] border-r-2 p-4 last:border-r-0 lg:p-0 lg:py-4 [&:not(:first-child)]:text-center">
                {taxDetail.area}
              </td>
            )}
            <td className="lg:[&:not(:first-child)]:text-20-semibold [&:not(:first-child)]:text-16-semibold w-[15%] border-r-2 p-4 last:border-r-0 lg:p-0 lg:py-4 [&:not(:first-child)]:text-center">
              {typeof taxDetail.base === 'number'
                ? (taxDetail.base / 100).toFixed(2).replace('.', ',')
                : taxDetail.base}
            </td>
            <td className="lg:[&:not(:first-child)]:text-20-semibold [&:not(:first-child)]:text-16-semibold w-[15%] border-r-2 p-4 last:border-r-0 lg:p-0 lg:py-4 [&:not(:first-child)]:text-center">
              {formatCurrency(taxDetail.amount)}
            </td>
          </tr>
        )
      })}
    </tbody>
  )
}

const Table = ({ dataType, data }: { dataType: string; data: ResponseTaxDetailsDto[] }) => {
  return (
    <div className="no-scrollbar w-full overflow-x-auto">
      <table className="w-max table-auto border-separate border-spacing-0 rounded-lg border-2 border-solid border-gray-200 last:border-b-2 sm:w-full lg:rounded-none lg:border-0">
        <TableHeaderRow dataType={dataType} />
        <TableRow dataType={dataType} data={data} />
      </table>
    </div>
  )
}
const AccordionTableTaxContent = ({ title, secondTitle, dataType, data }: AccordionBase) => {
  return (
    <AccordionV2
      title={
        <div className="text-h4 flex min-w-0 grow justify-between font-semibold">
          <h3>{title}</h3>
          <span>{secondTitle}</span>
        </div>
      }
      noTitleWrapper
    >
      <div className="flex size-full flex-col gap-6">
        <Table dataType={dataType} data={data} />
        <div className="flex rounded-lg bg-gray-100 p-4 lg:bg-gray-0 lg:p-0">
          <div className="text-h4-bold grow">Celkom</div>
          <div className="text-h4-bold">{secondTitle}</div>
        </div>
      </div>
    </AccordionV2>
  )
}

export default AccordionTableTaxContent
