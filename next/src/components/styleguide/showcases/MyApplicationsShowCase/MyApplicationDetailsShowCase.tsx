import { GetFormResponseDtoStateEnum } from 'openapi-clients/forms'
import { useMemo, useState } from 'react'

import MyApplicationDetails from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationDetails'

import {
  createMockGinisData,
  createMockMyApplicationDetailsData,
  detailStateOptions,
  MOCK_FORM_DEFINITION_TITLE,
} from './mockData'
import { ShowcaseLayout, ShowcaseSelectField } from './shared'

const MyApplicationDetailsShowCase = () => {
  const [state, setState] = useState<GetFormResponseDtoStateEnum>(
    GetFormResponseDtoStateEnum.DeliveredNases,
  )

  const myApplicationDetailsData = useMemo(() => createMockMyApplicationDetailsData(state), [state])
  const ginisData = useMemo(() => createMockGinisData(), [])

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
          myApplicationDetailsData={myApplicationDetailsData}
          ginisData={ginisData}
        />
      </div>
    </ShowcaseLayout>
  )
}

export default MyApplicationDetailsShowCase
