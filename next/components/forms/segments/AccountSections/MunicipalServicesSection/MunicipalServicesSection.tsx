import Alert from 'components/forms/info-components/Alert'
import MunicipalServicesSectionHeader from 'components/forms/segments/AccountSectionHeader/MunicipalServicesSectionHeader'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import ServiceCard from 'components/forms/simple-components/ServiceCard'
import { MunicipalServicesCategories, serviceCards } from 'frontend/constants/constants'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { isDefined } from 'frontend/utils/general'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { useWindowSize } from 'usehooks-ts'

import { environment } from '../../../../../environment'
import { SelectOption } from '../../../widget-components/SelectField/SelectOption.interface'

const enumOptions: SelectOption[] = [
  { const: 'ALL_CATEGORY', title: MunicipalServicesCategories.ALL_CATEGORY, description: '' },
  { const: 'TAXES_CATEGORY', title: MunicipalServicesCategories.TAXES_CATEGORY, description: '' },
  {
    const: 'CULTURE_CATEGORY',
    title: MunicipalServicesCategories.CULTURE_CATEGORY,
    description: '',
  },
  {
    const: 'TRANSPORT_CATEGORY',
    title: MunicipalServicesCategories.TRANSPORT_CATEGORY,
    description: '',
  },
  {
    const: 'SECURITY_CATEGORY',
    title: MunicipalServicesCategories.SECURITY_CATEGORY,
    description: '',
  },
  // { const: 'ENVIROMENTS_CATEGORY', title: MunicipalServicesCategories.ENVIROMENTS_CATEGORY, description: '' },
  { const: 'BASKET_CATEGORY', title: MunicipalServicesCategories.BASKET_CATEGORY, description: '' },
  {
    const: 'PARKING_CATEGORY',
    title: MunicipalServicesCategories.PARKING_CATEGORY,
    description: '',
  },
  {
    const: 'MARINIUM_CATEGORY',
    title: MunicipalServicesCategories.MARIANUM_CATEGORY,
    description: '',
  },
  {
    const: 'ENTERTAINMENT_CATEGORY',
    title: MunicipalServicesCategories.ENTERTAINMENT_CATEGORY,
    description: '',
  },
  {
    const: 'CONSTRUCTION_CATEGORY',
    title: MunicipalServicesCategories.CONSTRUCTION_CATEGORY,
    description: '',
  },
  { const: 'JOIN_CATEGORY', title: MunicipalServicesCategories.JOIN_CATEGORY, description: '' },
  { const: 'GREEN_CATEGORY', title: MunicipalServicesCategories.GREEN_CATEGORY, description: '' },
]

const foMunicipalServicesSection = [
  34, 35, 1, 32, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 33, 16, 17,
]
const poMunicipalServicesSection = [
  34, 35, 32, 3, 4, 6, 42, 8, 10, 11, 12, 13, 33, 17, 18, 7, 36, 37, 38, 39, 28, 14, 40, 41,
]

const MunicipalServicesSection = () => {
  const { t } = useTranslation('account')
  const { width } = useWindowSize()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectorValue, setSelectorValue] = useState<SelectOption[]>(enumOptions.slice(0, 1))
  const selectorValueTitle: string = selectorValue[0]?.title || ''
  const ITEMS_PER_PAGE = width > 480 ? 20 : 5

  const { isLegalEntity } = useServerSideAuth()

  const serviceCardIndexes = isLegalEntity ? poMunicipalServicesSection : foMunicipalServicesSection

  const filteredServiceCards = serviceCardIndexes
    .map((id) => serviceCards.find((card) => card.id === id))
    .filter(isDefined)
    .filter(
      // when forms are reachable from top menu, keep all the cards, otherwise discard the first two
      (card) => (environment.featureToggles.formsInMenu ? true : card.id !== 34 && card.id !== 35),
    )
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
      <div className="mx-auto w-full max-w-screen-lg pt-4 lg:pt-8">
        <Alert
          message={t('account_section_services.alert_text')}
          type="info"
          fullWidth
          className="mx-4 mb-4 lg:mx-0 lg:mb-8"
        />
        <div className="grid grid-cols-1 gap-3 px-4 sm:gap-6 min-[615px]:grid-cols-2 md:gap-8 min-[960px]:grid-cols-3 lg:grid-cols-4 lg:px-0">
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
                buttonText={card.buttonText ? t(card.buttonText) : undefined}
                icon={card.icon}
                href={card.href}
                tag={card.tag ? t(card.tag) : undefined}
                tagStyle={card.tagStyle}
                onPress={card.onPress}
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
