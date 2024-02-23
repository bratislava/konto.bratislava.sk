import { formsApi } from '@clients/forms'
import { GetFormResponseDtoStateEnum, GetFormsResponseDto } from '@clients/openapi-forms'
import MyApplicationCardsPlaceholder from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationCardsPlaceholder'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import { useRefreshServerSideProps } from 'frontend/hooks/useRefreshServerSideProps'
import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import { ApplicationsListVariant } from 'pages/moje-ziadosti'
import React from 'react'

import MyApplicationsCard from './MyApplicationsCard'

// must be string due to typing
const PAGE_SIZE = '10'

export const getDraftApplications = async (
  variant: ApplicationsListVariant,
  page: number,
  accessTokenSsrReq?: GetServerSidePropsContext['req'],
) => {
  const variantToStates: Array<GetFormResponseDtoStateEnum> = {
    SENT: [
      'REJECTED',
      'FINISHED',
      'PROCESSING',
      'READY_FOR_PROCESSING',
      'DELIVERED_NASES',
      'DELIVERED_GINIS',
    ] satisfies Array<GetFormResponseDtoStateEnum>,
    SENDING: ['QUEUED', 'ERROR', 'SENDING_TO_NASES'] satisfies Array<GetFormResponseDtoStateEnum>,
    DRAFT: ['DRAFT'] satisfies Array<GetFormResponseDtoStateEnum>,
  }[variant]
  const response = await formsApi.nasesControllerGetForms(
    page?.toString(),
    PAGE_SIZE,
    undefined,
    undefined,
    variantToStates,
    undefined,
    { accessToken: 'always', accessTokenSsrReq },
  )
  return response.data
}

type MyApplicationsListProps = {
  variant: ApplicationsListVariant
  applications?: GetFormsResponseDto
  refetchApplicationsCount: () => Promise<void>
}

const MyApplicationsList = ({
  variant,
  applications,
  refetchApplicationsCount,
}: MyApplicationsListProps) => {
  const router = useRouter()
  const currentPage = parseInt(router.query.strana as string, 10) || 1

  const { refreshData } = useRefreshServerSideProps(applications)

  const refreshListData = () => Promise.all([refetchApplicationsCount(), refreshData()])

  const totalPagesCount = applications?.countPages ?? 0

  return (
    <div className="m-auto w-full max-w-screen-lg">
      {applications?.items.length ? (
        <>
          <ul className="my-0 flex flex-col gap-0 px-4 sm:px-6 lg:my-8 lg:gap-4 lg:px-0">
            {applications.items.map((form) => {
              return (
                <li key={form.id}>
                  <MyApplicationsCard
                    form={form}
                    refreshListData={refreshListData}
                    variant={variant}
                  />
                </li>
              )
            })}
          </ul>
          <div className="my-4 lg:my-8">
            <Pagination
              count={totalPagesCount}
              selectedPage={currentPage}
              onChange={(page) =>
                router
                  .push(
                    {
                      pathname: router.pathname,
                      query: { ...router.query, strana: page },
                    },
                    undefined,
                    { shallow: true },
                  )
                  .catch((error) => logger.error(error))
              }
            />
          </div>
        </>
      ) : (
        <MyApplicationCardsPlaceholder />
      )}
    </div>
  )
}

export default MyApplicationsList
