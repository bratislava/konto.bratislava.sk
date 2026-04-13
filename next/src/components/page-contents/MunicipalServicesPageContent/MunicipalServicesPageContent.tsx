import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'
import { useWindowSize } from 'usehooks-ts'

import {
  MunicipalServiceCategoryEntityFragment,
  MunicipalServiceEntityFragment,
} from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import MunicipalServiceCard from '@/src/components/segments/MunicipalServiceCard/MunicipalServiceCard'
import MunicipalServicesPageHeader from '@/src/components/segments/PageHeader/MunicipalServicesPageHeader'
import Pagination from '@/src/components/simple-components/Pagination/Pagination'
import { SelectOption } from '@/src/components/widget-components/SelectField/SelectField'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { isDefined } from '@/src/frontend/utils/general'

export type MunicipalServicesPageContentProps = {
  services: MunicipalServiceEntityFragment[]
  categories: MunicipalServiceCategoryEntityFragment[]
  servicesLegalPerson: MunicipalServiceEntityFragment[]
  categoriesLegalPerson: MunicipalServiceCategoryEntityFragment[]
}

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=10974-94617
 */

const MunicipalServicesPageContent = ({
  services,
  categories,
  servicesLegalPerson,
  categoriesLegalPerson,
}: MunicipalServicesPageContentProps) => {
  const { t } = useTranslation('account')
  const { width } = useWindowSize()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const { isLegalEntity } = useSsrAuth()
  const servicesByPersonType = isLegalEntity ? servicesLegalPerson : services
  const categoriesByPersonType = isLegalEntity ? categoriesLegalPerson : categories

  const enumOptions: SelectOption[] = [
    { value: 'ALL_CATEGORIES', label: t('account_section_services.all_categories') },
    ...categoriesByPersonType.map((category) => {
      if (!category.documentId) {
        return null
      }

      return {
        value: category.documentId,
        label: category.title,
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
    if (selectorValue.value === 'ALL_CATEGORIES') {
      return true
    }

    return service.categories.some((category) => category?.documentId === selectorValue.value)
  })

  return (
    <div className="flex flex-col">
      <MunicipalServicesPageHeader
        enumOptions={enumOptions}
        setSelectorValue={handleCategoryChange}
        selectorValue={selectorValue}
        setCurrentPage={setCurrentPage}
        title={t('account_section_services.navigation')}
      />
      <SectionContainer className="w-full pt-4 lg:pt-8">
        <h2 className="sr-only">{t('account_section_services.services_list')}</h2>
        <div className="grid grid-cols-1 gap-3 min-[615px]:grid-cols-2 sm:gap-6 md:gap-8 min-[960px]:grid-cols-3 lg:grid-cols-4">
          {filteredServices
            .filter(
              (_, i) =>
                i + 1 <= currentPage * ITEMS_PER_PAGE && i + 1 > (currentPage - 1) * ITEMS_PER_PAGE,
            )
            .map((service) => (
              <MunicipalServiceCard key={service.documentId} service={service} />
            ))}
        </div>
        <div className="my-4 lg:my-8">
          <Pagination
            totalCount={Math.ceil(filteredServices.length / ITEMS_PER_PAGE)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </SectionContainer>
    </div>
  )
}

export default MunicipalServicesPageContent
