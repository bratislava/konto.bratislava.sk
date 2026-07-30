import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import slugify from 'slugify'

import {
  MunicipalServiceCategoryEntityFragment,
  MunicipalServiceEntityFragment,
} from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import {
  ALL_CATEGORIES_VALUE,
  useMunicipalServicesFilters,
} from '@/src/components/page-contents/MunicipalServicesPageContent/useMunicipalServicesFilters'
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

const SERVICES_PER_PAGE = 12

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

  const { categorySlug, setCategorySlug, currentPage, setCurrentPage } =
    useMunicipalServicesFilters()
  const { isLegalEntity } = useSsrAuth()

  const servicesByPersonType = isLegalEntity ? servicesLegalPerson : services
  const categoriesByPersonType = isLegalEntity ? categoriesLegalPerson : categories

  const categorySelectOptions: SelectOption[] = [
    { value: ALL_CATEGORIES_VALUE, label: t('account_section_services.all_categories') },
    ...categoriesByPersonType.map((category) => ({
      // TODO: remove fallback value once slug is set to required in strapi
      value: category.slug ?? slugify(category.title),
      label: category.title,
    })),
  ]

  // Falls back to "all categories" if the query param holds a category that is not available for the current person type
  const selectorValue =
    categorySelectOptions.find((option) => option.value === categorySlug) ??
    categorySelectOptions[0]

  const filteredServices = servicesByPersonType.filter(isDefined).filter((service) => {
    if (selectorValue.value === ALL_CATEGORIES_VALUE) {
      return true
    }

    return service.categories.some(
      (category) =>
        isDefined(category) &&
        // TODO: remove fallback value once slug is set to required in strapi
        (category.slug ?? slugify(category.title)) === selectorValue.value,
    )
  })

  return (
    <>
      <MunicipalServicesPageHeader
        enumOptions={categorySelectOptions}
        setSelectorValue={(newSelectorValue) => setCategorySlug(newSelectorValue.value)}
        selectorValue={selectorValue}
        title={t('account_section_services.navigation')}
      />
      <SectionContainer className="w-full pt-4 lg:pt-8">
        <Typography variant="h2" className="sr-only">
          {t('account_section_services.services_list')}
        </Typography>
        <div className="grid grid-cols-1 gap-3 min-[615px]:grid-cols-2 min-[960px]:grid-cols-3 lg:grid-cols-4 lg:gap-8">
          {filteredServices
            .slice((currentPage - 1) * SERVICES_PER_PAGE, currentPage * SERVICES_PER_PAGE)
            .map((service) => (
              <MunicipalServiceCard key={service.documentId} service={service} />
            ))}
        </div>
        <div className="my-4 lg:my-8">
          <Pagination
            totalCount={Math.ceil(filteredServices.length / SERVICES_PER_PAGE)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </SectionContainer>
    </>
  )
}

export default MunicipalServicesPageContent
