import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import {
  ResponseApartmentTaxDetailDto,
  ResponseConstructionTaxDetailDto,
  ResponseGroundTaxDetailDto,
} from 'openapi-clients/tax'
import { useRef } from 'react'

import { FormatCurrencyFromCents } from '@/src/components/formatting/formatCurrency'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import cn from '@/src/utils/cn'
import { useHorizontalScrollFade } from '@/src/utils/useHorizontalScrollFade'

type Props = {
  title: string
  secondTitle?: string
  dataType: string
  data:
    | ResponseGroundTaxDetailDto[]
    | ResponseConstructionTaxDetailDto[]
    | ResponseApartmentTaxDetailDto[]
}

const TableHeaderRow = ({ dataType }: { dataType: string }) => {
  const { t } = useTranslation()

  const matchHeader: Record<string, string[]> = {
    GROUND: [
      t('DznAccordionContent.area'),
      t('DznAccordionContent.baseMonetary'),
      t('DznAccordionContent.total'),
    ],
    CONSTRUCTION: [t('DznAccordionContent.baseMetric'), t('DznAccordionContent.total')],
    APARTMENT: [t('DznAccordionContent.baseMetric'), t('DznAccordionContent.total')],
  }

  const headerData = [
    t('DznAccordionContent.subject'),
    ...(matchHeader[dataType] ?? matchHeader.APARTMENT),
  ]

  return (
    <thead className="self-stretch bg-gray-50">
      <tr className="lg:border-b">
        {headerData.map((header, index) => (
          <th
            key={index}
            className="p-4 text-left text-size-p-small-r font-semibold not-first:text-center lg:px-6 lg:py-5 lg:text-size-p-small"
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
  const { t } = useTranslation()

  const translationMap = {
    GROUND: {
      A: t('DznAccordionContent.groundTypes.GROUND.A'),
      B: t('DznAccordionContent.groundTypes.GROUND.B'),
      C: t('DznAccordionContent.groundTypes.GROUND.C'),
      D: t('DznAccordionContent.groundTypes.GROUND.D'),
      E: t('DznAccordionContent.groundTypes.GROUND.E'),
      F: t('DznAccordionContent.groundTypes.GROUND.F'),
      G: t('DznAccordionContent.groundTypes.GROUND.G'),
      H: t('DznAccordionContent.groundTypes.GROUND.H'),
    },
    CONSTRUCTION: {
      A: t('DznAccordionContent.groundTypes.CONSTRUCTION.A'),
      B: t('DznAccordionContent.groundTypes.CONSTRUCTION.B'),
      C: t('DznAccordionContent.groundTypes.CONSTRUCTION.C'),
      D: t('DznAccordionContent.groundTypes.CONSTRUCTION.D'),
      E: t('DznAccordionContent.groundTypes.CONSTRUCTION.E'),
      F: t('DznAccordionContent.groundTypes.CONSTRUCTION.F'),
      G: t('DznAccordionContent.groundTypes.CONSTRUCTION.G'),
      jH: t('DznAccordionContent.groundTypes.CONSTRUCTION.jH'),
      jI: t('DznAccordionContent.groundTypes.CONSTRUCTION.jI'),
      H: t('DznAccordionContent.groundTypes.CONSTRUCTION.H'),
    },
    APARTMENT: {
      byt: t('DznAccordionContent.groundTypes.APARTMENT.byt'),
      nebyt: t('DznAccordionContent.groundTypes.APARTMENT.nebyt'),
    },
  } as const

  return (
    <tbody>
      {data?.map((taxDetail) => {
        const title =
          dataType in translationMap && taxDetail.type in translationMap[dataType]
            ? translationMap[dataType][taxDetail.type]
            : taxDetail.type

        return (
          <tr key={taxDetail.type} className="not-last:lg:border-b">
            <td className="h-max p-4 not-first:text-center not-first:text-size-p-large lg:px-6 lg:py-5 not-first:lg:text-size-p-large">
              <div className="inline h-0 font-semibold">{title}</div>
            </td>
            {dataType === 'GROUND' && (
              <td className="w-[15%] p-4 not-first:text-center not-first:text-size-p-small-r lg:px-6 lg:py-5 not-first:lg:text-size-p-small">
                {taxDetail.area} m<sup>2</sup>
              </td>
            )}
            <td className="w-[15%] p-4 not-first:text-center not-first:text-size-p-small-r lg:px-6 lg:py-5 not-first:lg:text-size-p-small">
              {typeof taxDetail.base === 'number'
                ? (taxDetail.base / 100).toFixed(2).replace('.', ',')
                : taxDetail.base}
            </td>
            <td className="w-[15%] p-4 not-first:text-center not-first:text-size-p-small-r lg:px-6 lg:py-5 not-first:lg:text-size-p-small">
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
          'overflow-x-auto rounded-lg border border-solid border-gray-200',
          scrollFadeClassNames,
        )}
        ref={tableWrapperRef}
      >
        <table className="w-max table-auto lg:w-full">
          <TableHeaderRow dataType={dataType} />
          <TableData dataType={dataType} data={data} />
        </table>
      </div>
    </div>
  )
}

const DznAccordionContent = ({ title, secondTitle, dataType, data }: Props) => {
  return (
    <DisclosureGroup className="w-full rounded-lg border border-border-active-default bg-background-passive-base py-2">
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
            <Table dataType={dataType} data={data} />
          </div>
        </DisclosurePanel>
      </Disclosure>
    </DisclosureGroup>
  )
}

export default DznAccordionContent
