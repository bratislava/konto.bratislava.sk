import cx from 'classnames'
import { useGlobalStateContext } from 'components/forms/states/GlobalState'
import { useTranslation } from 'next-i18next'

type MyApplicationsHeaderBase = {
  title: string
}

type HeaderNavigationItemBase = {
  title: string
  tag: 'SENT' | 'SENDING' | 'DRAFT'
}

// TODO accessibility - refactor to use Tabs from react-aria-components
const MyApplicationsHeader = (props: MyApplicationsHeaderBase) => {
  const { title } = props
  const { t } = useTranslation('account')
  const { globalState, setGlobalState } = useGlobalStateContext()

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
                type="button"
                onClick={() => setGlobalState({ applicationsActiveMenuItem: item.tag })}
                className={cx(
                  'text-20 w-full cursor-pointer border-b-2 py-4 transition-all',
                  'hover:text-20-semibold hover:border-gray-700 ',
                  {
                    'text-20-semibold border-b-2 border-gray-700':
                      globalState.applicationsActiveMenuItem === item.tag,
                  },
                  {
                    'border-transparent': globalState.applicationsActiveMenuItem !== item.tag,
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
