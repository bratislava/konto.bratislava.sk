import MyApplicationsList, {
  getDraftApplications,
} from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsList'
import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import { useTranslation } from 'next-i18next'
import { useEffect } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components'

type HeaderNavigationItemBase = {
  title: string
  tag: ApplicationsListVariant
}

const slovakToEnglishSectionNames: Record<string, ApplicationsListVariant> = {
  odoslane: 'SENT',
  'odosiela-sa': 'SENDING',
  koncepty: 'DRAFT',
}

const englishToSlovakSectionNames: Record<ApplicationsListVariant, string> = {
  SENT: 'odoslane',
  SENDING: 'odosiela-sa',
  DRAFT: 'koncepty',
}
const sections = ['SENT', 'SENDING', 'DRAFT'] as const
export type ApplicationsListVariant = (typeof sections)[number]

export const isValidSection = (param: string): param is ApplicationsListVariant => {
  return (sections as readonly string[]).includes(param)
}

export const getTotalNumberOfApplications = async (
  variant: ApplicationsListVariant,
  accessTokenSsrReq: GetServerSidePropsContext['req'],
) => {
  const firstPage = await getDraftApplications(variant, 1, accessTokenSsrReq)
  if (firstPage.countPages === 0) return 0

  const lastPage = await getDraftApplications(variant, firstPage.countPages, accessTokenSsrReq)
  return (firstPage.countPages - 1) * firstPage.pagination + lastPage.items.length
}

type MyApplicationsSectionProps = {
  totalCounts: Record<ApplicationsListVariant, number>
}

const MyApplicationsSection = ({ totalCounts }: MyApplicationsSectionProps) => {
  const { t } = useTranslation('account')
  const title = t('account_section_applications.navigation')
  const router = useRouter()
  const section = slovakToEnglishSectionNames[router.query.sekcia as ApplicationsListVariant]

  const headerNavigationList: HeaderNavigationItemBase[] = [
    { title: t('account_section_applications.navigation_sent'), tag: 'SENT' },
    { title: t('account_section_applications.navigation_sending'), tag: 'SENDING' },
    { title: t('account_section_applications.navigation_draft'), tag: 'DRAFT' },
  ]

  useEffect(() => {
    // If section is not valid, redirect to default section
    if (!section || !isValidSection(section)) {
      router
        .push({
          pathname: router.pathname,
          query: { ...router.query, sekcia: 'odoslane' },
        })
        .catch((error) => logger.error(error))
    }
  }, [section, router])

  return (
    <Tabs
      selectedKey={section}
      onSelectionChange={(key) => {
        router
          .push(
            {
              pathname: router.pathname,
              query: { ...router.query, sekcia: englishToSlovakSectionNames[key] },
            },
            undefined,
            { shallow: true },
          )
          .catch((error) => logger.error(error))
      }}
      className="flex flex-col"
    >
      <div className="bg-gray-50 pl-8 lg:pl-0">
        <div className="m-auto h-full w-full max-w-screen-lg flex-col justify-end gap-4 pt-6 lg:gap-6 lg:pt-14">
          <h1 className="text-h1 pt-4">{title}</h1>
          <TabList className="flex max-w-screen-lg gap-4 overflow-auto whitespace-nowrap pt-6 scrollbar-hide lg:gap-6 lg:pt-14">
            {headerNavigationList.map((item) => (
              <Tab
                key={item.tag}
                id={item.tag}
                className="text-20 hover:text-20-semibold data-[selected]:text-20-semibold cursor-pointer py-4 transition-all hover:border-gray-700 data-[selected]:border-b-2 data-[selected]:border-gray-700"
              >
                {item.title}
                {totalCounts[item.tag] !== undefined ? ` (${totalCounts[item.tag]})` : ''}
              </Tab>
            ))}
          </TabList>
        </div>
      </div>
      {sections.map((variant) => (
        <TabPanel id={variant}>
          <MyApplicationsList variant={variant} />
        </TabPanel>
      ))}
    </Tabs>
  )
}

export default MyApplicationsSection
