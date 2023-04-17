import MyApplicationsConceptList, {
  MyApplicationsConceptCardBase,
} from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsConceptList'
import MyApplicationsHeader from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsHeader'
import MyApplicationsSentList, {
  MyApplicationsSentCardBase,
} from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSentList'
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

const MyApplicationsSection = () => {
  const { t } = useTranslation('account')

  const [applicationsState, setApplicationsState] = useState<'sent' | 'concept'>('sent')

  return (
    <div className="flex flex-col">
      <MyApplicationsHeader
        applicationsState={applicationsState}
        setApplicationsState={setApplicationsState}
        title={t('account_section_applications.navigation')}
      />
      {applicationsState === 'sent' && <MyApplicationsSentList cards={sentCards} />}
      {applicationsState === 'concept' && <MyApplicationsConceptList cards={conceptCards} />}
    </div>
  )
}

export default MyApplicationsSection
