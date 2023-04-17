import MyApplicationsHeader from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsHeader'
import MyApplicationsSentCard from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSentCard'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

export type MyApplicationsCardBase = {
  title: string
  subtitle: string
  category: string
  sentDate: string
  statusDate?: string
  status: 'negative' | 'warning' | 'success'
}

const cards: MyApplicationsCardBase[] = [
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

const MyApplicationsSection = () => {
  const { t } = useTranslation('account')

  const ITEMS_PER_PAGE = 9

  const [applicationsState, setApplicationsState] = useState<'sent' | 'concept'>('sent')
  const [currentPage, setCurrentPage] = useState<number>(1)

  return (
    <div className="flex flex-col">
      <MyApplicationsHeader
        applicationsState={applicationsState}
        setApplicationsState={setApplicationsState}
        title={t('account_section_applications.navigation')}
      />
      <div className="max-w-screen-lg w-full m-auto">
        <ul className="lg:px-0 my-0 lg:my-12 px-4 sm:px-6 flex flex-col gap-0 lg:gap-3">
          {applicationsState === 'sent' &&
            cards
              .filter(
                (_, i) =>
                  i + 1 <= currentPage * ITEMS_PER_PAGE &&
                  i + 1 > (currentPage - 1) * ITEMS_PER_PAGE,
              )
              .map((card, i) => (
                <li key={i}>
                  <MyApplicationsSentCard
                    title={card.title}
                    subtitle={card.subtitle}
                    category={card.category}
                    sentDate={card.sentDate}
                    status={card.status}
                    statusDate={card.statusDate}
                  />
                </li>
              ))}
        </ul>
        <div className="my-4 lg:my-8">
          <Pagination
            count={Math.ceil(cards.length / ITEMS_PER_PAGE)}
            selectedPage={currentPage}
            onChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}

export default MyApplicationsSection
