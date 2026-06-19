import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import Icon from '@/src/components/icon-components/Icon'
import cn from '@/src/utils/cn'

type LinkRowCardProps = {
  title?: string | null
  url: string
  isLastItem?: boolean
}

const LinkRowCard = ({ title, url, isLastItem = false }: LinkRowCardProps) => {
  const { t } = useTranslation('account')

  return (
    <li>
      <a href={url} rel="noreferrer" aria-label={title} className="px-6">
        <div
          className={cn(
            'flex flex-row items-center justify-between gap-4 border-b border-gray-200 py-4',
            { 'border-b-0': isLastItem },
          )}
        >
          <div className="flex flex-row items-start gap-2 sm:items-center sm:gap-4">
            <Icon
              name="attachment"
              className="size-5 rounded-lg bg-background-passive-base p-0 sm:size-12 sm:bg-background-passive-secondary sm:p-3"
            />

            <div className="flex flex-col gap-1">
              <Typography variant="h6">{title}</Typography>

              <Typography variant="p-small">{url}</Typography>
            </div>
          </div>

          <div className="flex flex-row items-center gap-2">
            <Typography variant="p-small" className="hidden sm:block">
              {t('documents.link_row_card.go_to_document')}
            </Typography>

            <Icon name="arrow-right" />
          </div>
        </div>
      </a>
    </li>
  )
}

export default LinkRowCard
