import cx from 'classnames'
import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

type MyApplicationsHeaderBase = {
  title: string
}

type HeaderNavigationItemBase = {
  title: string
  tag: ApplicationsListVariant
}

export const slovakToEnglishSectionNames: Record<string, ApplicationsListVariant> = {
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

// TODO accessibility - refactor to use Tabs from react-aria-components
const MyApplicationsHeader = (props: MyApplicationsHeaderBase) => {
  const { title } = props
  const { t } = useTranslation('account')
  const router = useRouter()
  const section = slovakToEnglishSectionNames[router.query.sekcia as ApplicationsListVariant]

  const headerNavigationList: HeaderNavigationItemBase[] = [
    { title: t('account_section_applications.navigation_sent'), tag: 'SENT' },
    { title: t('account_section_applications.navigation_sending'), tag: 'SENDING' },
    { title: t('account_section_applications.navigation_draft'), tag: 'DRAFT' },
  ]

  return (
    <div className="bg-gray-50">
      <span className="m-auto flex h-full w-full max-w-screen-lg flex-col justify-end gap-4 pt-6 lg:gap-6 lg:px-0 lg:pt-14">
        <h1 className="text-h1 pl-4 lg:pl-0">{title}</h1>
        <ul className="flex gap-0 lg:gap-12">
          {headerNavigationList.map((item, i) => (
            <li className="w-full lg:w-max" key={i}>
              <button
                onClick={() => {
                  router
                    .push(
                      {
                        pathname: router.pathname,
                        query: { ...router.query, sekcia: englishToSlovakSectionNames[item.tag] },
                      },
                      undefined,
                      { shallow: true },
                    )
                    .catch((error) => logger.error(error))
                }}
                type="button"
                className={cx(
                  'text-20 w-full cursor-pointer border-b-2 py-4 transition-all',
                  'hover:text-20-semibold hover:border-gray-700 ',
                  {
                    'text-20-semibold border-b-2 border-gray-700': section === item.tag,
                  },
                  {
                    'border-transparent': section !== item.tag,
                  },
                )}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </span>
    </div>
  )
}

export default MyApplicationsHeader
