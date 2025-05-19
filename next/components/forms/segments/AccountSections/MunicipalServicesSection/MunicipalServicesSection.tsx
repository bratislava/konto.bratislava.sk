import MunicipalServicesSectionHeader from 'components/forms/segments/AccountSectionHeader/MunicipalServicesSectionHeader'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import ServiceCard from 'components/forms/simple-components/ServiceCard'
import { MunicipalServicesCategories, serviceCards } from 'frontend/constants/constants'
import { isDefined } from 'frontend/utils/general'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { useWindowSize } from 'usehooks-ts'

import { useSsrAuth } from '../../../../../frontend/hooks/useSsrAuth'
import { SelectOption } from '../../../widget-components/SelectField/SelectField'

const enumOptions: SelectOption[] = [
  { value: 'ALL_CATEGORY', label: MunicipalServicesCategories.ALL_CATEGORY, description: '' },
  { value: 'TAXES_CATEGORY', label: MunicipalServicesCategories.TAXES_CATEGORY, description: '' },
  {
    value: 'CULTURE_CATEGORY',
    label: MunicipalServicesCategories.CULTURE_CATEGORY,
    description: '',
  },
  {
    value: 'TRANSPORT_CATEGORY',
    label: MunicipalServicesCategories.TRANSPORT_CATEGORY,
    description: '',
  },
  {
    value: 'SOCIAL_SERVICES_CATEGORY',
    label: MunicipalServicesCategories.SOCIAL_SERVICES_CATEGORY,
    description: '',
  },
  {
    value: 'ENVIROMENTS_CATEGORY',
    label: MunicipalServicesCategories.ENVIROMENTS_CATEGORY,
    description: '',
  },
  { value: 'BASKET_CATEGORY', label: MunicipalServicesCategories.BASKET_CATEGORY, description: '' },
  {
    value: 'MARIANUM_CATEGORY',
    label: MunicipalServicesCategories.MARIANUM_CATEGORY,
    description: '',
  },
  {
    value: 'ENTERTAINMENT_CATEGORY',
    label: MunicipalServicesCategories.QUICK_INTERVENTION_CATEGORY,
    description: '',
  },
  {
    value: 'CONSTRUCTION_CATEGORY',
    label: MunicipalServicesCategories.CONSTRUCTION_CATEGORY,
    description: '',
  },
  { value: 'JOIN_CATEGORY', label: MunicipalServicesCategories.JOIN_CATEGORY, description: '' },
  { value: 'GREEN_CATEGORY', label: MunicipalServicesCategories.GREEN_CATEGORY, description: '' },
  {
    value: 'PUBLIC_SPACE_CATEGORY',
    label: MunicipalServicesCategories.PUBLIC_SPACE_CATEGORY,
    description: '',
  },
]

const foMunicipalServicesSection = [
  1, 45, 44, 9, 19, 34, 35, 43, 47, 48, 49, 50, 51, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 33, 17,
  20, 21, 22, 23, 24, 25, 29, 26, 27, 28, 32, 18, 46,
]
const poMunicipalServicesSection = [
  45, 34, 35, 44, 3, 4, 6, 43, 47, 48, 49, 50, 51, 42, 8, 10, 11, 12, 13, 33, 17, 7, 36, 37, 38, 39,
  28, 14, 40, 41, 32, 18, 46,
]

const MunicipalServicesSection = () => {
  const { t } = useTranslation('account')
  const { width } = useWindowSize()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectorValue, setSelectorValue] = useState<SelectOption>(enumOptions[0])
  const selectorValueTitle: string = selectorValue?.label ?? ''
  const ITEMS_PER_PAGE = width > 480 ? 20 : 5

  const { isLegalEntity } = useSsrAuth()

  const serviceCardIndexes = isLegalEntity ? poMunicipalServicesSection : foMunicipalServicesSection

  const filteredServiceCards = serviceCardIndexes
    .map((id) => serviceCards.find((card) => card.id === id))
    .filter(isDefined)
    .filter((card) =>
      selectorValueTitle === MunicipalServicesCategories.ALL_CATEGORY
        ? true
        : card.category.includes(selectorValueTitle),
    )

  return (
    <div className="flex flex-col">
      <MunicipalServicesSectionHeader
        enumOptions={enumOptions}
        setSelectorValue={setSelectorValue}
        selectorValue={selectorValue}
        setCurrentPage={setCurrentPage}
        title={t('account_section_services.navigation')}
      />
      <div className="mx-auto w-full max-w-(--breakpoint-lg) pt-4 lg:pt-8">
        <h2 className="sr-only">{t('account_section_services.services_list')}</h2>
        <div className="grid grid-cols-1 gap-3 px-4 min-[615px]:grid-cols-2 min-[960px]:grid-cols-3 sm:gap-6 md:gap-8 lg:grid-cols-4 lg:px-0">
          {filteredServiceCards
            .filter(
              (_, i) =>
                i + 1 <= currentPage * ITEMS_PER_PAGE && i + 1 > (currentPage - 1) * ITEMS_PER_PAGE,
            )
            .map((card, i) => (
              <ServiceCard
                key={i}
                title={t(card.title)}
                description={t(card.description)}
                buttonText={t(card.buttonText)}
                icon={card.icon}
                href={card.href}
                tag={card.tag ? t(card.tag) : undefined}
                tagStyle={card.tagStyle}
                plausibleProps={{ id: `Mestské služby: ${card.title}` }}
              />
            ))}
        </div>
        <div className="my-4 lg:my-8">
          <Pagination
            count={Math.ceil(filteredServiceCards.length / ITEMS_PER_PAGE)}
            selectedPage={currentPage}
            onChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}

export default MunicipalServicesSection
