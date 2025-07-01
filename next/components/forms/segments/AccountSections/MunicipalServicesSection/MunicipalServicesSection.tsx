import {
  MunicipalServiceCategoryEntityFragment,
  MunicipalServiceEntityFragment,
} from '@clients/graphql-strapi/api'
import MunicipalServicesSectionHeader from 'components/forms/segments/AccountSectionHeader/MunicipalServicesSectionHeader'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import { isDefined } from 'frontend/utils/general'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { useWindowSize } from 'usehooks-ts'

import { useSsrAuth } from '../../../../../frontend/hooks/useSsrAuth'
import { SelectOption } from '../../../widget-components/SelectField/SelectField'
import MunicipalServiceCard from '../../MunicipalServiceCard/MunicipalServiceCard'

export type MunicipalServicesSectionProps = {
  services: MunicipalServiceEntityFragment[]
  categories: MunicipalServiceCategoryEntityFragment[]
  servicesLegalPerson: MunicipalServiceEntityFragment[]
  categoriesLegalPerson: MunicipalServiceCategoryEntityFragment[]
}

const MunicipalServicesSection = ({
  services,
  categories,
  servicesLegalPerson,
  categoriesLegalPerson,
}: MunicipalServicesSectionProps) => {
  const { t } = useTranslation('account')
  const { width } = useWindowSize()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const { isLegalEntity } = useSsrAuth()
  const servicesByPersonType = isLegalEntity ? servicesLegalPerson : services
  const categoriesByPersonType = isLegalEntity ? categoriesLegalPerson : categories

  const enumOptions: SelectOption[] = [
    { value: 'ALL_CATEGORIES', label: t('account_section_services.all_categories') },
    ...categoriesByPersonType.map((category) => {
      if (!category.id || !category.attributes) {
        return null
      }

      return {
        value: category.id,
        label: category.attributes.title,
      }
    }),
  ].filter(isDefined)

  const [selectorValue, setSelectorValue] = useState<SelectOption>(enumOptions[0])
  const ITEMS_PER_PAGE = width > 480 ? 20 : 5

  const handleCategoryChange = (newSelectorValue: SelectOption) => {
    if (newSelectorValue.value !== selectorValue.value) {
      setCurrentPage(1)
    }
    setSelectorValue(newSelectorValue)
  }

  const filteredServices = servicesByPersonType.filter(isDefined).filter((service) => {
    if (!service.attributes) {
      return false
    }

    if (selectorValue.value === 'ALL_CATEGORIES') {
      return true
    }

    return service.attributes.categories?.data?.some(
      (category) => category.id === selectorValue.value,
    )
  })

  return (
    <div className="flex flex-col">
      <MunicipalServicesSectionHeader
        enumOptions={enumOptions}
        setSelectorValue={handleCategoryChange}
        selectorValue={selectorValue}
        setCurrentPage={setCurrentPage}
        title={t('account_section_services.navigation')}
      />
      <div className="mx-auto w-full max-w-(--breakpoint-lg) pt-4 lg:pt-8">
        <h2 className="sr-only">{t('account_section_services.services_list')}</h2>
        <div className="grid grid-cols-1 gap-3 px-4 min-[615px]:grid-cols-2 min-[960px]:grid-cols-3 sm:gap-6 md:gap-8 lg:grid-cols-4 lg:px-0">
          {filteredServices
            .filter(
              (_, i) =>
                i + 1 <= currentPage * ITEMS_PER_PAGE && i + 1 > (currentPage - 1) * ITEMS_PER_PAGE,
            )
            .map((service) => (
              <MunicipalServiceCard key={service.id} service={service} />
            ))}
        </div>
        <div className="my-4 lg:my-8">
          <Pagination
            count={Math.ceil(filteredServices.length / ITEMS_PER_PAGE)}
            selectedPage={currentPage}
            onChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}

export default MunicipalServicesSection
