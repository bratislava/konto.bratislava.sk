import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { GetFormsResponseDto } from 'openapi-clients/forms'

import RowGroupWrapper from '@/src/components/common/RowGroupWrapper'
import MyApplicationsBanner from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsBanner'
import MyApplicationsCard from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsCard'
import { getMyApplicationStateByFormResponseState } from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationStates'
import { useMyApplicationsFilters } from '@/src/components/page-contents/MyApplicationsPageContent/useMyApplicationsFilters'
import Pagination from '@/src/components/simple-components/Pagination/Pagination'
import Spinner from '@/src/components/simple-components/Spinner'
import logger from '@/src/frontend/utils/logger'

type Props = {
  applications?: GetFormsResponseDto
  isPending: boolean
  isError: boolean
  refreshListData: () => Promise<void>
}

const MyApplicationsList = ({ applications, isPending, isError, refreshListData }: Props) => {
  const { t } = useTranslation()
  const { currentPage, setCurrentPage } = useMyApplicationsFilters()

  if (isPending) {
    return (
      <div className="flex justify-center py-8 lg:py-12">
        <Spinner size="lg" />
        <span className="sr-only">{t('MyApplicationsList.loading')}</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center lg:py-12">
        <Typography variant="p-default">{t('MyApplicationsList.error')}</Typography>
        <Button
          variant="outline"
          onPress={() => {
            refreshListData().catch((error) => logger.error(error))
          }}
        >
          {t('MyApplicationsList.retry')}
        </Button>
      </div>
    )
  }

  return applications?.items.length ? (
    <>
      <RowGroupWrapper
        asList
        className="flex flex-col gap-2 lg:gap-4"
        items={applications.items.map((form) => {
          return (
            <MyApplicationsCard
              form={form}
              refreshListData={refreshListData}
              variant={getMyApplicationStateByFormResponseState(form.state)}
              key={form.id}
            />
          )
        })}
      />
      <div className="py-4 lg:py-8">
        <Pagination
          totalCount={applications?.countPages ?? 0}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </>
  ) : (
    <MyApplicationsBanner variant="no-applications" />
  )
}

export default MyApplicationsList
