import cx from 'classnames'
import { useMyApplicationPageStateContext } from 'components/forms/states/MyApplicationPageState'
import { useTranslation } from 'next-i18next'

type MyApplicationsHeaderBase = {
  title: string
}

type HeaderNavigationItemBase = {
  title: string
  tag: 'sent' | 'concept'
}

const MyApplicationsHeader = (props: MyApplicationsHeaderBase) => {
  const { title } = props
  const { t } = useTranslation('account')
  const { applicationsState, setApplicationsState } = useMyApplicationPageStateContext()

  const headerNavigationList: HeaderNavigationItemBase[] = [
    { title: t('account_section_applications.navigation_sent'), tag: 'sent' },
    { title: t('account_section_applications.navigation_concept'), tag: 'concept' },
  ]
  return (
    <div className="bg-gray-50">
      <span className="pt-6 flex flex-col justify-end gap-4 lg:gap-6 w-full h-full max-w-screen-lg m-auto lg:px-0 lg:pt-14">
        <h1 className="text-h1 pl-4 lg:pl-0">{title}</h1>
        <ul className="flex gap-0 lg:gap-12">
          {headerNavigationList.map((item, i) => (
            <li className="lg:w-max w-full" key={i}>
              <button
                type="button"
                onClick={() => setApplicationsState(item.tag)}
                className={cx(
                  'text-20 w-full lg:w-[92px] transition-all py-4 border-b-2 cursor-pointer',
                  'hover:text-20-semibold hover:border-gray-700 ',
                  {
                    'text-20-semibold border-b-2 border-gray-700': applicationsState === item.tag,
                  },
                  {
                    'border-transparent': applicationsState !== item.tag,
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
