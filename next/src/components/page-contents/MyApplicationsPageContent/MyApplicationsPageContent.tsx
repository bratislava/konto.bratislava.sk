import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next/pages'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components/Tabs'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import {
  getMyApplicationsCountQueryKey,
  myApplicationsCountFetcher,
} from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationsCountFetcher'
import {
  getMyApplicationsFilters,
  getMyApplicationsQueryKey,
  myApplicationsFetcher,
} from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationsFetcher'
import {
  MY_APPLICATION_STATE_FILTERS,
  MyApplicationStateFilter,
} from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationStates'
import MyApplicationsList from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsList'
import { useMyApplicationsFilters } from '@/src/components/page-contents/MyApplicationsPageContent/useMyApplicationsFilters'
import PageHeader from '@/src/components/segments/PageHeader/PageHeader'
import cn from '@/src/utils/cn'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=10974-95085
 */

const MyApplicationsPageContent = () => {
  const { t } = useTranslation()
  const { selectedSection, setSelectedSection, currentPage } = useMyApplicationsFilters()

  const filters = getMyApplicationsFilters({
    myApplicationState: selectedSection,
    page: currentPage,
  })

  const {
    data: applications,
    isPending,
    isError,
    refetch: refetchApplications,
  } = useQuery({
    queryKey: getMyApplicationsQueryKey(filters),
    queryFn: () => myApplicationsFetcher(filters),
    placeholderData: keepPreviousData,
  })

  const { data: totalCounts, refetch: refetchApplicationsCount } = useQuery({
    queryKey: getMyApplicationsCountQueryKey(),
    queryFn: () => myApplicationsCountFetcher(),
  })

  const refreshListData = async () => {
    await Promise.all([refetchApplicationsCount(), refetchApplications()])
  }

  const tabTitles: Record<MyApplicationStateFilter, string> = {
    ALL: t('MyApplicationsPageContent.tabs.all'),
    SENT: t('MyApplicationsPageContent.tabs.sent'),
    DRAFT: t('MyApplicationsPageContent.tabs.draft'),
  }

  return (
    <div className="flex flex-col">
      <PageHeader title={t('MyApplicationsPageContent.title')} />
      <SectionContainer className="py-4 lg:py-8">
        <Tabs
          selectedKey={selectedSection}
          onSelectionChange={(key) => {
            const section = MY_APPLICATION_STATE_FILTERS.find((filter) => filter === key)
            if (section) {
              setSelectedSection(section)
            }
          }}
          className="flex flex-col gap-7 lg:gap-8"
        >
          <TabList className="scrollbar-hide flex gap-2 overflow-x-auto lg:gap-4">
            {MY_APPLICATION_STATE_FILTERS.map((filter) => {
              const count = totalCounts?.[filter] ?? 0
              const text = `${tabTitles[filter]} (${count})`

              return (
                <Tab
                  key={filter}
                  id={filter}
                  data-before-text={text}
                  className={cn(
                    'cursor-pointer rounded-md border px-3 py-2',
                    'border-border-active-default bg-background-passive-base text-content-passive-secondary',
                    'hover:border-border-active-hover',
                    'selected:border-background-active-primary-default selected:bg-background-active-primary-default selected:text-content-passive-inverted-primary',
                  )}
                >
                  {text}
                </Tab>
              )
            })}
          </TabList>
          {MY_APPLICATION_STATE_FILTERS.map((variant) => (
            <TabPanel key={variant} id={variant}>
              <MyApplicationsList
                applications={applications}
                isPending={isPending}
                isError={isError}
                refreshListData={refreshListData}
              />
            </TabPanel>
          ))}
        </Tabs>
      </SectionContainer>
    </div>
  )
}

export default MyApplicationsPageContent
