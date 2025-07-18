import MyApplicationsCard from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsCard'
import {
  FormState,
  GetFormResponseDtoErrorEnum,
  GetFormResponseSimpleDto,
} from 'openapi-clients/forms'
import React from 'react'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const getDummyData = (
  state: FormState,
  error: GetFormResponseDtoErrorEnum,
): GetFormResponseSimpleDto => ({
  formDefinitionSlug: 'example-form-definition-slug',
  id: '1abe3c72-0c1a-4e26-9de9-2207be63d120',
  createdAt: '2023-09-13T08:48:15.346Z',
  updatedAt: '2023-09-13T08:48:22.121Z',
  state,
  error,
  formDataJson: { mestoPSCstep: { mestoPSC: { mesto: 'Košice' } } },
  formSubject: 'Podanie',
})

const formDefinitionSlugTitleMap = {
  'example-form-definition-slug': 'Example Form',
}

const MyApplicationsCardShowCase = () => {
  return (
    <Wrapper direction="column" title="Service Card">
      <Stack>
        <div className="flex flex-1 flex-col">
          Unfinished draft
          <MyApplicationsCard
            variant="DRAFT"
            form={getDummyData('DRAFT', 'NONE')}
            refreshListData={async (): Promise<[void, boolean]> => {
              return [undefined, false]
            }}
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          />
          Sending in progress
          <MyApplicationsCard
            variant="SENDING"
            form={getDummyData('QUEUED', 'NONE')}
            refreshListData={async (): Promise<[void, boolean]> => {
              return [undefined, false]
            }}
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          />
          Virus scan in progress
          <MyApplicationsCard
            variant="SENDING"
            form={getDummyData('QUEUED', 'NONE')}
            refreshListData={async (): Promise<[void, boolean]> => {
              return [undefined, false]
            }}
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          />
          Virus scan failed (unable to scan)
          <MyApplicationsCard
            variant="SENDING"
            form={getDummyData('ERROR', 'UNABLE_TO_SCAN_FILES')}
            refreshListData={async (): Promise<[void, boolean]> => {
              return [undefined, false]
            }}
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          />
          Virus scan failed (infected)
          <MyApplicationsCard
            variant="SENDING"
            form={getDummyData('ERROR', 'INFECTED_FILES')}
            refreshListData={async (): Promise<[void, boolean]> => {
              return [undefined, false]
            }}
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          />
          Virus scan failed (nases_send_error)
          <MyApplicationsCard
            variant="SENDING"
            form={getDummyData('ERROR', 'NASES_SEND_ERROR')}
            refreshListData={async (): Promise<[void, boolean]> => {
              return [undefined, false]
            }}
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          />
          Sent (progress - NASES)
          <MyApplicationsCard
            variant="SENT"
            form={getDummyData('DELIVERED_NASES', 'NONE')}
            refreshListData={async (): Promise<[void, boolean]> => {
              return [undefined, false]
            }}
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          />
          Sent (progress - GINIS)
          <MyApplicationsCard
            variant="SENT"
            form={getDummyData('DELIVERED_GINIS', 'NONE')}
            refreshListData={async (): Promise<[void, boolean]> => {
              return [undefined, false]
            }}
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          />
          PROCESSING
          <MyApplicationsCard
            variant="SENT"
            form={getDummyData('PROCESSING', 'NONE')}
            refreshListData={async (): Promise<[void, boolean]> => {
              return [undefined, false]
            }}
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          />
          Rejected
          <MyApplicationsCard
            variant="SENT"
            form={getDummyData('REJECTED', 'NONE')}
            refreshListData={async (): Promise<[void, boolean]> => {
              return [undefined, false]
            }}
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          />
          Finished
          <MyApplicationsCard
            variant="SENT"
            form={getDummyData('FINISHED', 'NONE')}
            refreshListData={async (): Promise<[void, boolean]> => {
              return [undefined, false]
            }}
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          />
        </div>
      </Stack>
    </Wrapper>
  )
}

export default MyApplicationsCardShowCase
