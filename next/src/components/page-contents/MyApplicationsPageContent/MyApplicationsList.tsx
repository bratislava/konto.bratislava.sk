import { useRouter } from 'next/router'
import { GetFormsResponseDto } from 'openapi-clients/forms'

import MyApplicationsBanner from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsBanner'
import MyApplicationsCard from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsCard'
import Pagination from '@/src/components/simple-components/Pagination/Pagination'
import { useRefreshServerSideProps } from '@/src/frontend/hooks/useRefreshServerSideProps'
import logger from '@/src/frontend/utils/logger'
import { ApplicationsListVariant } from '@/src/pages/moje-ziadosti'

type Props = {
  variant: ApplicationsListVariant
  applications?: GetFormsResponseDto
  refetchApplicationsCount: () => Promise<void>
  formDefinitionSlugTitleMap: Record<string, string>
}

const MyApplicationsList = ({
  variant,
  applications,
  refetchApplicationsCount,
  formDefinitionSlugTitleMap,
}: Props) => {
  const router = useRouter()

  const currentPage = parseInt(router.query.strana as string, 10) || 1

  const { refreshData } = useRefreshServerSideProps(applications)

  const refreshListData = () => Promise.all([refetchApplicationsCount(), refreshData()])

  const totalPagesCount = applications?.countPages ?? 0

  return applications?.items.length ? (
    <>
      <ul className="flex flex-col gap-2 lg:gap-4">
        {applications.items.map((form) => {
          return (
            <li key={form.id}>
              <MyApplicationsCard
                form={form}
                refreshListData={refreshListData}
                variant={variant}
                formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
              />
            </li>
          )
        })}
      </ul>
      <div className="py-4 lg:py-8">
        <Pagination
          totalCount={totalPagesCount}
          currentPage={currentPage}
          onPageChange={(page) =>
            router
              .push(
                {
                  pathname: router.pathname,
                  query: { ...router.query, strana: page },
                },
                undefined,
              )
              .catch((error) => logger.error(error))
          }
        />
      </div>
    </>
  ) : (
    <MyApplicationsBanner variant="no-applications" />
  )
}

export default MyApplicationsList
