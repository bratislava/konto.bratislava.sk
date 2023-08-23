import { ChevronDownIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import { Tax } from '../../../frontend/dtos/taxDto'
import { formatCurrency } from '../../../frontend/utils/general'
import PersonIcon from '../icon-components/PersonIcon'
import AccountMarkdown from '../segments/AccountMarkdown/AccountMarkdown'
import AccountMarkdownModal from '../segments/AccountModal/AccountModal'

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
export type AccordionSizeType = 'xs' | 'sm' | 'md' | 'lg'

export type AccordionBase = {
  size: AccordionSizeType
  title: string
  secondTitle?: string
  dataType: string
  data: Tax['taxDetails']
  icon?: boolean
  shadow?: boolean
  className?: string
}
export const isAccordionSizeType = (size: string) =>
  ['xs', 'sm', 'md', 'lg'].includes(size) ? size : 'sm'

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

const TableRow = ({ dataType, data }: { dataType: string; data: Tax['taxDetails'] }) => {
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

const Table = ({ dataType, data }: { dataType: string; data: Tax['taxDetails'] }) => {
  return (
    <div className="no-scrollbar w-full overflow-x-auto">
      <table className="w-max table-auto border-separate border-spacing-0 rounded-lg border-2 border-solid border-gray-200 last:border-b-2 sm:w-full lg:rounded-none lg:border-0">
        <TableHeaderRow dataType={dataType} />
        <TableRow dataType={dataType} data={data} />
      </table>
    </div>
  )
}
const AccordionTableTaxContent = ({
  title,
  secondTitle,
  size = 'sm',
  icon = false,
  dataType,
  data,
  shadow = false,
  className,
}: AccordionBase) => {
  const [isActive, setIsActive] = useState(false)

  const accordionSize = isAccordionSizeType(size) as AccordionSizeType

  const TableContent = () => (
    <div className="flex h-full w-full flex-col gap-6">
      <Table dataType={dataType} data={data} />
      <div className="flex rounded-lg bg-gray-100 p-4 lg:bg-gray-0 lg:p-0">
        <div className="text-h4-bold grow">Celkom</div>
        <div className="text-h4-bold">{secondTitle}</div>
      </div>
    </div>
  )

  const paddingStyles = cx({
    'px-4 py-3 lg:p-4': accordionSize === 'xs',
    'p-4 lg:p-5': accordionSize === 'sm',
    'p-4 lg:px-8 lg:py-6': accordionSize === 'md',
    'px-6 py-5 lg:px-10 lg:py-8': accordionSize === 'lg',
  })

  const accordionHeaderStyle = cx(
    'flex w-full flex-col gap-4 rounded-xl bg-gray-0',
    className,
    paddingStyles,
  )
  const accordionContainerStyle = cx('flex w-full flex-col rounded-xl bg-gray-0', className, {
    'border-gray-200': !isActive && !shadow,
    'border-gray-700': isActive && !shadow,
    'border-2 border-solid hover:border-gray-500': !shadow,
    'border-2 border-solid hover:border-gray-700': !shadow && isActive,
    'hover:shadow-[0_8px_16px_0_rgba(0,0,0,0.08)]': shadow,
    'shadow-[0_0_16px_0_rgba(0,0,0,0.08)]': isActive && shadow,
    'shadow-[0_4px_16px_0_rgba(0,0,0,0.08)]': !isActive && shadow,
  })
  return (
    <div className="h-auto w-full">
      <div className="block lg:hidden">
        <AccountMarkdownModal
          show={isActive}
          onClose={() => setIsActive(false)}
          content={<TableContent />}
          onSubmit={() => {}}
          header={title}
        />
      </div>
      <div className={accordionContainerStyle}>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={cx('no-tap-highlight flex gap-4', accordionHeaderStyle)}
        >
          {icon && (
            <div
              className={cx('flex items-center justify-center', {
                'h-6 w-6': accordionSize === 'sm' || accordionSize === 'xs',
                'h-8 w-8': accordionSize === 'md',
                'h-10 w-10': accordionSize === 'lg',
              })}
            >
              <PersonIcon
                className={cx('', {
                  'h-4 w-4': accordionSize === 'sm' || accordionSize === 'xs',
                  'h-5 w-5': accordionSize === 'md',
                  'h-6 w-6': accordionSize === 'lg',
                })}
              />
            </div>
          )}
          <div className="flex w-full flex-col gap-2 lg:gap-4">
            <div className="flex items-center gap-4">
              <div className="flex grow flex-col items-start sm:flex-row">
                <div
                  className={cx('flex grow', {
                    'text-h6': accordionSize === 'xs',
                    'text-h5': accordionSize === 'sm',
                    'text-h4': accordionSize === 'md',
                    'text-h3': accordionSize === 'lg',
                  })}
                >
                  {title}
                </div>
                <div
                  className={cx('md:font-semibold', {
                    'text-p-base': size === 'xs',
                    'text-h-base': size === 'sm',
                    'text-p-base md:text-h-md': size === 'md',
                    'text-h-lg': size === 'lg',
                  })}
                >
                  {secondTitle}
                </div>
              </div>
              <ChevronDownIcon
                className={cx('flex items-center justify-center text-main-700', {
                  'h-8 w-8 lg:h-10 lg:w-10': accordionSize === 'lg',
                  'h-6 w-6 lg:h-8 lg:w-8': accordionSize === 'md',
                  'h-6 w-6': accordionSize === 'sm' || accordionSize === 'xs',
                  'rotate-180 transform': isActive,
                  'rotate-270 transform md:rotate-0': !isActive,
                })}
              />
            </div>
          </div>
        </button>
        <div
          className={cx('h-0.5 w-full bg-gray-200', {
            hidden: !isActive,
          })}
        />
        {isActive && (
          <div
            className={cx('hidden flex-col font-normal lg:block', paddingStyles, {
              'text-h6': accordionSize === 'sm' || accordionSize === 'xs',
              'text-20': accordionSize === 'lg' || accordionSize === 'md',
            })}
          >
            <TableContent />
          </div>
        )}
      </div>
    </div>
  )
}

export default AccordionTableTaxContent
