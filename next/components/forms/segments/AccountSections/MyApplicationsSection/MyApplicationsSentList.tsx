import MyApplicationCardsPlaceholder from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationCardsPlaceholder'
import MyApplicationsSentCard from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSentCard'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import React, { useState } from 'react'

const ITEMS_PER_PAGE = 9

export type MyApplicationsSentCardBase = {
  id?: string
  title: string
  subtitle: string
  category: string
  sentDate: string
  statusDate?: string
  status: 'negative' | 'warning' | 'success'
}

type MyApplicationsListBase = {
  cards: MyApplicationsSentCardBase[]
}

const MyApplicationsSentList = ({ cards }: MyApplicationsListBase) => {
  const [currentPage, setCurrentPage] = useState<number>(1)
  return (
    <div className="max-w-screen-lg w-full m-auto">
      <ul className="lg:px-0 my-0 lg:my-8 px-4 sm:px-6 flex flex-col gap-0 lg:gap-4">
        {cards.length > 0 ? (
          cards
            .filter(
              (_, i) =>
                i + 1 <= currentPage * ITEMS_PER_PAGE && i + 1 > (currentPage - 1) * ITEMS_PER_PAGE,
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
            ))
        ) : (
          <MyApplicationCardsPlaceholder />
        )}
      </ul>
      {cards.length > 0 && (
        <div className="my-4 lg:my-8">
          <Pagination
            count={Math.ceil(cards.length / ITEMS_PER_PAGE)}
            selectedPage={currentPage}
            onChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}

export default MyApplicationsSentList
