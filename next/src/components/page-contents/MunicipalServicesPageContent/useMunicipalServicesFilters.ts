import { parseAsString, useQueryState } from 'nuqs'
import { useState } from 'react'

export const ALL_CATEGORIES_VALUE = 'vsetky-kategorie'

export const useMunicipalServicesFilters = () => {
  const [categorySlug, setCategorySlugQueryParam] = useQueryState(
    'kategoria',
    parseAsString.withDefault(ALL_CATEGORIES_VALUE).withOptions({ history: 'replace' }),
  )
  const [currentPage, setCurrentPage] = useState<number>(1)

  const setCategorySlug = (newCategorySlug: string) => {
    if (newCategorySlug === categorySlug) {
      return
    }

    setCurrentPage(1)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setCategorySlugQueryParam(newCategorySlug)
  }

  return { categorySlug, setCategorySlug, currentPage, setCurrentPage } as const
}
