import MyApplicationsConceptList from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsConceptList'
import MyApplicationsHeader from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsHeader'
import MyApplicationsSentList from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSentList'
import { useGlobalStateContext } from 'components/forms/states/GlobalState'
import { MyApplicationsConceptCardBase, MyApplicationsSentCardBase } from 'frontend/api/mocks/mocks'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { isProductionDeployment } from '../../../../../frontend/utils/general'

type MyApplicationsSectionBase = {
  conceptCardsList: MyApplicationsConceptCardBase[]
  sentCardsList: MyApplicationsSentCardBase[]
}

const MyApplicationsSection = ({ conceptCardsList, sentCardsList }: MyApplicationsSectionBase) => {
  const { t } = useTranslation('account')
  const { globalState } = useGlobalStateContext()
  const [isEmptyList, setIsEmptyList] = useState<boolean>(false)

  return (
    <div className="flex flex-col">
      <MyApplicationsHeader title={t('account_section_applications.navigation')} />
      {globalState.applicationsActiveMenuItem === 'sent' && (
        <MyApplicationsSentList cards={!isEmptyList ? sentCardsList : []} />
      )}
      {globalState.applicationsActiveMenuItem === 'concept' && (
        <MyApplicationsConceptList cards={!isEmptyList ? conceptCardsList : []} />
      )}
      {/* Temporary button only for dev */}
      {!isProductionDeployment() && (
        <button
          className="text-p3-semibold bg-gray-200 w-max py-1 px-2 mt-4 lg:mt-0 ml-4 md:ml-0"
          onClick={() => setIsEmptyList((prev) => !prev)}
          type="button"
        >
          {!isEmptyList ? 'Show Placeholder' : 'Show Card List'}
        </button>
      )}
    </div>
  )
}

export default MyApplicationsSection
