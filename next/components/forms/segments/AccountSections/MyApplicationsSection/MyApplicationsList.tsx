import { formsClient } from '@clients/forms'
import { AuthSession } from 'aws-amplify/auth'
import MyApplicationCardsPlaceholder from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationCardsPlaceholder'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import { useRefreshServerSideProps } from 'frontend/hooks/useRefreshServerSideProps'
import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { GetFormResponseDtoStateEnum, GetFormsResponseDto } from 'openapi-clients/forms'
import { ApplicationsListVariant } from 'pages/moje-ziadosti'
import React from 'react'

import MyApplicationsCard from './MyApplicationsCard'
import { patchApplicationFormIfNeeded } from './patchApplicationFormIfNeededClient'

// must be string due to typing
const PAGE_SIZE = '10'

export const getDraftApplications = async (
  variant: ApplicationsListVariant,
  page: number,
  emailFormSlugs: string[],
  getSsrAuthSession?: () => Promise<AuthSession>,
): Promise<GetFormsResponseDto> => {
  // TODO - required functionality per product docs - SENDING tab will display only the ERRORs that the user can edit + queued
  const variantToStates: Array<GetFormResponseDtoStateEnum> = {
    SENT: [
      'REJECTED',
      'FINISHED',
      'PROCESSING',
      'DELIVERED_NASES',
      'DELIVERED_GINIS',
    ] satisfies Array<GetFormResponseDtoStateEnum>,
    SENDING: ['QUEUED', 'ERROR'] satisfies Array<GetFormResponseDtoStateEnum>,
    DRAFT: ['DRAFT'] satisfies Array<GetFormResponseDtoStateEnum>,
  }[variant]
  const response = await formsClient.nasesControllerGetForms(
    page?.toString(),
    PAGE_SIZE,
    variantToStates,
    // TODO update when backend behaviour changes
    // if this is set varianToStates would be ignored, that does not match the required functionality in any of the tabs
    undefined,
    undefined,
    { authStrategy: 'authOnly', getSsrAuthSession },
  )
  return {
    ...response.data,
    items: response.data.items.map((item) => patchApplicationFormIfNeeded(item, emailFormSlugs)),
  }
}

type MyApplicationsListProps = {
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
}: MyApplicationsListProps) => {
  const router = useRouter()
  const currentPage = parseInt(router.query.strana as string, 10) || 1

  const { refreshData } = useRefreshServerSideProps(applications)

  const refreshListData = () => Promise.all([refetchApplicationsCount(), refreshData()])

  const totalPagesCount = applications?.countPages ?? 0

  return (
    <div className="m-auto w-full max-w-(--breakpoint-lg)">
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
                    formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
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
