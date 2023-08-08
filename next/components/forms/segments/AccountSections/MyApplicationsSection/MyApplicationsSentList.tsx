import { formsApi } from '@clients/forms'
import { FormState, GetFormResponseDto, SchemaVersionResponseDto } from '@clients/openapi-forms'
import { useQuery } from '@tanstack/react-query'
import MyApplicationCardsPlaceholder from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationCardsPlaceholder'
import MyApplicationsSentCard, {
  MyApplicationsSentCardProps,
} from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSentCard'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import React, { useState } from 'react'

import { ROUTES } from '../../../../../frontend/api/constants'
import { getAccessTokenOrLogout } from '../../../../../frontend/utils/amplify'

// TODO filter out DRAFT forms
const getSentApplications = async () => {
  const accessToken = await getAccessTokenOrLogout()

  const statesToFetch = Object.values(FormState).filter((state) => state !== 'DRAFT')

  const response = await formsApi.nasesControllerGetForms(
    '1',
    '10',
    undefined,
    undefined,
    statesToFetch,
    undefined,
    { accessToken },
  )
  return response.data
}

const transformFormToCardProps = (form: GetFormResponseDto): MyApplicationsSentCardProps => {
  // TODO: Fix when BE types are fixed
  const formSlug =
    (form as unknown as { schemaVersion: SchemaVersionResponseDto }).schemaVersion.schema?.slug ??
    ''

  return {
    // TODO: Title
    title: formSlug ?? '',
    linkHref: `${ROUTES.MY_APPLICATIONS}/${formSlug}/${form.id}`,
    category: 'Kategória TODO',
    subtext: 'Subtext TODO',
    filedAt: form.createdAt,
    status: form.state,
    statusAt: form.updatedAt,
  }
}

const MyApplicationsSentList = () => {
  const [page, setPage] = useState<number>(1)

  const { data } = useQuery({
    queryKey: ['myApplicationsSentList', page],
    queryFn: () => getSentApplications(),
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
                  <MyApplicationsSentCard {...transformFormToCardProps(card)} />
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

export default MyApplicationsSentList
