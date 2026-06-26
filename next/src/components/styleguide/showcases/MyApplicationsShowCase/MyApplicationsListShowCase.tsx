import { QueryClientProvider } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import MyApplicationsPageContent from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsPageContent'
import { ApplicationsListVariant } from '@/src/pages/moje-ziadosti'

import {
  createMockApplications,
  createMockQueryClient,
  emailFormSlugs,
  formDefinitionSlugTitleMap,
  ListScenario,
  listScenarioOptions,
  sectionOptions,
} from './mockData'
import { ShowcaseLayout, ShowcaseSelectField } from './shared'

const MyApplicationsListShowCase = () => {
  const [section, setSection] = useState<ApplicationsListVariant>('SENT')
  const [scenario, setScenario] = useState<ListScenario>('withItems')

  const applications = useMemo(() => createMockApplications(section, scenario), [section, scenario])
  const queryClient = useMemo(
    () => createMockQueryClient(applications, section),
    [applications, section],
  )

  return (
    <ShowcaseLayout
      controls={
        <>
          <ShowcaseSelectField
            label="Section (selectedSection)"
            options={sectionOptions}
            value={section}
            onChange={setSection}
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
        <div className="bg-background-passive-base" key={`${section}-${scenario}`}>
          <MyApplicationsPageContent
            selectedSection={section}
            applications={applications}
            formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
            emailFormSlugs={emailFormSlugs}
          />
        </div>
      </QueryClientProvider>
    </ShowcaseLayout>
  )
}

export default MyApplicationsListShowCase
