import {
  FormState,
  GetFormResponseDto,
  GetFormResponseDtoErrorEnum,
} from '@clients/openapi-forms/api'
import MyApplicationsCard from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsCard'
import React from 'react'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const getDummyData = (state: FormState, error: GetFormResponseDtoErrorEnum, overrides?: object) =>
  ({
    formDefinitionSlug: 'example-form-definition-slug',
    id: '1abe3c72-0c1a-4e26-9de9-2207be63d120',
    createdAt: '2023-09-13T08:48:15.346Z',
    updatedAt: '2023-09-13T08:48:22.121Z',
    mainUri: 'rc://sk/111111/1111',
    actorUri: 'rc://sk/111111/1111',
    externalId: null,
    userExternalId: '9f2d3023-8c8c-4bad-974a-f8d7262c6836',
    email: 'email@email.com',
    uri: 'rc://sk/111111/1111_email@email.com_firstname',
    state,
    error,
    formDataJson: { mestoPSCstep: { mestoPSC: { mesto: 'Košice' } } },
    formDataGinis: null,
    formDataBase64: null,
    ginisDocumentId: null,
    senderId: null,
    recipientId: null,
    finishSubmission: null,
    archived: false,
    frontendTitle: 'Nazov stavby',
    messageSubject: 'Podanie',
    jsonVersion: '1.0.0',
    ...overrides,
  }) as GetFormResponseDto

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
          Expired draft
          <MyApplicationsCard
            variant="DRAFT"
            form={getDummyData('DRAFT', 'NONE', { isLatestSchemaVersionForSlug: false })}
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
          Sent (progress - SENDING_TO_NASES)
          <MyApplicationsCard
            variant="SENT"
            form={getDummyData('SENDING_TO_NASES', 'NONE')}
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
