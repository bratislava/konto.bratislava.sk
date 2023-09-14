import { FormState, GetFormResponseDtoErrorEnum } from '@clients/openapi-forms/api'
import MyApplicationsDraftCard from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsDraftCard'
import React from 'react'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const getDummyData = (
  state: FormState,
  error: GetFormResponseDtoErrorEnum,
  overrides?: object,
) => ({
  id: '1abe3c72-0c1a-4e26-9de9-2207be63d120',
  createdAt: '2023-09-13T08:48:15.346Z',
  updatedAt: '2023-09-13T08:48:22.121Z',
  externalId: null,
  userExternalId: '9f2d3023-8c8c-4bad-974a-f8d7262c6836',
  email: 'email@email.com',
  uri: 'rc://sk/111111/1111_email@email.com_firstname',
  state,
  error,
  formDataJson: { mestoPSCstep: { mestoPSC: { mesto: 'Košice' } } },
  formDataGinis: null,
  ginisDocumentId: null,
  senderId: null,
  recipientId: null,
  finishSubmission: null,
  schemaVersionId: 'c25d2151-bf8b-4438-8b29-9bc840ef7e69',
  archived: false,
  schemaVersion: {
    id: 'c25d2151-bf8b-4438-8b29-9bc840ef7e69',
    version: 'v0.0.3',
    pospID: 'test',
    pospVersion: '0.1',
    formDescription: 'Example schema',
    data: {
      email: 'velit anim Duis esse',
      phone: 'ipsum',
      ziadatel: {
        city: 'reprehenderit id consectetur',
        address: 'sint irure velit quis',
        lastName: 'Excepteur',
        birthDate: 'anim Excepteur est',
        firstName: 'occaecat',
        postalCode: 'incididunt veniam nostrud id',
        newTaxpayer: true,
      },
    },
    dataXml: '',
    formFo: '',
    formHtmlSef: {},
    formSb: '',
    formHtml: '',
    formSbSef: {},
    jsonSchema: {},
    schemaXsd: '',
    uiSchema: {},
    xmlTemplate: '',
    schemaId: '24e435cd-75b7-4e88-9371-1db65b86607b',
    isSigned: false,
    createdAt: '2023-09-13T07:40:08.318Z',
    updatedAt: '2023-09-13T07:40:08.318Z',
    schema: {
      id: '24e435cd-75b7-4e88-9371-1db65b86607b',
      formName: 'test',
      slug: 'test',
      category: null,
      messageSubject: 'Podanie',
      createdAt: '2023-09-13T07:40:06.920Z',
      updatedAt: '2023-09-13T07:40:11.319Z',
      latestVersionId: 'c25d2151-bf8b-4438-8b29-9bc840ef7e69',
    },
  },
  isLatestSchemaVersionForSlug: true,
  ...overrides,
})

const MyApplicationsCardShowCase = () => {
  return (
    <Wrapper direction="column" title="Service Card">
      <Stack>
        <div className="flex flex-1 flex-col">
          Unfinished draft
          <MyApplicationsDraftCard
            variant="DRAFT"
            form={getDummyData('DRAFT', 'NONE')}
            refreshListData={async () => {}}
          />
          Expired draft
          <MyApplicationsDraftCard
            variant="DRAFT"
            form={getDummyData('DRAFT', 'NONE', { isLatestSchemaVersionForSlug: false })}
            refreshListData={async () => {}}
          />
          Sending in progress
          <MyApplicationsDraftCard
            variant="SENDING"
            form={getDummyData('QUEUED', 'NONE')}
            refreshListData={async () => {}}
          />
          Virus scan in progress
          <MyApplicationsDraftCard
            variant="SENDING"
            form={getDummyData('QUEUED', 'NONE')}
            refreshListData={async () => {}}
          />
          Virus scan failed (unable to scan)
          <MyApplicationsDraftCard
            variant="SENDING"
            form={getDummyData('ERROR', 'UNABLE_TO_SCAN_FILES')}
            refreshListData={async () => {}}
          />
          Virus scan failed (infected)
          <MyApplicationsDraftCard
            variant="SENDING"
            form={getDummyData('ERROR', 'INFECTED_FILES')}
            refreshListData={async () => {}}
          />
          Virus scan failed (nases_send_error)
          <MyApplicationsDraftCard
            variant="SENDING"
            form={getDummyData('ERROR', 'NASES_SEND_ERROR')}
            refreshListData={async () => {}}
          />
          Sent (progress - NASES)
          <MyApplicationsDraftCard
            variant="SENT"
            form={getDummyData('DELIVERED_NASES', 'NONE')}
            refreshListData={async () => {}}
          />
          Sent (progress - GINIS)
          <MyApplicationsDraftCard
            variant="SENT"
            form={getDummyData('DELIVERED_GINIS', 'NONE')}
            refreshListData={async () => {}}
          />
          READY_FOR_PROCESSING
          <MyApplicationsDraftCard
            variant="SENT"
            form={getDummyData('READY_FOR_PROCESSING', 'NONE')}
            refreshListData={async () => {}}
          />
          PROCESSING
          <MyApplicationsDraftCard
            variant="SENT"
            form={getDummyData('PROCESSING', 'NONE')}
            refreshListData={async () => {}}
          />
          Rejected
          <MyApplicationsDraftCard
            variant="SENT"
            form={getDummyData('REJECTED', 'NONE')}
            refreshListData={async () => {}}
          />
          Finished
          <MyApplicationsDraftCard
            variant="SENT"
            form={getDummyData('FINISHED', 'NONE')}
            refreshListData={async () => {}}
          />
        </div>
      </Stack>
    </Wrapper>
  )
}

export default MyApplicationsCardShowCase
