import {
  FormState,
  GetFormResponseDtoErrorEnum,
  GetFormResponseSimpleDto,
} from 'openapi-clients/forms'

import RowGroupWrapper from '@/src/components/common/RowGroupWrapper'
import MyApplicationsCard from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsCard/MyApplicationsCard'
import { FormDefinitionSlugTitleMapProvider } from '@/src/components/page-contents/MyApplicationsPageContent/useFormDefinitionSlugTitleMap'

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

const showCaseCards: { state: FormState; error: GetFormResponseDtoErrorEnum }[] = [
  { state: 'DRAFT', error: 'NONE' },
  { state: 'QUEUED', error: 'NONE' },
]

const MyApplicationsCardShowCase = () => {
  return (
    <FormDefinitionSlugTitleMapProvider formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}>
      <Wrapper direction="column" title="My Applications Card">
        <Stack>
          <div className="flex flex-1 flex-col gap-2">
            <RowGroupWrapper
              asList
              className="flex flex-col gap-2 lg:gap-4"
              items={showCaseCards.map(({ state, error }, index) => (
                <MyApplicationsCard
                  key={index}
                  form={getDummyData(state, error)}
                  refreshListData={async (): Promise<void> => {}}
                />
              ))}
            />
          </div>
        </Stack>
      </Wrapper>
    </FormDefinitionSlugTitleMapProvider>
  )
}

export default MyApplicationsCardShowCase
