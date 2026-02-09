/* eslint-disable switch-case/no-case-curly */
import { ArrowLeftIcon, ArrowRightIcon } from '@assets/ui-icons'
import cn from 'frontend/cn'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

import Button from '../Button'
import usePagination from './usePagination'

type PaginationProps = {
  currentPage: number
  totalCount: number
  onPageChange?: (value: number) => void
}

/**
 * Based on bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/master/next/src/components/common/Pagination/Pagination.tsx
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16917-4511&m=dev
 *
 * @param selectedPage
 * @param totalCount
 * @param onPageChange
 * @constructor
 */
const Pagination = ({ currentPage, totalCount, onPageChange = () => {} }: PaginationProps) => {
  const { t } = useTranslation('account')

  const { items } = usePagination({
    count: totalCount,
    page: currentPage,
    onChange: (event, value) => {
      // When not blurred the button stays focused and is confusing.
      ;(event.target as HTMLButtonElement).blur()
      onPageChange(value)
    },
  })

  return (
    <nav>
      <ul
        className="flex flex-wrap items-center justify-center gap-1 lg:gap-2"
        data-cy="pagination"
      >
        {items.map(
          ({ page, type, selected, disabled, onPress, 'aria-current': ariaCurrent }, index) => {
            let children: ReactNode = null

            // eslint-disable-next-line default-case
            switch (type) {
              case 'start-ellipsis':
              case 'end-ellipsis':
                children = '…'

                break

              case 'page':
                children = (
                  <Button
                    variant={selected ? 'black-solid' : 'black-outline'}
                    isDisabled={disabled}
                    onPress={onPress}
                    aria-current={ariaCurrent}
                    aria-label={t('Pagination.aria.goToPage', { page })}
                    className="flex size-10 shrink-0 grow-0 items-center justify-center rounded-full lg:size-12"
                  >
                    {page}
                  </Button>
                )

                break

              case 'previous':
              case 'next': {
                let icon: ReactNode
                let ariaLabel = ''
                if (type === 'previous') {
                  icon = <ArrowLeftIcon />
                  ariaLabel = t('Pagination.aria.goToPreviousPage')
                }
                if (type === 'next') {
                  icon = <ArrowRightIcon />
                  ariaLabel = t('Pagination.aria.goToNextPage')
                }

                children = (
                  <Button
                    variant="black-plain"
                    isDisabled={disabled}
                    onPress={onPress}
                    aria-label={ariaLabel}
                    icon={icon}
                    className="rounded-full"
                  />
                )

                break
              }
              // No default
            }

            return (
              <li
                key={index}
                className={cn({
                  'text-size-p-small flex w-10 items-center justify-center font-semibold lg:w-12':
                    type === 'start-ellipsis' || type === 'end-ellipsis',
                  'lg:mr-2': type === 'previous',
                  'lg:ml-2': type === 'next',
                })}
              >
                {children}
              </li>
            )
          },
        )}
      </ul>
    </nav>
  )
}

export default Pagination
