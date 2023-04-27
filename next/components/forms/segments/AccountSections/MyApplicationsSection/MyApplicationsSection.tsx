import MyApplicationsConceptList, {
  MyApplicationsConceptCardBase,
} from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsConceptList'
import MyApplicationsHeader from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsHeader'
import MyApplicationsSentList, {
  MyApplicationsSentCardBase,
} from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSentList'
import { useMyApplicationPageStateContext } from 'components/forms/states/MyApplicationPageState'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

const sentCards: MyApplicationsSentCardBase[] = [
  {
    title: 'Názov stavby dotiahnutý zo žiadosti',
    subtitle: 'Názov stavby/projektu',
    sentDate: '29. september 2022',
    category: 'Záväzné stanovisko k investičnej činnosti',
    status: 'success',
    statusDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    sentDate: '29. september 2022',
    status: 'warning',
    statusDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    sentDate: '29. september 2022',
    status: 'negative',
    statusDate: '29. september 2022',
  },
  {
    title: 'Názov stavby dotiahnutý zo žiadosti',
    subtitle: 'Názov stavby/projektu',
    sentDate: '29. september 2022',
    category: 'Záväzné stanovisko k investičnej činnosti',
    status: 'success',
    statusDate: '29. september 2022',
  },
  {
    title: 'Názov stavby dotiahnutý zo žiadosti',
    subtitle: 'Názov stavby/projektu',
    sentDate: '29. september 2022',
    category: 'Záväzné stanovisko k investičnej činnosti',
    status: 'success',
    statusDate: '29. september 2022',
  },
  {
    title: 'Názov stavby dotiahnutý zo žiadosti',
    subtitle: 'Názov stavby/projektu',
    sentDate: '29. september 2022',
    category: 'Záväzné stanovisko k investičnej činnosti',
    status: 'success',
    statusDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    sentDate: '29. september 2022',
    status: 'warning',
    statusDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    sentDate: '29. september 2022',
    status: 'negative',
    statusDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    sentDate: '29. september 2022',
    status: 'warning',
    statusDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    sentDate: '29. september 2022',
    status: 'negative',
    statusDate: '29. september 2022',
  },
]
const conceptCards: MyApplicationsConceptCardBase[] = [
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    createDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    createDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    createDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    createDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    createDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    createDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    createDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    createDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    createDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    createDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    createDate: '29. september 2022',
  },
  {
    title: 'Názov podania',
    subtitle: 'Subcontent',
    category: 'Kategória',
    createDate: '29. september 2022',
  },
]

type MyApplicationsSectionBase = {
  isProductionDeploy: boolean
}

const MyApplicationsSection = ({ isProductionDeploy }: MyApplicationsSectionBase) => {
  const { t } = useTranslation('account')
  const { applicationsState } = useMyApplicationPageStateContext()
  const [isEmptyList, setIsEmptyList] = useState<boolean>(false)

  return (
    <div className="flex flex-col">
      <MyApplicationsHeader title={t('account_section_applications.navigation')} />
      {applicationsState === 'sent' && (
        <MyApplicationsSentList cards={!isEmptyList ? sentCards : []} />
      )}
      {applicationsState === 'concept' && (
        <MyApplicationsConceptList cards={!isEmptyList ? conceptCards : []} />
      )}
      {/* Temporary button only for dev */}
      {!isProductionDeploy && (
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
