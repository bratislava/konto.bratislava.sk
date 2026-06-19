import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import Icon from '@/src/components/icon-components/Icon'
import MLink from '@/src/components/simple-components/MLink'

type LinkRowCardProps = {
  title?: string | null
  url: string
}

const LinkRowCard = ({ title, url }: LinkRowCardProps) => {
  const { t } = useTranslation('account')

  return (
    <li>
      <div className={'relative flex flex-row items-center justify-between gap-4 px-6 py-4'}>
        <div className="flex flex-row items-start gap-2 lg:items-center lg:gap-4">
          <Icon
            name="attachment"
            className="size-5 rounded-lg bg-background-passive-base p-0 lg:size-12 lg:bg-background-passive-secondary lg:p-3"
          />

          <div className="flex flex-col gap-1">
            <MLink
              href={url}
              className="line-clamp-3 text-h6 font-bold wrap-anywhere lg:line-clamp-2"
              aria-label={title ?? url}
              stretched
              variant="underlined"
              target="_blank"
              rel="noreferrer title={title}"
            >
              <Typography variant="h6">{title}</Typography>
            </MLink>

            <Typography variant="p-small">{url}</Typography>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Typography variant="p-small" className="hidden lg:block">
            {t('linkRowCard.go_to_document')}
          </Typography>

          <Icon name="arrow-right" />
        </div>
      </div>
    </li>
  )
}

export default LinkRowCard
