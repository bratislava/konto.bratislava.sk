import { GetFormResponseDtoStateEnum } from 'openapi-clients/forms'
import { useMemo, useState } from 'react'

import MyApplicationDetails from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationDetails'

import {
  createMockMyApplicationFormData,
  createMockMyApplicationGinisData,
  detailStateOptions,
  MOCK_FORM_DEFINITION_TITLE,
} from './mockData'
import { ShowcaseLayout, ShowcaseSelectField } from './shared'

const MyApplicationDetailsShowCase = () => {
  const [state, setState] = useState<GetFormResponseDtoStateEnum>(
    GetFormResponseDtoStateEnum.DeliveredNases,
  )

  const myApplicationFormData = useMemo(() => createMockMyApplicationFormData(state), [state])
  const myApplicationGinisData = useMemo(() => createMockMyApplicationGinisData(), [])

  return (
    <ShowcaseLayout
      controls={
        <ShowcaseSelectField
          label="Form state"
          options={detailStateOptions}
          value={state}
          onChange={setState}
        />
      }
    >
      <div className="bg-background-passive-base">
        <MyApplicationDetails
          formDefinitionTitle={MOCK_FORM_DEFINITION_TITLE}
          myApplicationFormData={myApplicationFormData}
          myApplicationGinisData={myApplicationGinisData}
        />
      </div>
    </ShowcaseLayout>
  )
}

export default MyApplicationDetailsShowCase
