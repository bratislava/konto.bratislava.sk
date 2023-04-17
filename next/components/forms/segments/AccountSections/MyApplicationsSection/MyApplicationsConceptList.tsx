import MyApplicationCardsPlaceholder from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationCardsPlaceholder'
import MyApplicationsConceptCard from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsConceptCard'
import Pagination from 'components/forms/simple-components/Pagination/Pagination'
import React, { useState } from 'react'

const ITEMS_PER_PAGE = 9

export type MyApplicationsConceptCardBase = {
  title: string
  subtitle: string
  category: string
  createDate: string
}

type MyApplicationsListBase = {
  cards: MyApplicationsConceptCardBase[]
}

const MyApplicationsConceptList = ({ cards }: MyApplicationsListBase) => {
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
                <MyApplicationsConceptCard
                  title={card.title}
                  subtitle={card.subtitle}
                  category={card.category}
                  createDate={card.createDate}
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

export default MyApplicationsConceptList
