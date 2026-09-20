import { QueryClientProvider } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import MyApplicationsPageContent from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsPageContent'
import { FormDefinitionSlugTitleMapProvider } from '@/src/components/page-contents/MyApplicationsPageContent/useFormDefinitionSlugTitleMap'
import { useMyApplicationsFilters } from '@/src/components/page-contents/MyApplicationsPageContent/useMyApplicationsFilters'

import {
  createMockApplications,
  createMockQueryClient,
  formDefinitionSlugTitleMap,
  ListScenario,
  listScenarioOptions,
  sectionOptions,
} from './mockData'
import { ShowcaseLayout, ShowcaseSelectField } from './shared'

const MyApplicationsListShowCase = () => {
  const { selectedMyApplicationState: myApplicationState, setSelectedMyApplicationState } =
    useMyApplicationsFilters()
  const [scenario, setScenario] = useState<ListScenario>('withItems')

  const applications = useMemo(
    () => createMockApplications(myApplicationState, scenario),
    [myApplicationState, scenario],
  )
  const queryClient = useMemo(
    () => createMockQueryClient(applications, myApplicationState),
    [applications, myApplicationState],
  )

  return (
    <ShowcaseLayout
      controls={
        <>
          <ShowcaseSelectField
            label="Status"
            options={sectionOptions}
            value={myApplicationState}
            onChange={setSelectedMyApplicationState}
          />
          <ShowcaseSelectField
            label="List content"
            options={listScenarioOptions}
            value={scenario}
            onChange={setScenario}
          />
        </>
      }
    >
      {/* key forces a remount so the freshly seeded QueryClient is picked up */}
      <QueryClientProvider client={queryClient}>
        <div className="bg-background-passive-base" key={`${myApplicationState}-${scenario}`}>
          <FormDefinitionSlugTitleMapProvider
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
          >
            <MyApplicationsPageContent />
          </FormDefinitionSlugTitleMapProvider>
        </div>
      </QueryClientProvider>
    </ShowcaseLayout>
  )
}

export default MyApplicationsListShowCase
