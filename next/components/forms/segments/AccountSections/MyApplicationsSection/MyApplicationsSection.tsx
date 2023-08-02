import MyApplicationsHeader from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsHeader'
import MyApplicationsSentList from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSentList'
import { useGlobalStateContext } from 'components/forms/states/GlobalState'
import { useTranslation } from 'next-i18next'

import MyApplicationsDraftList from './MyApplicationsDraftList'

const MyApplicationsSection = () => {
  const { t } = useTranslation('account')
  const { globalState } = useGlobalStateContext()

  return (
    <div className="flex flex-col">
      <MyApplicationsHeader title={t('account_section_applications.navigation')} />
      {globalState.applicationsActiveMenuItem === 'sent' && <MyApplicationsSentList />}
      {globalState.applicationsActiveMenuItem === 'concept' && <MyApplicationsDraftList />}
    </div>
  )
}

export default MyApplicationsSection
