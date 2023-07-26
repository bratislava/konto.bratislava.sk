import { formsApi } from '@clients/forms'
import { GetFormResponseDto } from '@clients/openapi-forms'
import { useQuery } from '@tanstack/react-query'
import MyApplicationCardsPlaceholder from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationCardsPlaceholder'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import React, { useState } from 'react'

import { ROUTES } from '../../../../../frontend/api/constants'
import { getAccessTokenOrLogout } from '../../../../../frontend/utils/amplify'
import MyApplicationsDraftCard, { MyApplicationsDraftCardProps } from './MyApplicationsDraftCard'

const getDraftApplications = async () => {
  const accessToken = await getAccessTokenOrLogout()
  const response = await formsApi.nasesControllerGetForms(
    '1',
    '10',
    undefined,
    undefined,
    'DRAFT',
    { accessToken },
  )
  return response.data
}

const transformFormToCardProps = (form: GetFormResponseDto): MyApplicationsDraftCardProps => {
  return {
    title: form.formName ?? '',
    linkHref: `${ROUTES.MY_APPLICATIONS}/${form.id}`,
    category: 'Kategória TODO',
    subtext: 'Subtext TODO',
    createdAt: form.createdAt,
  }
}

const MyApplicationsDraftList = () => {
  const [page, setPage] = useState<number>(1)

  const { data } = useQuery({
    queryKey: ['myApplicationsSentList', page],
    queryFn: () => getDraftApplications(),
    keepPreviousData: true,
  })

  const totalPagesCount = data?.countPages ?? 0

  const cards = data?.items ?? []

  return (
    <div className="m-auto w-full max-w-screen-lg">
      {cards.length > 0 ? (
        <>
          <ul className="my-0 flex flex-col gap-0 px-4 sm:px-6 lg:my-8 lg:gap-4 lg:px-0">
            {cards.map((card, index) => {
              return (
                <li key={index}>
                  <MyApplicationsDraftCard {...transformFormToCardProps(card)} />
                </li>
              )
            })}
          </ul>
          <div className="my-4 lg:my-8">
            <Pagination count={totalPagesCount} selectedPage={page} onChange={setPage} />
          </div>
        </>
      ) : (
        <MyApplicationCardsPlaceholder />
      )}
    </div>
  )
}

export default MyApplicationsDraftList
