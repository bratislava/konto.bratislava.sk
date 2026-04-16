import { useQuery } from '@tanstack/react-query'
import { AuthSession } from 'aws-amplify/auth'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { GetFormsResponseDto } from 'openapi-clients/forms'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import MyApplicationsList, {
  getDraftApplications,
} from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsList'
import logger from '@/src/frontend/utils/logger'
import { ApplicationsListVariant, sections } from '@/src/pages/moje-ziadosti'

type HeaderNavigationItemBase = {
  title: string
  tag: ApplicationsListVariant
}

const englishToSlovakSectionNames: Record<ApplicationsListVariant, string> = {
  SENT: 'odoslane',
  SENDING: 'odosiela-sa',
  DRAFT: 'koncepty',
}

// this was moved from server side props to client side react-query beacause requests took too long (3-5 second)
// and user had no visual feedback and it looked like page wasn't doing anything after click on 'moje-ziadosti' nav link
// when this task https://github.com/bratislava/konto.bratislava.sk/issues/670 is done it could be moved back to server side props
export const getTotalNumberOfApplications = async (
  variant: ApplicationsListVariant,
  emailFormSlugs: string[],
  getSsrAuthSession?: () => Promise<AuthSession>,
) => {
  const firstPage = await getDraftApplications(variant, 1, emailFormSlugs, getSsrAuthSession)
  if (firstPage.countPages === 0) return 0

  const lastPage = await getDraftApplications(
    variant,
    firstPage.countPages,
    emailFormSlugs,
    getSsrAuthSession,
  )

  return (firstPage.countPages - 1) * firstPage.pagination + lastPage.items.length
}

const useTotalCount = (variant: ApplicationsListVariant, emailFormSlugs: string[]) => {
  const { data, refetch } = useQuery({
    // `emailFormSlugs` is stable and should be part of the key
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [`ApplicationsCount_${variant}`, variant],
    queryFn: () => getTotalNumberOfApplications(variant, emailFormSlugs),
  })

  return { data, refetch }
}

type MyApplicationsSectionProps = {
  selectedSection: ApplicationsListVariant
  applications?: GetFormsResponseDto
  formDefinitionSlugTitleMap: Record<string, string>
  emailFormSlugs: string[]
}

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=10974-95085
 */

const MyApplicationsPageContent = ({
  selectedSection,
  applications,
  formDefinitionSlugTitleMap,
  emailFormSlugs,
}: MyApplicationsSectionProps) => {
  const { t } = useTranslation('account')
  const title = t('account_section_applications.navigation')
  const router = useRouter()

  const headerNavigationList: HeaderNavigationItemBase[] = [
    { title: t('account_section_applications.navigation_sent'), tag: 'SENT' },
    { title: t('account_section_applications.navigation_sending'), tag: 'SENDING' },
    { title: t('account_section_applications.navigation_draft'), tag: 'DRAFT' },
  ]

  const totalCounts = {
    SENT: useTotalCount('SENT', emailFormSlugs),
    SENDING: useTotalCount('SENDING', emailFormSlugs),
    DRAFT: useTotalCount('DRAFT', emailFormSlugs),
  }

  const refetchApplicationsCount = async () => {
    totalCounts.SENT.refetch().catch((error) => logger.error(error))
    totalCounts.SENDING.refetch().catch((error) => logger.error(error))
    totalCounts.DRAFT.refetch().catch((error) => logger.error(error))
  }

  return (
    <Tabs
      selectedKey={selectedSection}
      onSelectionChange={(key) => {
        router
          .push(
            {
              pathname: router.pathname,
              query: {
                ...router.query,
                sekcia: englishToSlovakSectionNames[key as ApplicationsListVariant],
              },
            },
            undefined,
          )
          .catch((error) => logger.error(error))
      }}
      className="flex flex-col"
    >
      <SectionContainer className="bg-gray-50 pt-6 lg:pt-14">
        <div className="size-full flex-col justify-end gap-4 lg:gap-6">
          <h1 className="text-h1 pt-4">{title}</h1>
          <TabList className="scrollbar-hide flex gap-4 overflow-auto whitespace-nowrap pt-6 lg:gap-6 lg:pt-14">
            {headerNavigationList.map((item) => {
              const count = totalCounts[item.tag].data
              const countText = count == null ? '' : ` (${count})`
              const text = `${item.title}${countText}`

              /* Hover without layout shift based on: https://stackoverflow.com/a/20249560 */
              return (
                <Tab
                  key={item.tag}
                  id={item.tag}
                  data-before-text={text}
                  className="text-20 before:text-20-semibold hover:text-20-semibold data-selected:border-b data-selected:border-gray-700 data-selected:text-20-semibold cursor-pointer py-4 text-center transition-all before:invisible before:block before:h-0 before:overflow-hidden before:content-[attr(data-before-text)] hover:border-gray-700"
                >
                  {text}
                </Tab>
              )
            })}
          </TabList>
        </div>
      </SectionContainer>
      <SectionContainer className="py-4 lg:py-8">
        {sections.map((variant) => (
          <TabPanel key={variant} id={variant}>
            <MyApplicationsList
              variant={variant}
              applications={applications}
              refetchApplicationsCount={refetchApplicationsCount}
              formDefinitionSlugTitleMap={formDefinitionSlugTitleMap}
            />
          </TabPanel>
        ))}
      </SectionContainer>
    </Tabs>
  )
}

export default MyApplicationsPageContent
