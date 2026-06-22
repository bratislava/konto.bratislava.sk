import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import Icon from '@/src/components/icon-components/Icon'

type Props = {
  title?: string | null
  url: string
  ariaLabel?: string
}

/**
 * Figma: TODO
 */

const ExternalDocumentRowCard = ({ title, url, ariaLabel }: Props) => {
  const { t } = useTranslation('account')

  return (
    <li>
      <div
        className={
          'relative flex flex-row items-center justify-between gap-4 px-6 py-4 wrapper-focus-ring'
        }
      >
        <div className="flex flex-row items-start gap-2 lg:items-center lg:gap-4">
          <Icon
            name="attachment"
            className="size-5 rounded-lg bg-background-passive-base p-0 lg:size-12 lg:bg-background-passive-secondary lg:p-3"
          />

          <div className="flex flex-col gap-1">
            <Typography variant="h6" className="line-clamp-3 wrap-anywhere lg:line-clamp-2">
              {title}
            </Typography>

            <Typography variant="p-small">{url}</Typography>
          </div>
        </div>
        {/* Screen: desktop */}
        <Button
          variant="plain"
          href={url}
          stretched
          aria-label={ariaLabel ?? `${t('ExternalDocumentRowCard.go_to_document')}: ${title}`}
          className="whitespace-nowrap max-lg:hidden"
        >
          {t('ExternalDocumentRowCard.go_to_document')}
        </Button>
        {/* Screen: mobile */}
        <Button
          variant="unstyled"
          href={url}
          stretched
          aria-label={ariaLabel ?? `${t('ExternalDocumentRowCard.go_to_document')}: ${title}`}
          className="ml-auto p-1.5 lg:hidden"
        />
      </div>
    </li>
  )
}

export default ExternalDocumentRowCard
