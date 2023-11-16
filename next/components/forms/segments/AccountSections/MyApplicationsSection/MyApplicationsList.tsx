import { formsApi } from '@clients/forms'
import { GetFormResponseDto, GetFormResponseDtoStateEnum } from '@clients/openapi-forms'
import { useQuery } from '@tanstack/react-query'
import MyApplicationCardsPlaceholder from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationCardsPlaceholder'
import { ApplicationsListVariant } from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSection'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import useSnackbar from 'frontend/hooks/useSnackbar'
import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'

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
}

const MyApplicationsList = ({ variant }: MyApplicationsListProps) => {
  const { t } = useTranslation('account')
  const [openSnackbarError] = useSnackbar({ variant: 'error' })

  const router = useRouter()
  const currentPage = parseInt(router.query.strana as string, 10) || 1

  const {
    data,
    isError,
    isLoading: isQueryFirstLoad,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [`myApplications_${variant}`, currentPage],
    queryFn: () => getDraftApplications(variant, currentPage),
  })

  const totalPagesCount = data?.countPages ?? 0
  // error is shown through snackbar - since we don't have error state we keep the list stuck on loading
  // we trigger refetch on concept delete - this way it trigger loading state for the user
  // better to have instant feedback than to be confused whether the request went through
  const isLoading = isQueryFirstLoad || isRefetching || (isError && !data?.items?.length)

  const forms: Array<GetFormResponseDto | null> = isLoading
    ? (Array.from({ length: 10 }).fill(null) as Array<null>)
    : data?.items ?? ([] as Array<GetFormResponseDto>)

  useEffect(() => {
    if (isError) openSnackbarError(t('account_section_applications.error'))
    // TODO openSnackbarError is a new reference on every render - fix dependencies once this hooks is fixed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError])

  return (
    <div className="m-auto w-full max-w-screen-lg">
      {forms.length > 0 ? (
        <>
          <ul className="my-0 flex flex-col gap-0 px-4 sm:px-6 lg:my-8 lg:gap-4 lg:px-0">
            {forms.map((form, index) => {
              return (
                <li key={index}>
                  <MyApplicationsCard form={form} refreshListData={refetch} variant={variant} />
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
