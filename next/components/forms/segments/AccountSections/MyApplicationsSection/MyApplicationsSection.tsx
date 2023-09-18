import MyApplicationsHeader from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsHeader'
import { useGlobalStateContext } from 'components/forms/states/GlobalState'
import { useTranslation } from 'next-i18next'

import MyApplicationsList from './MyApplicationsList'

const MyApplicationsSection = () => {
  const { t } = useTranslation('account')
  // TODO get rid of tab management through global state, use hash in url instead
  const { globalState } = useGlobalStateContext()

  return (
    <div className="flex flex-col">
      <MyApplicationsHeader title={t('account_section_applications.navigation')} />
      <MyApplicationsList variant={globalState.applicationsActiveMenuItem || 'SENT'} />
    </div>
  )
}

export default MyApplicationsSection
